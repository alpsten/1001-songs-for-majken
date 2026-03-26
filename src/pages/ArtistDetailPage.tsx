import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { loadArtists, loadSongs } from "../lib/parseContent"
import type { Artist, Song } from "../types"

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

  if (!artist) return null

  return (
    <div className="detail-page">
      <header className="detail-header">
        <h1 className="detail-title font-normal">{artist.name}</h1>
        <div className="detail-meta-row">
          {artist.country && <span className="ui-pill ui-pill-compact"><span>{artist.country}</span></span>}
          {artist.birthYear && <span className="ui-pill ui-pill-compact"><span>b. {artist.birthYear}</span></span>}
          {artist.formedYear && <span className="ui-pill ui-pill-compact"><span>formed {artist.formedYear}</span></span>}
        </div>
        {artist.summary && <p className="detail-note not-italic">{artist.summary}</p>}
      </header>

      <div className="detail-stack">
        {songs.length > 0 && (
          <section className="detail-panel detail-section">
            <h3 className="detail-section-title">Songs in the archive</h3>
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

        {relatedArtists.length > 0 && (
          <section className="detail-panel detail-section">
            <h3 className="detail-section-title">Related artists</h3>
            <div className="detail-pill-list">
              {relatedArtists.map((a) => (
                <Link key={a.id} to={`/artists/${a.slug}`} className="ui-pill ui-pill-compact">
                  <span>{a.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
