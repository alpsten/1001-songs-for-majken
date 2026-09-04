import type { ReactNode } from "react"
import { hashString } from "../lib/hash"
import { contentTilt } from "../lib/postitTilt"

// Every page title is its own post-it now — but each one should look
// distinct, so color/shape/tape/rotation are all derived from the title's
// own text (stable per page, never reshuffling, but genuinely different
// from one title to the next).

type TitlePostitProps = {
  seedKey: string
  children: ReactNode
}

const colors = ["yellow", "pink", "mint"] as const
const cornerOptions = ["0.05rem", "0.15rem", "0.55rem", "0.9rem"]

function pickFrom<T>(list: readonly T[], hash: number): T {
  return list[hash % list.length]
}

export default function TitlePostit({ seedKey, children }: TitlePostitProps) {
  const color = pickFrom(colors, hashString(seedKey + "|color"))
  const torn = hashString(seedKey + "|shape") % 2 === 0
  const fourTape = hashString(seedKey + "|tape") % 2 === 0
  // Uses the same site-wide card-tilt rule as everything else now
  // (lib/postitTilt.ts's MAX_CARD_TILT_DEG) — was its own hand-rolled
  // ±10° formula (itself tightened from an original ±12° after feedback
  // that a title tilted near the old max, combined with its own padding,
  // could visually encroach on whatever sat right below it).
  const rotate = contentTilt(seedKey + "|title")

  const radii = torn
    ? undefined
    : [1, 2, 3, 4]
        .map((n) => pickFrom(cornerOptions, hashString(`${seedKey}|r${n}`)))
        .join(" ")

  return (
    <div
      className={`title-postit title-postit-${color}${torn ? " title-postit-torn" : ""}`}
      style={{ transform: `rotate(${rotate}deg)`, borderRadius: radii }}
    >
      {fourTape ? (
        <>
          <span className="tape-piece tape-tl" />
          <span className="tape-piece tape-tr" />
          <span className="tape-piece tape-bl" />
          <span className="tape-piece tape-br" />
        </>
      ) : (
        <span className="tape-piece title-postit-tape" />
      )}
      <h1 className="detail-title">{children}</h1>
    </div>
  )
}
