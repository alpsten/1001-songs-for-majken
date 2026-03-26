export type GenreFamily = {
  slug: string
  label: string
}

const genreFamilies: GenreFamily[] = [
  { slug: "hip-hop", label: "Hip-hop" },
  { slug: "rock", label: "Rock" },
  { slug: "pop", label: "Pop" },
  { slug: "r-and-b", label: "R&B" },
  { slug: "soul", label: "Soul" },
  { slug: "folk", label: "Folk" },
  { slug: "country", label: "Country" },
  { slug: "dance", label: "Dance" },
  { slug: "soundtrack", label: "Soundtrack" },
  { slug: "world", label: "World" },
]

export function getAllGenreFamilies(): GenreFamily[] {
  return genreFamilies
}

export function formatGenreTag(tag: string): string {
  const normalized = tag.toLowerCase()

  if (normalized === "r&b") return "R&B"
  if (normalized === "hip-hop") return "Hip-hop"

  return tag
    .replace(/\br&b\b/gi, "R&B")
    .split("-")
    .map((part) => part.replace(/\b\w/g, (char) => char.toUpperCase()))
    .join(" ")
}

export function getGenreFamily(tag: string): GenreFamily {
  const normalized = tag.toLowerCase()

  if (normalized.includes("hip hop") || normalized.includes("hip-hop") || /\brap\b/.test(normalized)) {
    return genreFamilies[0]
  }
  if (normalized.includes("r&b") || normalized.includes("rhythm and blues") || normalized.includes("new jack swing")) {
    return genreFamilies[3]
  }
  if (
    normalized.includes("soul") ||
    normalized.includes("funk") ||
    normalized.includes("blue-eyed-soul")
  ) {
    return genreFamilies[4]
  }
  if (
    normalized.includes("folk") ||
    normalized.includes("singer-songwriter")
  ) {
    return genreFamilies[5]
  }
  if (normalized.includes("country")) return genreFamilies[6]
  if (
    normalized.includes("dance") ||
    normalized.includes("house") ||
    normalized.includes("disco") ||
    normalized.includes("electronic") ||
    normalized.includes("big beat")
  ) {
    return genreFamilies[7]
  }
  if (normalized.includes("soundtrack") || normalized.includes("musical")) return genreFamilies[8]
  if (
    normalized.includes("world") ||
    normalized.includes("gospel") ||
    normalized.includes("reggae") ||
    normalized.includes("jazz") ||
    normalized.includes("blues") ||
    normalized.includes("new age") ||
    normalized.includes("dansband")
  ) {
    return genreFamilies[9]
  }
  if (normalized.includes("rock")) return genreFamilies[1]
  if (normalized.includes("pop")) return genreFamilies[2]
  return genreFamilies[9]
}

export function getGenreFamilyBySlug(slug: string): GenreFamily | null {
  return genreFamilies.find((family) => family.slug === slug) ?? null
}

export function getGenreFamilies(tags: string[]): GenreFamily[] {
  const uniqueBySlug = new Map<string, GenreFamily>()

  for (const tag of tags) {
    const family = getGenreFamily(tag)
    uniqueBySlug.set(family.slug, family)
  }

  return genreFamilies.filter((family) => uniqueBySlug.has(family.slug))
}
