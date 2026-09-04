import type { ReactNode } from "react"
import { hashString, pickFrom } from "../lib/hash"
import { postitColors } from "../lib/postitColors"

type NumberPostitProps = {
  /** Usually a count, but anything short works the same way — a single
   *  letter (record-row group headings) uses this exact component too. */
  value: ReactNode
  seedKey: string
}

// The small "note stuck onto a note" badge inside StatusPostit's summary
// line — a second, independently colored post-it for just the value, so
// it reads as pinned onto the sentence rather than typed into it.
export default function NumberPostit({ value, seedKey }: NumberPostitProps) {
  const color = pickFrom(postitColors, hashString(seedKey + "|number-color"))
  const rotate = (hashString(seedKey + "|number-tilt") % 100) / 10 - 5

  return (
    <span
      className="number-postit"
      style={{ backgroundColor: `var(--color-postit-${color})`, transform: `rotate(${rotate}deg)` }}
    >
      {value}
    </span>
  )
}
