import type { CSSProperties } from "react"
import rough from "roughjs"

const generator = rough.generator()

const fillByColor: Record<string, string> = {
  yellow: "#d7bd63",
  pink: "#cf9c8f",
  mint: "#96a988",
}

type RoughNoteProps = {
  width: number
  height: number
  color: "yellow" | "pink" | "mint"
  seed: number
  className?: string
  style?: CSSProperties
}

// A post-it drawn as an actual hand-sketched shape via rough.js, rather
// than a clean CSS rect — one of several coexisting note styles both card
// corners and the ambient desk clutter can use. Seeded so the wobble is
// stable per-item, not random on every render. Kept fairly restrained
// (moderate roughness/bowing) so it still reads as a note, not a scribble.
export default function RoughNote({ width, height, color, seed, className, style }: RoughNoteProps) {
  const fill = fillByColor[color]
  const drawable = generator.rectangle(2, 2, width - 4, height - 4, {
    fill,
    fillStyle: "solid",
    stroke: fill,
    strokeWidth: 1.4,
    roughness: 1.3,
    bowing: 0.8,
    seed,
  })
  const paths = generator.toPaths(drawable)

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ overflow: "visible", ...style }}
      aria-hidden="true"
    >
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill ?? "none"} stroke={p.stroke} strokeWidth={p.strokeWidth} />
      ))}
    </svg>
  )
}
