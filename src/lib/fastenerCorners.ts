// The tape placement styles, rendered by Fastener.tsx. See
// docs/DESIGN_SYSTEM.md §5.2.
export const tapeStyles = [
  "top-center",
  "top-both",
  "all-four",
  "both-sides",
] as const

export type TapeStyle = (typeof tapeStyles)[number]

// Single top-center strip only, no corner pairs, no sides, no all-four —
// for callers that want tape restricted to the top edge exclusively.
// Started as "top-center or top-both" (both put tape only along the top)
// but direct feedback was that top-both's two diagonal corner pieces
// read as barely-there tape on some colors (small triangles, easy to
// miss, especially against light postits) — narrowed to top-center only.
// ThemesPage.tsx's TagCard and ExploreCategoryCard (/explore) both use
// this exclusively.
export const topCenterTapeStyles: readonly TapeStyle[] = ["top-center"]
