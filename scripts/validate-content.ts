import fs from "fs"
import path from "path"
import matter from "gray-matter"

const contentRoot = path.resolve("content")

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
      return { file: f, data, body: content }
    })
}

function required(file: ParsedFile, fields: string[]): string[] {
  return fields
    .filter((f) => !file.data[f])
    .map((f) => `  ${file.file}: missing required field "${f}"`)
}

function main() {
  const errors: string[] = []
  const warnings: string[] = []

  const songs = readFolder("songs")
  const artists = readFolder("artists")
  const themes = readFolder("themes")
  const memories = readFolder("memories")

  // Collect all known ids
  const allIds = new Set<string>()
  const allSlugs = new Set<string>()

  for (const entity of [...songs, ...artists, ...themes, ...memories]) {
    const id = entity.data.id as string
    const slug = entity.data.slug as string

    if (!id) {
      errors.push(`  ${entity.file}: missing id`)
      continue
    }
    if (!slug) {
      errors.push(`  ${entity.file}: missing slug`)
      continue
    }
    if (allIds.has(id)) {
      errors.push(`  ${entity.file}: duplicate id "${id}"`)
    }
    if (allSlugs.has(slug)) {
      errors.push(`  ${entity.file}: duplicate slug "${slug}"`)
    }
    allIds.add(id)
    allSlugs.add(slug)
  }

  // Validate songs
  for (const song of songs) {
    errors.push(...required(song, ["id", "slug", "title", "artistIds", "year", "whyItMatters", "status"]))

    const refs: Array<{ field: string; ids: string[] }> = [
      { field: "artistIds", ids: (song.data.artistIds as string[]) ?? [] },
      { field: "themeIds", ids: (song.data.themeIds as string[]) ?? [] },
      { field: "memoryIds", ids: (song.data.memoryIds as string[]) ?? [] },
      { field: "relatedSongIds", ids: (song.data.relatedSongIds as string[]) ?? [] },
      { field: "relatedArtistIds", ids: (song.data.relatedArtistIds as string[]) ?? [] },
    ]

    for (const { field, ids } of refs) {
      // Check for duplicates within field
      const seen = new Set<string>()
      for (const id of ids) {
        if (seen.has(id)) {
          errors.push(`  ${song.file}: duplicate id "${id}" in ${field}`)
        }
        seen.add(id)
      }
    }

    // Check year is sane
    const year = song.data.year as number
    if (year && (year < 1900 || year > new Date().getFullYear() + 1)) {
      errors.push(`  ${song.file}: year ${year} looks wrong`)
    }

    if (!song.body?.trim()) {
      warnings.push(`  ${song.file}: story body is empty`)
    }
  }

  // Check all referenced ids exist (after first pass collected all ids)
  // Run a second pass now that allIds is fully populated
  for (const song of songs) {
    const allRefs: string[] = [
      ...((song.data.artistIds as string[]) ?? []),
      ...((song.data.themeIds as string[]) ?? []),
      ...((song.data.memoryIds as string[]) ?? []),
      ...((song.data.relatedSongIds as string[]) ?? []),
      ...((song.data.relatedArtistIds as string[]) ?? []),
      ...(song.data.albumId ? [song.data.albumId as string] : []),
    ]
    for (const ref of allRefs) {
      if (!allIds.has(ref)) {
        errors.push(`  ${song.file}: references unknown id "${ref}"`)
      }
    }
  }

  for (const artist of artists) {
    const relatedArtistIds = (artist.data.relatedArtistIds as string[]) ?? []
    for (const ref of relatedArtistIds) {
      if (!allIds.has(ref)) {
        errors.push(`  ${artist.file}: references unknown id "${ref}"`)
      }
    }
  }

  for (const memory of memories) {
    const allRefs: string[] = [
      ...((memory.data.relatedSongIds as string[]) ?? []),
      ...((memory.data.relatedArtistIds as string[]) ?? []),
    ]
    for (const ref of allRefs) {
      if (!allIds.has(ref)) {
        errors.push(`  ${memory.file}: references unknown id "${ref}"`)
      }
    }
  }

  if (warnings.length > 0) {
    console.warn("Warnings:")
    warnings.forEach((w) => console.warn(w))
  }

  if (errors.length > 0) {
    console.error("\nValidation failed:")
    errors.forEach((e) => console.error(e))
    process.exit(1)
  } else {
    console.log(`✓ Validation passed (${songs.length} songs, ${artists.length} artists, ${themes.length} themes, ${memories.length} memories)`)
  }
}

main()
