import { hashString } from "./hash"

// The three crease angles for .browse-row-postit-crinkled — hashed per
// note so the crinkle doesn't always lean the same direction across the
// whole page (see docs/DESIGN_SYSTEM.md §4.4). Spread roughly like a fan
// (offsets of ~70°/~160° from a hashed base) rather than fully
// independent random angles, so the three creases on one note don't
// bunch up and read as a single line.
export function crinkleAngles(seedKey: string): { a: number; b: number; c: number } {
  const base = hashString(seedKey + "|crinkle-a") % 360
  const b = (base + 70 + (hashString(seedKey + "|crinkle-b") % 50)) % 360
  const c = (base + 160 + (hashString(seedKey + "|crinkle-c") % 50)) % 360
  return { a: base, b, c }
}
