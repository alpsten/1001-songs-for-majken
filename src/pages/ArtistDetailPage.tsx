import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { loadArtists, loadSongs } from "../lib/parseContent"
import type { Artist, Song } from "../types"
import styles from "./ArtistDetailPage.module.css"

export default function ArtistDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([])

  useEffect(() => {
    Promise.all([loadArtists(), loadSongs()]).then(([allArtists, allSongs]) => {
      const found = allArtists.find((a) => a.slug === slug) ?? null
      setArtist(found)
      if (found) {
        setSongs(allSongs.filter((s) => s.artistIds.includes(found.id) && s.status === "published"))
        setRelatedArtists(allArtists.filter((a) => found.relatedArtistIds?.includes(a.id)))
      }
    })
  }, [slug])

  if (!artist) return <p>Loading...</p>

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1>{artist.name}</h1>
        <div className={styles.meta}>
          {artist.country && <span>{artist.country}</span>}
          {artist.birthYear && <><span className={styles.dot}>·</span><span>b. {artist.birthYear}</span></>}
          {artist.formedYear && <><span className={styles.dot}>·</span><span>formed {artist.formedYear}</span></>}
        </div>
        {artist.summary && <p className={styles.summary}>{artist.summary}</p>}
      </header>

      {songs.length > 0 && (
        <section className={styles.section}>
          <h3>Songs in the archive</h3>
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

      {relatedArtists.length > 0 && (
        <section className={styles.section}>
          <h3>Related artists</h3>
          <div className={styles.relatedList}>
            {relatedArtists.map((a) => (
              <Link key={a.id} to={`/artists/${a.slug}`}>{a.name}</Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
