// Ambient, decorative-only clutter scattered around the page on wide
// screens: post-it notes plus a handful of whimsical shapes (star, heart,
// sun, lego piece). Fixed to the viewport, z-index -1, so it's always
// behind real content — some items sit in the margins, some sit directly
// behind the centered content column (they just won't be visible wherever
// a card happens to be on top of them, only in the gaps/short pages).
//
// Positions are randomized-looking but seeded — a fixed seed means the
// layout is the same arrangement every time the page loads, rather than
// reshuffling into a new one on every visit. Structure to the randomness,
// not a moving target. Sides, gaps, rotation, size, and color all still
// vary freely within that one generation. The only constraint kept is a
// minimum vertical gap per margin side so items don't stack on each other
// there, and a smaller safe horizontal reach near the very top for margin
// items, where the 1200px-wide nav bar itself needs clearing.

import type { CSSProperties } from "react"
import RoughNote from "./RoughNote"
import RoughShape, { type ShapeKind } from "./RoughShape"

const CLUTTER_SEED = 20260901

function mulberry32(seed: number) {
  let a = seed
  return function rand() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(CLUTTER_SEED)

type Placement =
  | { mode: "edge"; side: "left" | "right"; edge: string; top: string }
  | { mode: "center"; left: string; top: string }

type PostIt = Placement & {
  kind: "postit"
  color: "yellow" | "pink" | "mint"
  rotate: number
  width: number
  height: number
  rough: boolean
  folded: boolean
  radii: string
  seed: number
}

type Icon = Placement & {
  kind: "icon"
  shape: ShapeKind
  color: "yellow" | "pink" | "mint" | "ink"
  rotate: number
  size: number
  seed: number
}

type ClutterItem = PostIt | Icon

const postitColors: PostIt["color"][] = ["yellow", "pink", "mint"]
const shapeKinds: ShapeKind[] = ["star", "heart", "sun", "lego"]
const shapeColors: Icon["color"][] = ["yellow", "pink", "mint", "ink"]
const cornerOptions = ["0.05rem", "0.15rem", "0.55rem", "0.9rem"]

function randomBetween(min: number, max: number): number {
  return min + rand() * (max - min)
}

function pick<T>(list: T[]): T {
  return list[Math.floor(rand() * list.length)]
}

function randomRadii(): string {
  return `${pick(cornerOptions)} ${pick(cornerOptions)} ${pick(cornerOptions)} ${pick(cornerOptions)}`
}

function generateClutter(count: number): ClutterItem[] {
  const usedTops: Record<"left" | "right", number[]> = { left: [], right: [] }
  const items: ClutterItem[] = []

  for (let i = 0; i < count; i++) {
    let placement: Placement

    // Most items still hug the margins (always visible, never covered);
    // roughly a third land anywhere across the full width, including
    // directly behind the centered content column — z-index keeps them
    // safely behind cards, so they only show through in the gaps.
    if (rand() < 0.34) {
      placement = { mode: "center", left: `${randomBetween(6, 94).toFixed(1)}%`, top: `${randomBetween(2, 97).toFixed(1)}%` }
    } else {
      const side = rand() < 0.5 ? "left" : "right"

      let top = randomBetween(2, 96)
      let attempts = 0
      while (usedTops[side].some((t) => Math.abs(t - top) < 5) && attempts < 12) {
        top = randomBetween(2, 96)
        attempts++
      }
      usedTops[side].push(top)

      // Near the very top the nav bar spans 1200px, so keep the reach tight
      // there; further down only the 760px content column needs clearing.
      const maxEdge = top < 9 ? 3.2 : randomBetween(4, 13)
      const edge = randomBetween(0.4, maxEdge)
      placement = { mode: "edge", side, edge: `${edge.toFixed(1)}vw`, top: `${top.toFixed(1)}%` }
    }

    if (rand() < 0.32) {
      items.push({
        ...placement,
        kind: "icon",
        shape: pick(shapeKinds),
        color: pick(shapeColors),
        rotate: randomBetween(-20, 22),
        size: Math.round(randomBetween(34, 56)),
        seed: Math.floor(rand() * 2147483647),
      })
      continue
    }

    const aspect = pick(["square", "wide", "tall"] as const)
    const base = randomBetween(46, 76)
    const width = aspect === "tall" ? base * randomBetween(0.55, 0.8) : base
    const height = aspect === "wide" ? base * randomBetween(0.55, 0.8) : base

    items.push({
      ...placement,
      kind: "postit",
      color: pick(postitColors),
      rotate: randomBetween(-16, 17),
      width: Math.round(width),
      height: Math.round(height),
      rough: rand() < 0.4,
      folded: rand() < 0.35,
      radii: randomRadii(),
      seed: Math.floor(rand() * 2147483647),
    })
  }

  return items
}

const clutter = generateClutter(32)

export default function DeskClutter() {
  return (
    <div className="desk-clutter" aria-hidden="true">
      {clutter.map((item, i) => {
        const positionStyle: CSSProperties =
          item.mode === "center" ? { left: item.left, top: item.top } : { [item.side]: item.edge, top: item.top }
        const wrapperStyle: CSSProperties = {
          ...positionStyle,
          transform: `rotate(${item.rotate}deg)`,
        }

        if (item.kind === "icon") {
          return (
            <div key={i} className="desk-icon" style={wrapperStyle}>
              <RoughShape kind={item.shape} size={item.size} color={item.color} seed={item.seed} />
            </div>
          )
        }

        if (item.rough) {
          return (
            <div
              key={i}
              className="desk-postit-wrap"
              style={{ ...wrapperStyle, width: item.width, height: item.height }}
            >
              <span className="tape-piece desk-postit-tape" />
              <RoughNote width={item.width} height={item.height} color={item.color} seed={item.seed} />
              {item.folded && <span className="postit-fold" />}
            </div>
          )
        }

        return (
          <div
            key={i}
            className={`desk-postit desk-postit-${item.color}`}
            style={{ ...wrapperStyle, position: "absolute", width: item.width, height: item.height, borderRadius: item.radii }}
          >
            {item.folded && <span className="postit-fold" />}
          </div>
        )
      })}
    </div>
  )
}
