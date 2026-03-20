import type { Song } from "../types"

// November 6 is the special day — this song always plays on that date.
const NOVEMBER_6_SONG_ID = "song-new-york-state-of-mind"

function isNovember6(date: Date): boolean {
  return date.getMonth() === 10 && date.getDate() === 6
}

function daysBetween(origin: Date, target: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const originMidnight = Date.UTC(origin.getFullYear(), origin.getMonth(), origin.getDate())
  const targetMidnight = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate())
  return Math.floor((targetMidnight - originMidnight) / msPerDay)
}

const ORIGIN_DATE = new Date(2026, 2, 20) // 2026-03-20

export function getDailySong(songs: Song[], today: Date = new Date()): Song | null {
  const published = songs.filter((s) => s.status === "published")
  if (published.length === 0) return null

  if (isNovember6(today)) {
    const special = published.find((s) => s.id === NOVEMBER_6_SONG_ID)
    if (special) return special
  }

  const dayNumber = daysBetween(ORIGIN_DATE, today)
  const index = ((dayNumber % published.length) + published.length) % published.length
  return published[index]
}
