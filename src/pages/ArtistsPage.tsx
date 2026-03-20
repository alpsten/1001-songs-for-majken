import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { loadArtists } from "../lib/parseContent"
import type { Artist } from "../types"
import styles from "./ArtistsPage.module.css"

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])

  useEffect(() => {
    loadArtists().then((list) => setArtists(list.sort((a, b) => a.name.localeCompare(b.name))))
  }, [])

  return (
    <div>
      <h1>Artists</h1>
      <ul className={styles.list}>
        {artists.map((artist) => (
          <li key={artist.id} className={styles.item}>
            <Link to={`/artists/${artist.slug}`} className={styles.name}>{artist.name}</Link>
            {artist.summary && <p className={styles.summary}>{artist.summary}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
