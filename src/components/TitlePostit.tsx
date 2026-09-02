import type { ReactNode } from "react"
import { hashString } from "../lib/hash"

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
  const rotate = (hashString(seedKey + "|rotate") % 240) / 10 - 12

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
