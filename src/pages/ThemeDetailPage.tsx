import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { loadThemes, loadSongs } from "../lib/parseContent"
import TitlePostit from "../components/TitlePostit"
import StatusPostit from "../components/StatusPostit"
import TagCard from "../components/TagCard"
import BrowseRow from "../components/BrowseRow"
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
        <TitlePostit seedKey={theme?.id ?? decadeLabel ?? "theme"}>{theme?.name ?? decadeLabel}</TitlePostit>
        {theme?.description && <p className="detail-note not-italic">{theme.description}</p>}
      </header>

      <div className="detail-stack">
        {songs.length > 0 && (
          <section className="detail-section">
            <StatusPostit seedKey={`theme-songs-heading-${theme?.id ?? decadeLabel}`} align="center">
              {theme ? "Songs with this mood" : `Songs from the ${decadeLabel}`}
            </StatusPostit>
            <div className="browse-row-list">
              {songs.map((s) => (
                <BrowseRow key={s.id} to={`/songs/${s.slug}`} seedKey={s.id}>
                  <span className="archive-link-title">&apos;{s.title}&apos;</span>
                  <span className="archive-song-artist browse-row-line">{s.year}</span>
                </BrowseRow>
              ))}
            </div>
          </section>
        )}

        {!songs.length && (
          <section className="detail-panel">
            <p className="detail-placeholder">[No songs added]</p>
          </section>
        )}

        {theme && relatedThemes.length > 0 && (
          <section className="detail-section">
            <h3 className="detail-section-title">Related moods</h3>
            <div className="detail-pill-list">
              {relatedThemes.map((t) => (
                <TagCard key={t.id} to={`/explore/${t.slug}`} seedKey={`theme-related-${t.id}`}>
                  <span>{t.name}</span>
                </TagCard>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
