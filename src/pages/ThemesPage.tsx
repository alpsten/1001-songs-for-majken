import { useEffect, useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { Link } from "react-router-dom"
import { familyEntries } from "../lib/familyEntries"
import { loadThemes } from "../lib/parseContent"
import { getAllGenreFamilies } from "../lib/genres"
import { hashString, pickFrom } from "../lib/hash"
import { postitColors } from "../lib/postitColors"
import { contentTilt, panelTilt } from "../lib/postitTilt"
import { getPostitShape } from "../lib/postitShape"
import { topCenterTapeStyles } from "../lib/fastenerCorners"
import TitlePostit from "../components/TitlePostit"
import StatusPostit from "../components/StatusPostit"
import NumberPostit from "../components/NumberPostit"
import PostitBase from "../components/PostitBase"
import Fastener from "../components/Fastener"
import type { Theme } from "../types"

const decadeOptions = [
  { slug: "1960s", label: "1960's" },
  { slug: "1970s", label: "1970's" },
  { slug: "1980s", label: "1980's" },
  { slug: "1990s", label: "1990's" },
  { slug: "2000s", label: "2000's" },
  { slug: "2010s", label: "2010's" },
  { slug: "2020s", label: "2020's" },
]

type ExploreSectionKey = "mood" | "genre" | "year" | "family"
const exploreSectionStorageKey = "explore-open-section"

type ExploreCategoryCardProps = {
  seedKey: string
  title: string
  summary: string
  isOpen: boolean
  onToggle: () => void
  children?: ReactNode
}

// Each Mood/Genre/Year/Family Entries toggle is a real post-it now, not a
// flat index card with a fixed accent-colored pin — same hashed-color +
// top-center-tape treatment as the tag postits inside it, so all four
// category cards read as part of the same paper system instead of a
// plain .detail-panel with only 3 possible pin colors cycling across 4
// cards.
//
// Tilt uses panelTilt(), not contentTilt() — this is a full-width panel,
// not a small content-tier note, and contentTilt()'s range visibly
// overlapped these four cards with their neighbors once one was tall
// (an expanded tag list inside it). See postitTilt.ts's own comment.
//
// The title is a NumberPostit badge — the same "double post-it" badge
// StatusPostit's own counts use (§10.1). The item count ("N moods") was
// here too at one point; direct follow-up feedback swapped it for a
// short plain-text summary sentence instead — a count didn't tell you
// anything about what the category actually was. The +/- icon is plain
// "Click to expand"/"Click to collapse" text now rather than a symbol,
// for the same reason: says what it does instead of a glyph you have to
// already know the meaning of.
function ExploreCategoryCard({ seedKey, title, summary, isOpen, onToggle, children }: ExploreCategoryCardProps) {
  const shape = getPostitShape(seedKey + "|category-shape")
  const color = pickFrom(postitColors, hashString(seedKey + "|category-color"))
  const tilt = panelTilt(seedKey + "|category-tilt")
  const wrapperStyle: CSSProperties & { "--tilt"?: string } = {
    "--tilt": `${tilt}deg`,
  }

  return (
    <div className="explore-category-wrap" style={wrapperStyle}>
      <PostitBase
        shape={shape}
        size="auto"
        colorVar={`var(--color-postit-${color})`}
        className="explore-category-postit"
      >
        <button type="button" className="explore-toggle" onClick={onToggle} aria-expanded={isOpen}>
          <NumberPostit value={title} seedKey={seedKey + "|category-title"} />
          <span className="explore-toggle-meta">{summary}</span>
          <span className="explore-toggle-hint">{isOpen ? "Click to collapse" : "Click to expand"}</span>
        </button>
        {isOpen && children}
      </PostitBase>
      <Fastener seedKey={seedKey + "|category-fastener"} pool={topCenterTapeStyles} />
    </div>
  )
}

type TagCardProps = {
  to: string
  seedKey: string
  children: ReactNode
}

// One hashed post-it per tag — shared by Mood/Genre/Year/Family Entries
// so all four lists render the exact same way (PostitBase for shape/
// grain/shadow, a top-center-only Fastener, the full nine-color
// palette). Replaces each section's own flat `.tag-postit` pill, which
// only ever cycled 3 fixed colors and read as a different, lesser paper
// system than the songs/artists cards elsewhere on the site.
function TagCard({ to, seedKey, children }: TagCardProps) {
  const shape = getPostitShape(seedKey + "|tag-shape")
  const color = pickFrom(postitColors, hashString(seedKey + "|tag-color"))
  const tilt = contentTilt(seedKey + "|tag-tilt")
  const wrapperStyle: CSSProperties & { "--tilt"?: string } = {
    "--tilt": `${tilt}deg`,
  }

  return (
    <Link to={to} className="explore-tag-link" style={wrapperStyle}>
      <PostitBase shape={shape} size="auto" colorVar={`var(--color-postit-${color})`} className="explore-tag-postit">
        {children}
      </PostitBase>
      <Fastener seedKey={seedKey + "|tag-fastener"} pool={topCenterTapeStyles} />
    </Link>
  )
}


export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [genres, setGenres] = useState<Array<{ slug: string; label: string }>>([])
  const [decades, setDecades] = useState<string[]>([])
  const [openSection, setOpenSection] = useState<ExploreSectionKey | null>(() => {
    if (typeof window === "undefined") return null
    const stored = window.sessionStorage.getItem(exploreSectionStorageKey)
      ?? window.sessionStorage.getItem("mood-open-section")
    return stored === "mood" || stored === "genre" || stored === "year" || stored === "family" ? stored : null
  })

  useEffect(() => {
    loadThemes().then((themeList) => {
      setThemes([...themeList].sort((a, b) => a.name.localeCompare(b.name)))
      setGenres(getAllGenreFamilies())
      setDecades(decadeOptions.map((decade) => decade.slug))
    })
  }, [])

  function toggleSection(section: ExploreSectionKey) {
    setOpenSection((current) => {
      const nextSection = current === section ? null : section
      if (typeof window !== "undefined") {
        if (nextSection) {
          window.sessionStorage.setItem(exploreSectionStorageKey, nextSection)
          window.sessionStorage.removeItem("mood-open-section")
        } else {
          window.sessionStorage.removeItem(exploreSectionStorageKey)
          window.sessionStorage.removeItem("mood-open-section")
        }
      }
      return nextSection
    })
  }

  return (
    <div className="detail-page">
      <header className="detail-header detail-header-centered">
        <TitlePostit seedKey="page-explore-2">Explore</TitlePostit>
        <StatusPostit seedKey="page-explore-intro" align="center" className="not-italic">
          Open a category to browse by mood, genre, release decade, and family entries.
        </StatusPostit>
      </header>

      {/* Reading order Mood/Family Entries on top, Year/Genre below —
          direct request (Year and Genre swapped from an earlier round,
          which had Genre/Year). Two layouts, chosen by whether a
          category is open, not one static grid — see the const below and
          .explore-grid/.explore-focus's own comments in global.css. */}
      {(() => {
        const cards = [
          {
            key: "mood" as const,
            node: (
              <ExploreCategoryCard
                key="mood"
                seedKey="explore-category-mood"
                title="Mood"
                summary="Songs sorted by how they feel."
                isOpen={openSection === "mood"}
                onToggle={() => toggleSection("mood")}
              >
                <div className="detail-pill-list detail-pill-list-explore">
                  {themes.map((theme) => (
                    <TagCard key={theme.id} to={`/explore/${theme.slug}`} seedKey={theme.id}>
                      {theme.name}
                    </TagCard>
                  ))}
                </div>
              </ExploreCategoryCard>
            ),
          },
          {
            key: "family" as const,
            node: (
              <ExploreCategoryCard
                key="family"
                seedKey="explore-category-family"
                title="Family Entries"
                summary="Songs picked out for someone in the family."
                isOpen={openSection === "family"}
                onToggle={() => toggleSection("family")}
              >
                <div className="detail-pill-list detail-pill-list-explore">
                  {familyEntries.map((entry) => (
                    <TagCard key={entry.slug} to={`/explore/family/${entry.slug}`} seedKey={entry.slug}>
                      {entry.name}
                    </TagCard>
                  ))}
                </div>
              </ExploreCategoryCard>
            ),
          },
          {
            key: "year" as const,
            node: (
              <ExploreCategoryCard
                key="year"
                seedKey="explore-category-year"
                title="Year"
                summary="Songs sorted by the decade they came out."
                isOpen={openSection === "year"}
                onToggle={() => toggleSection("year")}
              >
                <div className="detail-pill-list detail-pill-list-explore">
                  {decades.map((decade) => (
                    <TagCard key={decade} to={`/explore/${decade}`} seedKey={`decade-${decade}`}>
                      {decadeOptions.find((option) => option.slug === decade)?.label ?? decade}
                    </TagCard>
                  ))}
                </div>
              </ExploreCategoryCard>
            ),
          },
          {
            key: "genre" as const,
            node: (
              <ExploreCategoryCard
                key="genre"
                seedKey="explore-category-genre"
                title="Genre"
                summary="Songs sorted by genre family."
                isOpen={openSection === "genre"}
                onToggle={() => toggleSection("genre")}
              >
                {genres.length > 0 ? (
                  <div className="detail-pill-list detail-pill-list-explore">
                    {genres.map((genre) => (
                      <TagCard key={genre.slug} to={`/explore/genre/${genre.slug}`} seedKey={`genre-${genre.slug}`}>
                        {genre.label}
                      </TagCard>
                    ))}
                  </div>
                ) : (
                  <p className="archive-copy">[No genres added]</p>
                )}
              </ExploreCategoryCard>
            ),
          },
        ]

        if (!openSection) {
          return <div className="explore-grid">{cards.map((card) => card.node)}</div>
        }

        const openCard = cards.find((card) => card.key === openSection)
        const restCards = cards.filter((card) => card.key !== openSection)
        return (
          <div className="explore-focus">
            <div className="explore-focus-open">{openCard?.node}</div>
            <div className="explore-focus-rest">{restCards.map((card) => card.node)}</div>
          </div>
        )
      })()}
    </div>
  )
}
