import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { loadSongs, loadArtists, loadThemes } from "../lib/parseContent"
import type { Song, Artist, Theme } from "../types"
import styles from "./SongDetailPage.module.css"

export default function SongDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [song, setSong] = useState<Song | null>(null)
  const [artists, setArtists] = useState<Artist[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [relatedSongs, setRelatedSongs] = useState<Song[]>([])

  useEffect(() => {
    Promise.all([loadSongs(), loadArtists(), loadThemes()]).then(([songs, allArtists, allThemes]) => {
      const found = songs.find((s) => s.slug === slug) ?? null
      setSong(found)
      if (found) {
        setArtists(allArtists.filter((a) => found.artistIds.includes(a.id)))
        setThemes(allThemes.filter((t) => found.themeIds?.includes(t.id)))
        setRelatedSongs(songs.filter((s) => found.relatedSongIds?.includes(s.id)))
      }
    })
  }, [slug])

  if (!song) return <p>Loading...</p>

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1>{song.title}</h1>
        <div className={styles.meta}>
          {artists.map((a) => (
            <Link key={a.id} to={`/artists/${a.slug}`}>{a.name}</Link>
          ))}
          <span className={styles.dot}>·</span>
          <span>{song.year}</span>
        </div>
        <p className={styles.why}>{song.whyItMatters}</p>
      </header>

      {song.story && (
        <section className={styles.story}>
          {song.story.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </section>
      )}

      {themes.length > 0 && (
        <section className={styles.connections}>
          <h3>Themes</h3>
          <div className={styles.tagList}>
            {themes.map((t) => (
              <Link key={t.id} to={`/themes/${t.slug}`} className={styles.tag}>{t.name}</Link>
            ))}
          </div>
        </section>
      )}

      {relatedSongs.length > 0 && (
        <section className={styles.connections}>
          <h3>Related songs</h3>
          <ul className={styles.relatedList}>
            {relatedSongs.map((s) => (
              <li key={s.id}><Link to={`/songs/${s.slug}`}>{s.title}</Link></li>
            ))}
          </ul>
        </section>
      )}

      {artists.length > 0 && (
        <section className={styles.connections}>
          <h3>{artists.length === 1 ? "Artist" : "Artists"}</h3>
          <ul className={styles.relatedList}>
            {artists.map((a) => (
              <li key={a.id}><Link to={`/artists/${a.slug}`}>{a.name}</Link></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
