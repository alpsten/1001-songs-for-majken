import type { Artist, Song } from "../types"

function getArtistNames(artistIds: string[] | undefined, artistsById: Record<string, Artist>): string[] {
  return (artistIds ?? []).map((id) => artistsById[id]?.name).filter(Boolean)
}

export function getSongArtistCredit(song: Song, artistsById: Record<string, Artist>): string {
  const primaryArtists = getArtistNames(song.artistIds, artistsById).join(", ")
  const featuredArtists = getArtistNames(song.featuredArtistIds, artistsById).join(", ")

  if (!featuredArtists) return primaryArtists
  return `${primaryArtists} feat. ${featuredArtists}`
}

export function getSongArtistEntities(song: Song, artistsById: Record<string, Artist>) {
  return {
    primary: (song.artistIds ?? []).map((id) => artistsById[id]).filter(Boolean),
    featured: (song.featuredArtistIds ?? []).map((id) => artistsById[id]).filter(Boolean),
  }
}
