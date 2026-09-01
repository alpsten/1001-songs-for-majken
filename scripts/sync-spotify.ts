import fs from "fs"
import path from "path"
import matter from "gray-matter"

const contentRoot = path.resolve("content")
const songsDir = path.join(contentRoot, "songs")
const artistsDir = path.join(contentRoot, "artists")

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN

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

// Strips reissue/edit noise Spotify tacks onto track names (remasters,
// "Taylor's Version", anniversary editions, radio edits, ...) so new
// entries use a clean canonical title and correctly match existing
// hand-curated songs instead of creating a near-duplicate.
function cleanTitle(title: string): string {
  let value = title
  let changed = true
  while (changed) {
    const before = value
    value = value
      .replace(/\s*-\s*(\d{4}\s+)?remaster(ed)?(\s+(version|\d{4}))?\s*$/i, "")
      .replace(/\s*\((\d{4}\s+)?remaster(ed)?(\s+\d{4})?\)\s*$/i, "")
      .replace(/\s*\(taylor'?s version\)\s*$/i, "")
      .replace(/\s*\(from the vault\)\s*$/i, "")
      .replace(/\s*-\s*single version\s*$/i, "")
      .replace(/\s*\(single version\)\s*$/i, "")
      .replace(/\s*-\s*\d+(st|nd|rd|th)\s+anniversary(\s+edition)?\s*$/i, "")
      .replace(/\s*\(\d+(st|nd|rd|th)\s+anniversary(\s+edition)?\)\s*$/i, "")
      .replace(/\s+-\s+.*radio edit\s*$/i, "")
      .replace(/\s*-\s*edit\s*$/i, "")
    changed = value !== before
  }
  return value.trim()
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
  // Spotify's Client Credentials flow (app-only, no logged-in user) can no
  // longer read playlist contents, even for fully public playlists. Reading
  // a playlist now requires a token obtained on behalf of a real user, via
  // the Authorization Code flow's long-lived refresh token instead.
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN!,
    }),
  })
  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { access_token: string; refresh_token?: string }
  if (data.refresh_token && data.refresh_token !== REFRESH_TOKEN) {
    console.warn(
      "  Spotify issued a new refresh token. Update the SPOTIFY_REFRESH_TOKEN secret with:\n  " +
        data.refresh_token
    )
  }
  return data.access_token
}

async function fetchPlaylistTracks(token: string): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = []
  // Spotify renamed GET /playlists/{id}/tracks to GET /playlists/{id}/items,
  // and the "track" field inside each item to "item" (which can also be a
  // podcast episode, hence the type check below).
  let url: string | null =
    `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/items` +
    `?limit=100&fields=next,items(item(id,name,type,artists(id,name),album(name,release_date),external_urls))`

  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`Spotify playlist fetch failed: ${res.status} ${await res.text()}`)
    const data = (await res.json()) as {
      items: { item: (SpotifyTrack & { type: string }) | null }[]
      next: string | null
    }
    for (const entry of data.items) {
      if (entry.item && entry.item.id && entry.item.type === "track") tracks.push(entry.item)
    }
    url = data.next
  }
  return tracks
}

function main() {
  if (!CLIENT_ID || !CLIENT_SECRET || !PLAYLIST_ID || !REFRESH_TOKEN) {
    console.error(
      "Missing SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_PLAYLIST_ID, or SPOTIFY_REFRESH_TOKEN environment variables."
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

    const cleanedTitle = cleanTitle(track.name)
    const normalizedTitle = slugify(cleanedTitle)
    const matchIndex = unlinkedSongs.findIndex(
      (song) => slugify(cleanTitle(String(song.data.title ?? ""))) === normalizedTitle
    )

    if (matchIndex !== -1) {
      const [song] = unlinkedSongs.splice(matchIndex, 1)
      song.data.spotifyId = track.id
      writeEntry(songsDir, song.data.slug, song.data, song.body)
      songsBySpotifyId.set(track.id, song)
      linked++
      continue
    }

    const artistIds = track.artists.map(resolveArtist)
    const slug = uniqueSlug(slugify(cleanedTitle), allSlugs)
    const id = `song-${slug}`
    allSlugs.add(slug)
    allIds.add(id)
    const year = track.album.release_date ? Number(track.album.release_date.slice(0, 4)) : undefined

    const data = {
      id,
      slug,
      title: cleanedTitle,
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
    console.log(`  + new song: ${cleanedTitle} — ${track.artists.map((a) => a.name).join(", ")}`)
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
