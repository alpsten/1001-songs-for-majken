import type { CSSProperties } from "react"
import rough from "roughjs"
import type { Drawable } from "roughjs/bin/core"

const generator = rough.generator()

export type ShapeKind =
  | "star" | "heart" | "sun" | "lego"
  | "cassette" | "vinyl" | "headphones" | "paperclip" | "ticket" | "musicNote" | "coffeeRing"
  | "cloud" | "lightningBolt" | "balloon" | "flower" | "smileyFace"
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

    case "cassette": {
      const bodyW = size * 0.86
      const bodyH = size * 0.58
      const bodyX = (size - bodyW) / 2
      const bodyY = (size - bodyH) / 2
      const reelR = size * 0.1
      const reelY = bodyY + bodyH / 2
      const windowW = bodyW * 0.3
      const windowH = bodyH * 0.32
      return [
        generator.rectangle(bodyX, bodyY, bodyW, bodyH, base),
        generator.circle(bodyX + bodyW * 0.28, reelY, reelR * 2, { ...base, seed: seed + 1 }),
        generator.circle(bodyX + bodyW * 0.72, reelY, reelR * 2, { ...base, seed: seed + 2 }),
        generator.rectangle(bodyX + (bodyW - windowW) / 2, bodyY + bodyH * 0.2, windowW, windowH, { ...base, seed: seed + 3 }),
      ]
    }

    case "vinyl": {
      const cx = size / 2
      const cy = size / 2
      const r = size * 0.46
      const labelR = size * 0.16
      const grooveStyle = { stroke: fill, strokeWidth: 1, roughness: 1.4, fill: "none" as const }
      const grooves = [0.62, 0.78, 0.92].map((f, i) =>
        generator.circle(cx, cy, r * 2 * f, { ...grooveStyle, seed: seed + i + 10 })
      )
      return [
        generator.circle(cx, cy, r * 2, base),
        ...grooves,
        generator.circle(cx, cy, labelR * 2, { ...base, seed: seed + 1 }),
      ]
    }

    case "headphones": {
      const cx = size / 2
      const bandR = size * 0.36
      const cupR = size * 0.14
      const earY = size * 0.56
      return [
        generator.arc(cx, size * 0.42, bandR * 2, bandR * 1.3, Math.PI, 2 * Math.PI, false, {
          stroke: fill, strokeWidth: 2.2, roughness: 1.5, seed,
        }),
        generator.ellipse(cx - bandR, earY, cupR * 1.3, cupR * 2, { ...base, seed: seed + 1 }),
        generator.ellipse(cx + bandR, earY, cupR * 1.3, cupR * 2, { ...base, seed: seed + 2 }),
      ]
    }

    case "paperclip": {
      const w = size * 0.5
      const h = size * 0.86
      const x0 = (size - w) / 2
      const y0 = size * 0.08
      const path = `M${x0 + w * 0.7},${y0}
        C${x0 + w * 1.1},${y0} ${x0 + w * 1.1},${y0 + h * 0.28} ${x0 + w * 0.7},${y0 + h * 0.28}
        L${x0 + w * 0.25},${y0 + h * 0.7}
        C${x0},${y0 + h * 0.85} ${x0 + w * 0.1},${y0 + h * 1.05} ${x0 + w * 0.4},${y0 + h * 1.0}
        L${x0 + w * 0.85},${y0 + h * 0.55}`
      return [generator.path(path, { stroke: fill, strokeWidth: 2.2, roughness: 1.4, fill: "none", seed })]
    }

    case "ticket": {
      const w = size * 0.82
      const h = size * 0.5
      const x = (size - w) / 2
      const y = (size - h) / 2
      const perfX = x + w * 0.32
      const dots = [0.15, 0.35, 0.55, 0.75, 0.95].map((f, i) =>
        generator.circle(perfX, y + h * f, size * 0.045, {
          stroke: fill, strokeWidth: 1, fill: "none", roughness: 1.3, seed: seed + i + 5,
        })
      )
      return [generator.rectangle(x, y, w, h, base), ...dots]
    }

    case "musicNote": {
      const noteX = size * 0.32
      const noteY = size * 0.78
      const noteW = size * 0.22
      const noteH = size * 0.16
      const stemX = noteX + noteW * 0.42
      const stemTopY = size * 0.12
      const flagPath = `M${stemX},${stemTopY} C${stemX + size * 0.28},${stemTopY + size * 0.05} ${stemX + size * 0.3},${stemTopY + size * 0.22} ${stemX + size * 0.06},${stemTopY + size * 0.3}`
      return [
        generator.ellipse(noteX, noteY, noteW, noteH, base),
        generator.line(stemX, stemTopY, stemX, noteY, { stroke: fill, strokeWidth: 2, roughness: 1.4, seed: seed + 1 }),
        generator.path(flagPath, { stroke: fill, strokeWidth: 2, roughness: 1.4, fill: "none", seed: seed + 2 }),
      ]
    }

    case "coffeeRing": {
      const cx = size / 2
      const cy = size / 2
      const ringStyle = { stroke: fill, roughness: 1.8, fill: "none" as const }
      return [
        generator.circle(cx, cy, size * 0.92, { ...ringStyle, strokeWidth: 1.3, seed }),
        generator.circle(cx * 0.94, cy * 1.05, size * 0.8, { ...ringStyle, strokeWidth: 1, seed: seed + 1 }),
      ]
    }

    case "cloud": {
      const baseY = size * 0.58
      const puffs: [number, number, number][] = [
        [size * 0.22, baseY + size * 0.06, size * 0.16],
        [size * 0.42, baseY - size * 0.08, size * 0.22],
        [size * 0.63, baseY - size * 0.1, size * 0.24],
        [size * 0.83, baseY + size * 0.02, size * 0.17],
      ]
      return puffs.map(([x, y, r], i) => generator.circle(x, y, r * 2, { ...base, seed: seed + i + 1 }))
    }

    case "lightningBolt": {
      const points: [number, number][] = [
        [size * 0.55, 0], [size * 0.25, size * 0.55], [size * 0.45, size * 0.55],
        [size * 0.3, size], [size * 0.75, size * 0.4], [size * 0.5, size * 0.4],
      ]
      return [generator.polygon(points, base)]
    }

    case "balloon": {
      const cx = size * 0.5
      const cy = size * 0.38
      const rx = size * 0.26
      const ry = size * 0.32
      const knotY = cy + ry
      const stringPath = `M${cx},${knotY + size * 0.04} C${cx - size * 0.1},${knotY + size * 0.2} ${cx + size * 0.1},${knotY + size * 0.35} ${cx - size * 0.04},${size * 0.95}`
      return [
        generator.ellipse(cx, cy, rx * 2, ry * 2, base),
        generator.line(cx, knotY, cx, knotY + size * 0.04, { stroke: fill, strokeWidth: 1.5, roughness: 1.4, seed: seed + 1 }),
        generator.path(stringPath, { stroke: fill, strokeWidth: 1.3, roughness: 1.3, fill: "none", seed: seed + 2 }),
      ]
    }

    case "flower": {
      const cx = size / 2
      const cy = size / 2
      const petalR = size * 0.16
      const dist = size * 0.22
      const centerR = size * 0.12
      const petals: Drawable[] = []
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2
        petals.push(generator.circle(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, petalR * 2, { ...base, seed: seed + i + 1 }))
      }
      return [...petals, generator.circle(cx, cy, centerR * 2, { ...base, seed })]
    }

    case "smileyFace": {
      const cx = size / 2
      const cy = size / 2
      const r = size * 0.42
      const eyeY = cy - r * 0.25
      const eyeOffsetX = r * 0.35
      const eyeR = size * 0.045
      const smilePath = `M${cx - r * 0.4},${cy + r * 0.15} C${cx - r * 0.2},${cy + r * 0.5} ${cx + r * 0.2},${cy + r * 0.5} ${cx + r * 0.4},${cy + r * 0.15}`
      const eyeStyle = { fill, fillStyle: "solid" as const, stroke: fill, strokeWidth: 1, roughness: 1.2 }
      return [
        generator.circle(cx, cy, r * 2, base),
        generator.circle(cx - eyeOffsetX, eyeY, eyeR * 2, { ...eyeStyle, seed: seed + 1 }),
        generator.circle(cx + eyeOffsetX, eyeY, eyeR * 2, { ...eyeStyle, seed: seed + 2 }),
        generator.path(smilePath, { stroke: fill, strokeWidth: 2, roughness: 1.4, fill: "none", seed: seed + 3 }),
      ]
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
