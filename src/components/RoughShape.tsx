import type { CSSProperties } from "react"
import rough from "roughjs"
import type { Drawable } from "roughjs/bin/core"

const generator = rough.generator()

export type ShapeKind = "star" | "heart" | "sun" | "lego"
export type ShapeColor = "yellow" | "pink" | "mint" | "ink"

const fillByColor: Record<ShapeColor, string> = {
  yellow: "#d7bd63",
  pink: "#cf9c8f",
  mint: "#96a988",
  ink: "#a8492f",
}

function starPoints(size: number): [number, number][] {
  const cx = size / 2
  const cy = size / 2
  const outerR = size * 0.47
  const innerR = size * 0.19
  const points: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  return points
}

function heartPath(size: number): string {
  const s = size / 100
  const p = (n: number) => (n * s).toFixed(1)
  return `M${p(50)},${p(90)} C${p(15)},${p(65)} ${p(2)},${p(43)} ${p(2)},${p(26)} C${p(2)},${p(10)} ${p(16)},${p(0)} ${p(31)},${p(0)} C${p(42)},${p(0)} ${p(48)},${p(9)} ${p(50)},${p(18)} C${p(52)},${p(9)} ${p(58)},${p(0)} ${p(69)},${p(0)} C${p(84)},${p(0)} ${p(98)},${p(10)} ${p(98)},${p(26)} C${p(98)},${p(43)} ${p(85)},${p(65)} ${p(50)},${p(90)} Z`
}

function drawablesFor(kind: ShapeKind, size: number, fill: string, seed: number): Drawable[] {
  const base = { fill, fillStyle: "hachure" as const, stroke: fill, strokeWidth: 1.5, roughness: 1.6, seed }

  switch (kind) {
    case "star":
      return [generator.polygon(starPoints(size), base)]

    case "heart":
      return [generator.path(heartPath(size), base)]

    case "sun": {
      const cx = size / 2
      const cy = size / 2
      const r = size * 0.2
      const rays: Drawable[] = []
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i
        const x1 = cx + Math.cos(angle) * r * 1.35
        const y1 = cy + Math.sin(angle) * r * 1.35
        const x2 = cx + Math.cos(angle) * r * 2.15
        const y2 = cy + Math.sin(angle) * r * 2.15
        rays.push(generator.line(x1, y1, x2, y2, { stroke: fill, strokeWidth: 2, roughness: 1.6, seed: seed + i + 1 }))
      }
      return [generator.circle(cx, cy, r * 2, base), ...rays]
    }

    case "lego": {
      const bodyW = size * 0.78
      const bodyH = size * 0.5
      const bodyX = (size - bodyW) / 2
      const bodyY = size * 0.38
      const studR = size * 0.085
      const studs = [0.25, 0.5, 0.75].map((f, i) =>
        generator.circle(bodyX + bodyW * f, bodyY - studR * 0.5, studR * 2, { ...base, seed: seed + i + 1 })
      )
      return [generator.rectangle(bodyX, bodyY, bodyW, bodyH, base), ...studs]
    }
  }
}

type RoughShapeProps = {
  kind: ShapeKind
  size: number
  color: ShapeColor
  seed: number
  className?: string
  style?: CSSProperties
}

// A whimsical bit of background clutter (star / heart / sun / lego piece),
// drawn hand-sketched via rough.js — extending the same library used for
// the post-it notes rather than reaching for a second one.
export default function RoughShape({ kind, size, color, seed, className, style }: RoughShapeProps) {
  const fill = fillByColor[color]
  const drawables = drawablesFor(kind, size, fill, seed)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ overflow: "visible", ...style }}
      aria-hidden="true"
    >
      {drawables.flatMap((d, di) =>
        generator.toPaths(d).map((p, i) => (
          <path key={`${di}-${i}`} d={p.d} fill={p.fill ?? "none"} stroke={p.stroke} strokeWidth={p.strokeWidth} />
        ))
      )}
    </svg>
  )
}
