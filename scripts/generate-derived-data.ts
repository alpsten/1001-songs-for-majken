import fs from "fs"
import path from "path"
import matter from "gray-matter"

const contentRoot = path.resolve("content")
const outputDir = path.resolve("public/data")

type ParsedFile = {
  file: string
  data: Record<string, unknown>
  body: string
}

type SongRecord = Record<string, unknown> & {
  id?: string
  slug?: string
  title?: string
  artistIds?: string[]
  album?: string
  year?: number
  genreTags?: string[]
  addedAt?: string | Date
  status?: string
  story?: string
}

type ArtistRecord = Record<string, unknown> & {
  id?: string
  name?: string
}

function readFolder(folder: string): ParsedFile[] {
  const dir = path.join(contentRoot, folder)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf-8")
      const { data, content } = matter(raw)
      return { file: f, data, body: content.trim() }
    })
}

function write(filename: string, data: unknown) {
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(data, null, 2))
  console.log(`  wrote ${filename}`)
}

function writeText(filename: string, data: string) {
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(path.join(outputDir, filename), data)
  console.log(`  wrote ${filename}`)
}

function formatDate(value: unknown): string {
  if (!value) return ""
  if (value instanceof Date) return value.toISOString().slice(0, 10)

  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toISOString().slice(0, 10)
}

function escapeCsv(value: unknown): string {
  const stringValue = String(value ?? "")
  if (!/[,"\n]/.test(stringValue)) return stringValue
  return `"${stringValue.replace(/"/g, "\"\"")}"`
}

function createSongCatalogCsv(songs: SongRecord[], artists: ArtistRecord[]): string {
  const artistNamesById = new Map(
    artists
      .filter((artist): artist is ArtistRecord & { id: string; name: string } => Boolean(artist.id && artist.name))
      .map((artist) => [artist.id, artist.name])
  )

  const rows = songs
    .slice()
    .sort((a, b) => String(a.title ?? "").localeCompare(String(b.title ?? "")))
    .map((song) => ({
      id: song.id ?? "",
      artist: (song.artistIds ?? []).map((artistId) => artistNamesById.get(artistId) ?? artistId).join(", "),
      song: song.title ?? "",
      album: song.album ?? "",
      year: song.year ?? "",
      genre: (song.genreTags ?? []).join(", "),
      comment: String(song.story ?? "").replace(/\s+/g, " ").trim(),
    }))

  const header = ["Id", "Artist", "Song", "Album", "Year", "Genre", "Comment"]
  const lines = [header.join(",")]

  for (const row of rows) {
    const orderedRow = [
      row.id,
      row.artist,
      row.song,
      row.album,
      row.year,
      row.genre,
      row.comment,
    ]
    lines.push(orderedRow.map((value) => escapeCsv(value)).join(","))
  }

  return `\uFEFF${lines.join("\n")}\n`
}

function main() {
  const songs = readFolder("songs").map(({ data, body }) => ({ ...data, story: body })) as SongRecord[]
  const artists = readFolder("artists").map(({ data, body }) => ({ ...data, bio: body.trim() || undefined })) as ArtistRecord[]
  const themes = readFolder("themes").map(({ data }) => data)
  const memories = readFolder("memories").map(({ data, body }) => ({ ...data, body }))

  write("songs.json", songs)
  write("artists.json", artists)
  write("themes.json", themes)
  write("memories.json", memories)
  writeText("song-catalog.csv", createSongCatalogCsv(songs, artists))

  console.log(`\n✓ Generated data for ${songs.length} songs, ${artists.length} artists, ${themes.length} themes, ${memories.length} memories`)
}

main()
