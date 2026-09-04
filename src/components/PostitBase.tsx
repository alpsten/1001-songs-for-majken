import type { CSSProperties, ReactNode } from "react"
import { cutCornerClipPath, dimensionsFor, type PostitShape } from "../lib/postitShape"

type PostitBaseProps = {
  shape: PostitShape
  /** A nominal size in px, or "auto" to let the note hug its own content
   *  (width/height come from CSS on the wrapping className instead) — see
   *  docs/DESIGN_SYSTEM.md §11.1. */
  size: number | "auto"
  colorVar: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const AUTO_CUT_SIZE = 14
const AUTO_ROUND_RADIUS = 10

// Renders one of the 30 named shape/corner-treatment combinations from
// the taxonomy in docs/DESIGN_SYSTEM.md §4. "Torn" and "rough" are a
// separate, orthogonal render style (see .card-note-torn / RoughNote) —
// this component only covers the "regular" family: sharp, cut, folded,
// round.
export default function PostitBase({ shape, size, colorVar, className, style, children }: PostitBaseProps) {
  const isAuto = size === "auto"
  const { width, height } = isAuto ? { width: "auto" as const, height: "auto" as const } : dimensionsFor(shape.base, size)
  const cutSize = isAuto ? AUTO_CUT_SIZE : Math.round(size * 0.22)
  const roundRadius = isAuto ? AUTO_ROUND_RADIUS : Math.round(size * 0.14)

  let borderRadius = "0"
  let clipPath: string | undefined

  if (shape.treatment === "round") {
    borderRadius = `${roundRadius}px`
  } else if (shape.treatment.startsWith("cut-")) {
    clipPath = cutCornerClipPath(shape.corners, cutSize, width, height)
  }

  return (
    <div
      className={`postit-base ${className ?? ""}`}
      style={{
        width: isAuto ? undefined : width,
        height: isAuto ? undefined : height,
        backgroundColor: colorVar,
        borderRadius,
        clipPath,
        ...style,
      }}
    >
      {children}
      {shape.treatment.startsWith("fold-") &&
        shape.corners.map((corner) => <span key={corner} className={`postit-fold postit-fold-${corner}`} />)}
    </div>
  )
}
