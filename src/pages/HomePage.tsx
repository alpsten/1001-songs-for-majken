import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { loadSongs, loadArtists, loadThemes } from "../lib/parseContent"
import { getDailySong } from "../lib/getDailySong"
import type { Song, Artist, Theme } from "../types"
import styles from "./HomePage.module.css"

export default function HomePage() {
  const [dailySong, setDailySong] = useState<Song | null>(null)
  const [artists, setArtists] = useState<Artist[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])

  useEffect(() => {
    Promise.all([loadSongs(), loadArtists(), loadThemes()]).then(([songs, arts, thms]) => {
      setDailySong(getDailySong(songs))
      setArtists(arts.slice(0, 6))
      setThemes(thms)
      const sorted = [...songs]
        .filter((s) => s.status === "published")
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
        .slice(0, 5)
      setRecentSongs(sorted)
    })
  }, [])

  return (
    <div className={styles.page}>
      <section className={styles.intro}>
        <h1>1001 Songs for Majken</h1>
        <p>A music archive built with love. Songs, stories, and the memories attached to them — a world to explore at any pace.</p>
      </section>

      {dailySong && (
        <section className={styles.section}>
          <h2>Song of the day</h2>
          <Link to={`/songs/${dailySong.slug}`} className={styles.dailyCard}>
            <div className={styles.dailyTitle}>{dailySong.title}</div>
            <div className={styles.dailyWhy}>{dailySong.whyItMatters}</div>
          </Link>
        </section>
      )}

      <section className={styles.section}>
        <h2>Explore by theme</h2>
        <div className={styles.tagList}>
          {themes.map((t) => (
            <Link key={t.id} to={`/themes/${t.slug}`} className={styles.tag}>{t.name}</Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Explore by artist</h2>
        <div className={styles.artistList}>
          {artists.map((a) => (
            <Link key={a.id} to={`/artists/${a.slug}`} className={styles.artistLink}>{a.name}</Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Recently added</h2>
        <ul className={styles.songList}>
          {recentSongs.map((s) => (
            <li key={s.id}>
              <Link to={`/songs/${s.slug}`}>{s.title}</Link>
              <span className={styles.year}>{s.year}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
