import RoughNote from "./RoughNote"
import type { CardNote } from "../lib/cardNote"

// Renders whichever of the three note styles this card was assigned:
// a clean rounded post-it, a torn scrap (both plain CSS), or a
// hand-sketched one drawn by rough.js.
export default function CardNoteMark({ note }: { note: CardNote }) {
  if (note.shape === "rough") {
    return (
      <RoughNote
        width={note.size}
        height={note.size}
        color={note.color}
        seed={note.seed}
        className={`card-note-svg card-note-${note.corner}`}
      />
    )
  }

  return (
    <span
      className={`card-note card-note-${note.color} card-note-${note.corner} card-note-${note.shape}`}
      style={{ width: note.size, height: note.size }}
    />
  )
}
