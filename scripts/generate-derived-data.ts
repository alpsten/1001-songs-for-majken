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

function main() {
  const songs = readFolder("songs").map(({ data, body }) => ({ ...data, story: body }))
  const artists = readFolder("artists").map(({ data, body }) => ({ ...data, bio: body.trim() || undefined }))
  const themes = readFolder("themes").map(({ data }) => data)
  const memories = readFolder("memories").map(({ data, body }) => ({ ...data, body }))

  write("songs.json", songs)
  write("artists.json", artists)
  write("themes.json", themes)
  write("memories.json", memories)

  console.log(`\n✓ Generated data for ${songs.length} songs, ${artists.length} artists, ${themes.length} themes, ${memories.length} memories`)
}

main()
