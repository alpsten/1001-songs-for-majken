import type { CSSProperties, ReactNode } from "react"
import { Link } from "react-router-dom"
import { hashString, pickFrom } from "../lib/hash"
import { contentTilt } from "../lib/postitTilt"
import { postitColors } from "../lib/postitColors"
import { getPostitShape } from "../lib/postitShape"
import { topCenterTapeStyles } from "../lib/fastenerCorners"
import PostitBase from "./PostitBase"
import Fastener from "./Fastener"

type TagCardProps = {
  /** Internal route. Omit when the card links externally (`href`) or
   *  isn't a link at all (a plain fact like a year). */
  to?: string
  /** External link (e.g. Spotify) — rendered as a new-tab anchor instead
   *  of a router Link. */
  href?: string
  seedKey: string
  children: ReactNode
}

// One hashed post-it per tag — shared by every taxonomy tag list (mood,
// genre, decade, family), song-detail meta facts (artist, year, Spotify
// link), and any other detail-page tag that used to be a flat pill — so
// they all render the exact same way (PostitBase for shape/grain/shadow,
// a top-center-only Fastener, the full nine-color palette), instead of
// each section keeping its own flat `.tag-postit` pill, which only ever
// cycled 3 fixed colors and read as a different, lesser paper system
// than the songs/artists cards elsewhere on the site.
export default function TagCard({ to, href, seedKey, children }: TagCardProps) {
  // Sharp corners only, never "round" — at a tag's small auto-hugged
  // size, the rounded treatment reads as a plain chip/pill rather than a
  // paper note, which is exactly the flat .tag-postit look this
  // component replaced. Same override pattern as BrowseRow forcing its
  // own base shape.
  const shape = { ...getPostitShape(seedKey + "|tag-shape"), treatment: "sharp" as const }
  const color = pickFrom(postitColors, hashString(seedKey + "|tag-color"))
  const tilt = contentTilt(seedKey + "|tag-tilt")
  const wrapperStyle: CSSProperties & { "--tilt"?: string } = {
    "--tilt": `${tilt}deg`,
  }

  const note = (
    <>
      <PostitBase shape={shape} size="auto" colorVar={`var(--color-postit-${color})`} className="explore-tag-postit">
        {children}
      </PostitBase>
      <Fastener seedKey={seedKey + "|tag-fastener"} pool={topCenterTapeStyles} />
    </>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="explore-tag-link" style={wrapperStyle}>
        {note}
      </a>
    )
  }

  if (to) {
    return (
      <Link to={to} className="explore-tag-link" style={wrapperStyle}>
        {note}
      </Link>
    )
  }

  return (
    <span className="explore-tag-link" style={wrapperStyle}>
      {note}
    </span>
  )
}
