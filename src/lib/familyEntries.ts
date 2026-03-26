export type FamilyEntry = {
  slug: string
  name: string
}

export const familyEntries: FamilyEntry[] = [
  { slug: "mamma", name: "Mamma" },
  { slug: "farmor", name: "Farmor" },
  { slug: "farfar", name: "Farfar" },
  { slug: "mormor", name: "Mormor" },
  { slug: "morfar", name: "Morfar" },
  { slug: "elin", name: "Elin" },
  { slug: "stina", name: "Stina" },
  { slug: "agnes", name: "Agnes" },
  { slug: "lisa", name: "Lisa" },
]

export function getFamilyEntryBySlug(slug: string): FamilyEntry | null {
  return familyEntries.find((entry) => entry.slug === slug) ?? null
}
