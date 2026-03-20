import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { loadThemes, loadSongs } from "../lib/parseContent"
import type { Theme, Song } from "../types"
import styles from "./ThemeDetailPage.module.css"

export default function ThemeDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [theme, setTheme] = useState<Theme | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [relatedThemes, setRelatedThemes] = useState<Theme[]>([])

  useEffect(() => {
    Promise.all([loadThemes(), loadSongs()]).then(([allThemes, allSongs]) => {
      const found = allThemes.find((t) => t.slug === slug) ?? null
      setTheme(found)
      if (found) {
        setSongs(allSongs.filter((s) => s.themeIds?.includes(found.id) && s.status === "published"))
        setRelatedThemes(allThemes.filter((t) => found.relatedThemeIds?.includes(t.id)))
      }
    })
  }, [slug])

  if (!theme) return <p>Loading...</p>

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1>{theme.name}</h1>
        {theme.description && <p className={styles.desc}>{theme.description}</p>}
      </header>

      {songs.length > 0 && (
        <section className={styles.section}>
          <h3>Songs with this theme</h3>
          <ul className={styles.songList}>
            {songs.map((s) => (
              <li key={s.id}>
                <Link to={`/songs/${s.slug}`}>{s.title}</Link>
                <span className={styles.year}>{s.year}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedThemes.length > 0 && (
        <section className={styles.section}>
          <h3>Related themes</h3>
          <div className={styles.relatedList}>
            {relatedThemes.map((t) => (
              <Link key={t.id} to={`/themes/${t.slug}`}>{t.name}</Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
