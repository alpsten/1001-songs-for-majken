import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { loadThemes, loadSongs } from "../lib/parseContent"
import type { Theme, Song } from "../types"

const decadeOptions = [
  { slug: "1960s", label: "1960's", startYear: 1960, endYear: 1969 },
  { slug: "1970s", label: "1970's", startYear: 1970, endYear: 1979 },
  { slug: "1980s", label: "1980's", startYear: 1980, endYear: 1989 },
  { slug: "1990s", label: "1990's", startYear: 1990, endYear: 1999 },
  { slug: "2000s", label: "2000's", startYear: 2000, endYear: 2009 },
  { slug: "2010s", label: "2010's", startYear: 2010, endYear: 2019 },
  { slug: "2020s", label: "2020's", startYear: 2020, endYear: 2029 },
]

export default function ThemeDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [theme, setTheme] = useState<Theme | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [relatedThemes, setRelatedThemes] = useState<Theme[]>([])
  const [decadeLabel, setDecadeLabel] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([loadThemes(), loadSongs()]).then(([allThemes, allSongs]) => {
      const selectedDecade = decadeOptions.find((option) => option.slug === slug) ?? null

      if (selectedDecade) {
        setTheme(null)
        setDecadeLabel(selectedDecade.label)
        setRelatedThemes([])
        setSongs(
          allSongs.filter(
            (song) =>
              song.status === "published" &&
              song.year >= selectedDecade.startYear &&
              song.year <= selectedDecade.endYear
          )
        )
        return
      }

      const found = allThemes.find((t) => t.slug === slug) ?? null
      setTheme(found)
      setDecadeLabel(null)
      if (found) {
        setSongs(allSongs.filter((s) => s.themeIds?.includes(found.id) && s.status === "published"))
        setRelatedThemes(allThemes.filter((t) => found.relatedThemeIds?.includes(t.id)))
      }
    })
  }, [slug])

  if (!theme && !decadeLabel) return null

  return (
    <div className="detail-page">
      <header className="detail-header">
        <h1 className="detail-title font-normal">{theme?.name ?? decadeLabel}</h1>
        {theme?.description && <p className="detail-note not-italic">{theme.description}</p>}
      </header>

      <div className="detail-stack">
        {songs.length > 0 && (
          <section className="detail-panel detail-section">
            <h3 className="detail-section-title">{theme ? "Songs with this mood" : `Songs from the ${decadeLabel}`}</h3>
            <ul className="list-none detail-pill-list">
              {songs.map((s) => (
                <li key={s.id}>
                  <Link to={`/songs/${s.slug}`} className="ui-pill ui-pill-compact">
                    <span>{s.title} ({s.year})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!songs.length && (
          <section className="detail-panel">
            <p className="detail-placeholder">[No songs added]</p>
          </section>
        )}

        {theme && relatedThemes.length > 0 && (
          <section className="detail-panel detail-section">
            <h3 className="detail-section-title">Related moods</h3>
            <div className="detail-pill-list">
              {relatedThemes.map((t) => (
                <Link key={t.id} to={`/explore/${t.slug}`} className="ui-pill ui-pill-compact">
                  <span>{t.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
