// The formal post-it shape taxonomy — see docs/DESIGN_SYSTEM.md §4.
//
// Three base shapes (square, rect-wide, rect-tall) × corner treatment.
// `Treatment` still names the full original set (sharp, cut ×1-4, folded
// ×1-4, round) — cutCornerClipPath() and PostitBase.tsx's fold rendering
// still handle all of them correctly — but `treatments` (the array
// getPostitShape() actually picks from) was pruned down to just `sharp`/
// `round`. Feedback was the cut/fold corners were too busy across a whole
// page of notes; simplifying the *selection* rather than deleting the
// cut/fold code keeps the capability available if that changes again.
// "Torn" and "rough" remain separate whole-note render styles layered on
// top of this (they replace the corner treatment entirely when used).

import { hashString } from "./hash"

export type Base = "square" | "rect-wide" | "rect-tall"
export type Treatment =
  | "sharp"
  | "cut-1" | "cut-2" | "cut-3" | "cut-4"
  | "fold-1" | "fold-2" | "fold-3" | "fold-4"
  | "round"
export type Corner = "tl" | "tr" | "bl" | "br"

export const bases: Base[] = ["square", "rect-wide", "rect-tall"]
export const treatments: Treatment[] = ["sharp", "round"]

const allCorners: Corner[] = ["tl", "tr", "bl", "br"]

export type PostitShape = {
  base: Base
  treatment: Treatment
  /** Which corners carry the cut/fold, when the treatment calls for a count. */
  corners: Corner[]
}

function countFor(treatment: Treatment): number {
  const match = treatment.match(/-(\d)$/)
  return match ? Number(match[1]) : 0
}

/** Deterministically pick which N of the 4 corners are affected, seeded. */
function pickCorners(seedKey: string, count: number): Corner[] {
  const shuffled = [...allCorners].sort(
    (a, b) => hashString(`${seedKey}|corner-order|${a}`) - hashString(`${seedKey}|corner-order|${b}`)
  )
  return shuffled.slice(0, count)
}

export function getPostitShape(seedKey: string): PostitShape {
  const base = bases[hashString(seedKey + "|base") % bases.length]
  const treatment = treatments[hashString(seedKey + "|treatment") % treatments.length]
  const corners = pickCorners(seedKey, countFor(treatment))
  return { base, treatment, corners }
}

/** width/height in px for a given base, from a nominal size. */
export function dimensionsFor(base: Base, size: number): { width: number; height: number } {
  if (base === "rect-wide") return { width: size, height: Math.round(size * 0.68) }
  if (base === "rect-tall") return { width: Math.round(size * 0.68), height: size }
  return { width: size, height: size }
}

/**
 * clip-path polygon for the "cut" (chamfered) treatment. cutSize in px.
 *
 * width/height are normally the note's resolved pixel size (fixed-size
 * ambient decorations). Pass "auto" instead for a note whose size should
 * hug its own content (see docs/DESIGN_SYSTEM.md §11.1) — the far edge of
 * each cut then resolves via calc(100% - Npx) instead of a literal pixel
 * coordinate, so the same polygon shape works with no JS measurement step.
 */
export function cutCornerClipPath(
  corners: Corner[],
  cutSize: number,
  width: number | "auto",
  height: number | "auto"
): string {
  const has = (c: Corner) => corners.includes(c)
  const farX = width === "auto" ? `calc(100% - ${cutSize}px)` : `${width - cutSize}px`
  const fullX = width === "auto" ? "100%" : `${width}px`
  const farY = height === "auto" ? `calc(100% - ${cutSize}px)` : `${height - cutSize}px`
  const fullY = height === "auto" ? "100%" : `${height}px`
  const points: string[] = []

  if (has("tl")) points.push(`0px ${cutSize}px`, `${cutSize}px 0px`)
  else points.push(`0px 0px`)

  if (has("tr")) points.push(`${farX} 0px`, `${fullX} ${cutSize}px`)
  else points.push(`${fullX} 0px`)

  if (has("br")) points.push(`${fullX} ${farY}`, `${farX} ${fullY}`)
  else points.push(`${fullX} ${fullY}`)

  if (has("bl")) points.push(`${cutSize}px ${fullY}`, `0px ${farY}`)
  else points.push(`0px ${fullY}`)

  return `polygon(${points.join(", ")})`
}
