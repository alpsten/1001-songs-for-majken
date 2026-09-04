import { hashString, pickFrom } from "../lib/hash"
import { tapeStyles, type TapeStyle } from "../lib/fastenerCorners"

// Shared fastener decision for BrowseRow and StatusPostit — see
// docs/DESIGN_SYSTEM.md §5.2. A content-tier note gets one of four tape
// placements, hashed per item. Every option anchors the note at two
// points or a wide-enough strip — a single side or a single small
// corner square isn't enough on its own, the same reasoning that
// already ruled out bottom-only tape. The tape style list lives in
// lib/fastenerCorners.ts.
//
// There used to be two more options, diagonal-left/diagonal-right (a
// middle-side strip plus the two corners diagonally opposite it, an "X"
// across the note) — removed on direct feedback, no replacement.
//
// There used to be a pin option here too (a hand-sketched rough.js
// ball-and-needle, PushPin.tsx) — removed on feedback that it looked
// "really ugly." Tape is the only content-tier fastener now. The small
// accent-colored dot pin on `.detail-panel` (the corkboard-style pin,
// e.g. the "Search for artist" card) is unrelated — a fixed panel
// decoration, not a per-item hashed fastener choice, so it's untouched.

type FastenerProps = {
  seedKey: string
  /** Restricts which styles get hashed over — defaults to all four.
   *  ThemesPage.tsx's TagCard/ExploreCategoryCard pass
   *  `topCenterTapeStyles` here on direct request for top-only tape, no
   *  sides/all-four/top-both. */
  pool?: readonly TapeStyle[]
}

export default function Fastener({ seedKey, pool = tapeStyles }: FastenerProps) {
  switch (pickFrom(pool, hashString(seedKey + "|tape-style"))) {
    case "top-center":
      return <span className="tape-piece tape-top-center" />
    case "top-both":
      return (
        <>
          <span className="tape-piece tape-tl" />
          <span className="tape-piece tape-tr" />
        </>
      )
    case "all-four":
      return (
        <>
          <span className="tape-piece tape-tl" />
          <span className="tape-piece tape-tr" />
          <span className="tape-piece tape-bl" />
          <span className="tape-piece tape-br" />
        </>
      )
    // Both side strips together — a single side alone doesn't resist the
    // note twisting on its other edge any better than a single corner does.
    case "both-sides":
      return (
        <>
          <span className="tape-piece tape-left" />
          <span className="tape-piece tape-right" />
        </>
      )
  }
}
