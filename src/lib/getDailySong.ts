import type { Song } from "../types"
import { hashString } from "./hash"

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

// A tiny seeded PRNG (mulberry32) — hashString() gives one deterministic
// number, not a sequence, and shuffling needs many draws from the same
// seed. Only used here, for the Fisher-Yates shuffle below.
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A full shuffle of [0, n), not n independent random draws — every index
// appears exactly once, so within one rotation no song repeats. Same
// seed always produces the same order (Fisher-Yates driven by a seeded
// PRNG, not Math.random()).
function shuffledIndices(n: number, seed: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i)
  const random = mulberry32(seed)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

// One song per day, in a genuinely shuffled (not alphabetical/list-order)
// sequence, with every song guaranteed to appear once before any repeat.
// A rotation is `published.length` days long; each rotation gets its own
// shuffle (seeded by the rotation number) so the order isn't identical
// every single year once the catalog stops growing. dayInCycle walks
// that rotation's shuffled order one step per day.
export function getDailySong(songs: Song[], today: Date = new Date()): Song | null {
  const published = songs.filter((s) => s.status === "published")
  if (published.length === 0) return null

  if (isNovember6(today)) {
    const special = published.find((s) => s.id === NOVEMBER_6_SONG_ID)
    if (special) return special
  }

  const n = published.length
  const dayNumber = daysBetween(ORIGIN_DATE, today)
  const rotation = Math.floor(dayNumber / n)
  const dayInRotation = ((dayNumber % n) + n) % n

  const seed = hashString(`daily-song-rotation-${rotation}`)
  const order = shuffledIndices(n, seed)
  return published[order[dayInRotation]]
}
