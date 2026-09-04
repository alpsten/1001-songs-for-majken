import type { CSSProperties, ReactNode } from "react"
import { Link } from "react-router-dom"
import { hashString, pickFrom } from "../lib/hash"
import { contentTilt } from "../lib/postitTilt"
import { crinkleAngles } from "../lib/crinkle"
import { postitColors } from "../lib/postitColors"
import { getPostitShape } from "../lib/postitShape"
import PostitBase from "./PostitBase"
import Fastener from "./Fastener"

type BrowseRowProps = {
  to: string
  seedKey: string
  children: ReactNode
}

// One custom-fitted post-it row in a browse list (/songs, /artists) — see
// docs/DESIGN_SYSTEM.md §11.1. Shared so both pages get the same shape,
// color, texture, fastener, and tilt mechanics. Notes pack left-to-right
// and wrap (§11's .browse-row-list is `flex-wrap: row wrap` now, not a
// one-per-line stack) so short titles don't leave a stack full of empty
// horizontal space next to them.
export default function BrowseRow({ to, seedKey, children }: BrowseRowProps) {
  const shape = { ...getPostitShape(seedKey), base: "rect-wide" as const }
  const color = pickFrom(postitColors, hashString(seedKey + "|postit-color"))
  const striped = hashString(seedKey + "|striped") % 3 === 0
  // Crinkled is deliberately common (2 in 5) rather than a rare accent —
  // feedback was to lean into it more once the per-note random-angle fix
  // (lib/crinkle.ts) made it actually look varied instead of repetitive.
  const crinkled = hashString(seedKey + "|crinkle") % 5 < 2

  const postitClassName = [
    "browse-row-postit",
    striped && "browse-row-postit-striped",
    crinkled && "browse-row-postit-crinkled",
  ].filter(Boolean).join(" ")

  // The rotation transform itself lives on .browse-row-link (the wrapper),
  // not on .browse-row-postit — so the note and its tape (a *sibling* of
  // the note, see Fastener.tsx / the clip-path caveat in global.css)
  // rotate together as one rigid piece around the wrapper's center,
  // instead of tape staying anchored to the note's *unrotated* corner
  // while the note itself swings away from it. --tilt is still read by
  // the tape CSS for the wrapper's own rotate(), just not added a second
  // time by the tape pieces themselves. --crinkle-a/b/c ride along the
  // same way, only set when actually crinkled — each note gets its own
  // crease directions instead of every crinkled note on the page leaning
  // the same way.
  const wrapperStyle: CSSProperties & { "--tilt"?: string; "--crinkle-a"?: string; "--crinkle-b"?: string; "--crinkle-c"?: string } = {
    "--tilt": `${contentTilt(seedKey)}deg`,
  }
  if (crinkled) {
    const { a, b, c } = crinkleAngles(seedKey)
    wrapperStyle["--crinkle-a"] = `${a}deg`
    wrapperStyle["--crinkle-b"] = `${b}deg`
    wrapperStyle["--crinkle-c"] = `${c}deg`
  }

  return (
    <Link to={to} className="browse-row-link" style={wrapperStyle}>
      <PostitBase shape={shape} size="auto" colorVar={`var(--color-postit-${color})`} className={postitClassName}>
        {children}
      </PostitBase>
      <Fastener seedKey={seedKey} />
    </Link>
  )
}
