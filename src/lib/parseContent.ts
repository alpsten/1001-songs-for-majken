import type { Song, Artist, Theme, Memory } from "../types"

export async function loadSongs(): Promise<Song[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/songs.json`)
  return res.json()
}

export async function loadArtists(): Promise<Artist[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/artists.json`)
  return res.json()
}

export async function loadThemes(): Promise<Theme[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/themes.json`)
  return res.json()
}

export async function loadMemories(): Promise<Memory[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/memories.json`)
  return res.json()
}
