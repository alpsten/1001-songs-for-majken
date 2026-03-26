import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { familyEntries } from "../lib/familyEntries"
import { loadThemes } from "../lib/parseContent"
import { getAllGenreFamilies } from "../lib/genres"
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
      <header className="detail-header">
        <div aria-hidden="true" className="detail-title-spacer" />
        <p className="detail-note not-italic">
          Open a category to browse by mood, genre, release decade, and family entries.
        </p>
      </header>

      <div className="detail-stack">
        <section className="detail-panel detail-section">
          <button type="button" className="explore-toggle" onClick={() => toggleSection("mood")} aria-expanded={openSection === "mood"}>
            <span>
              <span className="detail-section-title">Mood</span>
              <span className="explore-toggle-meta">{themes.length} moods</span>
            </span>
            <span className="explore-toggle-icon">{openSection === "mood" ? "−" : "+"}</span>
          </button>
          {openSection === "mood" && (
            <div className="detail-pill-list">
              {themes.map((theme) => (
                <Link key={theme.id} to={`/explore/${theme.slug}`} className="ui-pill ui-pill-compact">
                  <span>{theme.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="detail-panel detail-section">
          <button type="button" className="explore-toggle" onClick={() => toggleSection("genre")} aria-expanded={openSection === "genre"}>
            <span>
              <span className="detail-section-title">Genre</span>
              <span className="explore-toggle-meta">{genres.length} genre families</span>
            </span>
            <span className="explore-toggle-icon">{openSection === "genre" ? "−" : "+"}</span>
          </button>
          {openSection === "genre" && (
            genres.length > 0 ? (
              <div className="detail-pill-list">
                {genres.map((genre) => (
                  <Link key={genre.slug} to={`/explore/genre/${genre.slug}`} className="ui-pill ui-pill-compact">
                    <span>{genre.label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="archive-copy">[No genres added]</p>
            )
          )}
        </section>

        <section className="detail-panel detail-section">
          <button type="button" className="explore-toggle" onClick={() => toggleSection("year")} aria-expanded={openSection === "year"}>
            <span>
              <span className="detail-section-title">Year</span>
              <span className="explore-toggle-meta">{decades.length} decades</span>
            </span>
            <span className="explore-toggle-icon">{openSection === "year" ? "−" : "+"}</span>
          </button>
          {openSection === "year" && (
            <div className="detail-pill-list">
              {decades.map((decade) => (
                <Link key={decade} to={`/explore/${decade}`} className="ui-pill ui-pill-compact">
                  <span>{decadeOptions.find((option) => option.slug === decade)?.label ?? decade}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="detail-panel detail-section">
          <button type="button" className="explore-toggle" onClick={() => toggleSection("family")} aria-expanded={openSection === "family"}>
            <span>
              <span className="detail-section-title">Family Entries</span>
              <span className="explore-toggle-meta">{familyEntries.length} family members</span>
            </span>
            <span className="explore-toggle-icon">{openSection === "family" ? "−" : "+"}</span>
          </button>
          {openSection === "family" && (
            <div className="detail-pill-list">
              {familyEntries.map((entry) => (
                <Link key={entry.slug} to={`/explore/family/${entry.slug}`} className="ui-pill ui-pill-compact">
                  <span>{entry.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
