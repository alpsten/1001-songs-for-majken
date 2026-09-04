import type { CSSProperties, ReactNode } from "react"
import { hashString, pickFrom } from "../lib/hash"
import { contentTilt } from "../lib/postitTilt"
import { postitColors } from "../lib/postitColors"
import { getPostitShape } from "../lib/postitShape"
import PostitBase from "./PostitBase"
import Fastener from "./Fastener"

type StatusPostitProps = {
  seedKey: string
  children: ReactNode
  className?: string
  /** Overrides the hashed left/center/right scatter below. Needed when a
   *  StatusPostit sits in a *row* of its own (e.g. SongsPage's count +
   *  "select a letter" prompt side by side) rather than a stacked
   *  column — the scatter is built for a column's cross-axis and means
   *  something else entirely once the axis is a row. */
  align?: "flex-start" | "center" | "flex-end"
}

// A small standalone post-it for a status line (a count, a placeholder
// message) rather than a link — same visual language as BrowseRow's rows
// and TitlePostit, just not clickable. See docs/DESIGN_SYSTEM.md §10.1.
export default function StatusPostit({ seedKey, children, className, align }: StatusPostitProps) {
  const shape = getPostitShape(seedKey)
  const color = pickFrom(postitColors, hashString(seedKey + "|postit-color"))

  // Same left/center/right scatter as BrowseRow's rows — stacked status
  // notes in a header used to all sit flush left with barely any gap,
  // which read as one crowded block rather than separate notes.
  const alignPick = hashString(seedKey + "|align") % 5
  const hashedAlign = alignPick < 3 ? "flex-start" : alignPick === 3 ? "center" : "flex-end"
  const resolvedAlign = align ?? hashedAlign

  // --tilt lives on the wrapper, not the shaped note itself — see the same
  // note in BrowseRow.tsx.
  const wrapperStyle: CSSProperties & { "--tilt"?: string } = {
    alignSelf: resolvedAlign,
    "--tilt": `${contentTilt(seedKey)}deg`,
  }

  return (
    <div className="status-postit-wrap" style={wrapperStyle}>
      <PostitBase
        shape={shape}
        size="auto"
        colorVar={`var(--color-postit-${color})`}
        className={`status-postit ${className ?? ""}`}
      >
        {children}
      </PostitBase>
      <Fastener seedKey={seedKey} />
    </div>
  )
}
