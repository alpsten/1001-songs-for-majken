import { hashString } from "./hash"

// The one card-tilt rule, site-wide: no card (post-it, note, nav card,
// panel — anything meant to read as a leaning piece of paper) rotates
// more than this from vertical. Every hashed tilt in the app derives its
// range from this single constant rather than picking its own; any
// static (non-hashed) tilt in global.css is audited against it too. See
// docs/DESIGN_SYSTEM.md's Hard rules.
export const MAX_CARD_TILT_DEG = 4

// Hashed rotation for any card, seeded so it's stable across reloads —
// -MAX_CARD_TILT_DEG..+MAX_CARD_TILT_DEG, in 0.1deg steps.
export function contentTilt(seedKey: string): number {
  const steps = MAX_CARD_TILT_DEG * 20 + 1 // e.g. 10deg -> 201 steps of 0.1deg, inclusive both ends
  return (hashString(seedKey + "|tilt") % steps) / 10 - MAX_CARD_TILT_DEG
}

// Full-width panels (e.g. /explore's Mood/Genre/Year/Family Entries
// toggle cards, ThemesPage.tsx's ExploreCategoryCard) aren't "cards" in
// the MAX_CARD_TILT_DEG sense above — that constant is sized for small
// content-tier notes (a browse row, a status line). A panel spans the
// whole content column and can grow tall (an expanded list of tag
// postits inside it), so even a small-looking rotation swings its
// corners far enough to overlap the next panel in a stacked list — found
// exactly this way: ExploreCategoryCard originally used contentTilt()
// and the four /explore panels visibly overlapped each other.
// `.detail-panel`'s own hand-picked static tilts (-0.35deg to 0.5deg)
// were always this small for the same reason; this gives any *hashed*
// panel tilt that same small scale instead of reaching for the
// card-tier constant on something structurally different.
export const MAX_PANEL_TILT_DEG = 1.2

export function panelTilt(seedKey: string): number {
  const steps = MAX_PANEL_TILT_DEG * 20 + 1
  return (hashString(seedKey + "|panel-tilt") % steps) / 10 - MAX_PANEL_TILT_DEG
}
