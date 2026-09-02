// Deterministic pseudo-randomness for the little post-it some cards carry —
// derived from the card's own id, so it's genuinely scattered (not a i%N
// pattern) but stays put across re-renders/filtering instead of reshuffling.

import { hashString } from "./hash"

const corners = ["tl", "tr", "bl", "br"] as const
const colors = ["yellow", "pink", "mint"] as const
// Three coexisting styles: a clean rounded post-it (CSS), a torn paper
// scrap (CSS clip-path), and a hand-sketched one drawn by rough.js.
const shapes = ["regular", "torn", "rough"] as const

export type CardNote = {
  corner: (typeof corners)[number]
  color: (typeof colors)[number]
  shape: (typeof shapes)[number]
  size: number
  seed: number
}

export function getCardNote(id: string): CardNote | null {
  // Independently salted hashes so presence/corner/color/shape don't
  // correlate with each other (a single shared hash biased color choice).
  if (hashString(id + "|has") % 100 >= 32) return null // ~32% of cards carry a note

  return {
    corner: corners[hashString(id + "|corner") % corners.length],
    color: colors[hashString(id + "|color") % colors.length],
    shape: shapes[hashString(id + "|shape") % shapes.length],
    size: 24 + (hashString(id + "|size") % 10),
    seed: hashString(id + "|roughseed") % 2147483647,
  }
}
