export type EntityId = string

export type ExternalLink = {
  label: string
  url: string
  kind?: "spotify" | "youtube" | "wikipedia" | "other"
}

export type Song = {
  id: EntityId
  slug: string
  title: string
  artistIds: EntityId[]
  featuredArtistIds?: EntityId[]
  album?: string
  albumId?: EntityId
  year: number
  whyItMatters: string
  story: string
  genreTags?: string[]
  moodTags?: string[]
  themeIds?: EntityId[]
  memoryIds?: EntityId[]
  relatedSongIds?: EntityId[]
  relatedArtistIds?: EntityId[]
  sourceLinks?: ExternalLink[]
  addedAt: string
  sortOrder?: number
  status: "draft" | "published"
}

export type Artist = {
  id: EntityId
  slug: string
  name: string
  birthYear?: number
  formedYear?: number
  country?: string
  genreTags?: string[]
  summary?: string
  notableSongIds?: EntityId[]
  relatedArtistIds?: EntityId[]
}

export type Album = {
  id: EntityId
  slug: string
  title: string
  artistIds: EntityId[]
  year?: number
  songIds?: EntityId[]
  summary?: string
}

export type Theme = {
  id: EntityId
  slug: string
  name: string
  description?: string
  relatedThemeIds?: EntityId[]
}

export type Memory = {
  id: EntityId
  slug: string
  title: string
  dateApprox?: string
  summary: string
  body: string
  relatedSongIds?: EntityId[]
  relatedArtistIds?: EntityId[]
  tags?: string[]
}

export type GraphNode = {
  id: string
  type: "song" | "artist" | "album" | "theme" | "memory"
  label: string
  slug: string
}

export type GraphEdge = {
  id: string
  source: string
  target: string
  relation:
    | "performed-by"
    | "appears-on"
    | "related-song"
    | "related-artist"
    | "has-theme"
    | "has-memory"
}
