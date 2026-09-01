import fs from "fs"
import path from "path"
import matter from "gray-matter"

const contentRoot = path.resolve("content")
const songsDir = path.join(contentRoot, "songs")
const artistsDir = path.join(contentRoot, "artists")

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID

type SpotifyArtistRef = { id: string; name: string }
type SpotifyTrack = {
  id: string
  name: string
  artists: SpotifyArtistRef[]
  album: { name: string; release_date: string }
  external_urls: { spotify: string }
}

type ParsedFile = {
  file: string
  path: string
  data: Record<string, any>
  body: string
}

function readFolder(dir: string): ParsedFile[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const filePath = path.join(dir, f)
      const raw = fs.readFileSync(filePath, "utf-8")
      const { data, content } = matter(raw)
      return { file: f, path: filePath, data, body: content }
    })
}

function normalizeDates(data: Record<string, any>) {
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) data[key] = value.toISOString().slice(0, 10)
  }
}

function writeEntry(dir: string, slug: string, data: Record<string, any>, body: string) {
  normalizeDates(data)
  fs.mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, `${slug}.md`)
  fs.writeFileSync(filePath, matter.stringify(body, data))
  return filePath
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })
  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

async function fetchPlaylistTracks(token: string): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = []
  let url: string | null =
    `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks` +
    `?limit=100&fields=next,items(track(id,name,artists(id,name),album(name,release_date),external_urls))`

  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`Spotify playlist fetch failed: ${res.status} ${await res.text()}`)
    const data = (await res.json()) as { items: { track: SpotifyTrack | null }[]; next: string | null }
    for (const item of data.items) {
      if (item.track && item.track.id) tracks.push(item.track)
    }
    url = data.next
  }
  return tracks
}

function main() {
  if (!CLIENT_ID || !CLIENT_SECRET || !PLAYLIST_ID) {
    console.error(
      "Missing SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, or SPOTIFY_PLAYLIST_ID environment variables."
    )
    process.exit(1)
  }
  return run()
}

async function run() {
  const songs = readFolder(songsDir)
  const artists = readFolder(artistsDir)
  const themes = readFolder(path.join(contentRoot, "themes"))
  const memories = readFolder(path.join(contentRoot, "memories"))

  const allIds = new Set<string>()
  const allSlugs = new Set<string>()
  for (const entry of [...songs, ...artists, ...themes, ...memories]) {
    if (entry.data.id) allIds.add(entry.data.id)
    if (entry.data.slug) allSlugs.add(entry.data.slug)
  }

  const songsBySpotifyId = new Map<string, ParsedFile>()
  const unlinkedSongs: ParsedFile[] = []
  for (const song of songs) {
    if (song.data.spotifyId) songsBySpotifyId.set(song.data.spotifyId, song)
    else unlinkedSongs.push(song)
  }

  const artistsBySpotifyId = new Map<string, ParsedFile>()
  const artistsByName = new Map<string, ParsedFile>()
  for (const artist of artists) {
    if (artist.data.spotifyId) artistsBySpotifyId.set(artist.data.spotifyId, artist)
    if (artist.data.name) artistsByName.set(slugify(artist.data.name), artist)
  }

  console.log("Fetching Spotify playlist...")
  const token = await getAccessToken()
  const tracks = await fetchPlaylistTracks(token)
  console.log(`  found ${tracks.length} tracks on the playlist`)

  const seenTrackIds = new Set(tracks.map((t) => t.id))
  let created = 0
  let linked = 0
  let restored = 0
  let archived = 0
  let artistsCreated = 0

  function resolveArtist(ref: SpotifyArtistRef): string {
    const existingBySpotifyId = artistsBySpotifyId.get(ref.id)
    if (existingBySpotifyId) return existingBySpotifyId.data.id

    const existingByName = artistsByName.get(slugify(ref.name))
    if (existingByName) {
      if (!existingByName.data.spotifyId) {
        existingByName.data.spotifyId = ref.id
        writeEntry(artistsDir, existingByName.data.slug, existingByName.data, existingByName.body)
      }
      artistsBySpotifyId.set(ref.id, existingByName)
      return existingByName.data.id
    }

    const slug = uniqueSlug(slugify(ref.name), allSlugs)
    const id = `artist-${slug}`
    allSlugs.add(slug)
    allIds.add(id)
    const data = {
      id,
      slug,
      name: ref.name,
      genreTags: [],
      summary: "[No memory added]",
      spotifyId: ref.id,
    }
    const filePath = writeEntry(artistsDir, slug, data, "")
    const newArtist: ParsedFile = { file: path.basename(filePath), path: filePath, data, body: "" }
    artistsBySpotifyId.set(ref.id, newArtist)
    artistsByName.set(slugify(ref.name), newArtist)
    artistsCreated++
    console.log(`  + new artist: ${ref.name}`)
    return id
  }

  for (const track of tracks) {
    if (songsBySpotifyId.has(track.id)) {
      const song = songsBySpotifyId.get(track.id)!
      if (song.data.status === "archived") {
        song.data.status = "published"
        writeEntry(songsDir, song.data.slug, song.data, song.body)
        restored++
        console.log(`  ~ restored: ${track.name}`)
      }
      continue
    }

    const normalizedTitle = slugify(track.name)
    const matchIndex = unlinkedSongs.findIndex((song) => slugify(String(song.data.title ?? "")) === normalizedTitle)

    if (matchIndex !== -1) {
      const [song] = unlinkedSongs.splice(matchIndex, 1)
      song.data.spotifyId = track.id
      writeEntry(songsDir, song.data.slug, song.data, song.body)
      songsBySpotifyId.set(track.id, song)
      linked++
      continue
    }

    const artistIds = track.artists.map(resolveArtist)
    const slug = uniqueSlug(slugify(track.name), allSlugs)
    const id = `song-${slug}`
    allSlugs.add(slug)
    allIds.add(id)
    const year = track.album.release_date ? Number(track.album.release_date.slice(0, 4)) : undefined

    const data = {
      id,
      slug,
      title: track.name,
      artistIds,
      album: track.album.name,
      year,
      genreTags: [],
      themeIds: [],
      whyItMatters: "[No memory added]",
      addedAt: new Date().toISOString().slice(0, 10),
      status: "published",
      spotifyId: track.id,
      sourceLinks: [{ label: "Spotify", url: track.external_urls.spotify, kind: "spotify" }],
    }
    const filePath = writeEntry(songsDir, slug, data, "")
    const newSong: ParsedFile = { file: path.basename(filePath), path: filePath, data, body: "" }
    songsBySpotifyId.set(track.id, newSong)
    created++
    console.log(`  + new song: ${track.name} — ${track.artists.map((a) => a.name).join(", ")}`)
  }

  for (const song of songs) {
    if (!song.data.spotifyId) continue
    if (song.data.status === "archived") continue
    if (!seenTrackIds.has(song.data.spotifyId)) {
      song.data.status = "archived"
      writeEntry(songsDir, song.data.slug, song.data, song.body)
      archived++
      console.log(`  - archived (removed from playlist): ${song.data.title}`)
    }
  }

  console.log(
    `\n✓ Sync complete: ${created} new songs, ${linked} linked to existing entries, ${restored} restored, ` +
      `${archived} archived, ${artistsCreated} new artists`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
