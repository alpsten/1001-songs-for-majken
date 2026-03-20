import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { loadSongs, loadArtists } from "../lib/parseContent"
import type { Song, Artist } from "../types"
import styles from "./SongsPage.module.css"

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [artists, setArtists] = useState<Record<string, Artist>>({})

  useEffect(() => {
    Promise.all([loadSongs(), loadArtists()]).then(([songList, artistList]) => {
      const artistMap: Record<string, Artist> = {}
      artistList.forEach((a) => { artistMap[a.id] = a })
      setArtists(artistMap)
      setSongs(songList.filter((s) => s.status === "published").sort((a, b) => a.title.localeCompare(b.title)))
    })
  }, [])

  return (
    <div>
      <h1>Songs</h1>
      <p className={styles.count}>{songs.length} songs in the archive</p>
      <ul className={styles.list}>
        {songs.map((song) => (
          <li key={song.id} className={styles.item}>
            <Link to={`/songs/${song.slug}`} className={styles.title}>{song.title}</Link>
            <div className={styles.meta}>
              {song.artistIds.map((id) => artists[id]?.name).filter(Boolean).join(", ")}
              <span className={styles.dot}>·</span>
              <span>{song.year}</span>
            </div>
            <p className={styles.why}>{song.whyItMatters}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
