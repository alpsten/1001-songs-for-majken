import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { loadSongs, loadArtists } from "../lib/parseContent"
import { getSongArtistEntities } from "../lib/songArtists"
import type { Song, Artist } from "../types"

const noMemoryPlaceholder = "[No memory added]"

export default function SongDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [song, setSong] = useState<Song | null>(null)
  const [artistsById, setArtistsById] = useState<Record<string, Artist>>({})

  useEffect(() => {
    Promise.all([loadSongs(), loadArtists()]).then(([songs, allArtists]) => {
      const found = songs.find((s) => s.slug === slug) ?? null
      setSong(found)
      setArtistsById(
        allArtists.reduce<Record<string, Artist>>((acc, artist) => {
          acc[artist.id] = artist
          return acc
        }, {})
      )
    })
  }, [slug])

  if (!song) return null

  const { primary, featured } = getSongArtistEntities(song, artistsById)

  return (
    <div className="detail-page">
      <header className="detail-header">
        <h1 className="detail-title font-normal">{song.title}</h1>
        <div className="detail-meta-row">
          {primary.map((a) => (
            <Link key={a.id} to={`/artists/${a.slug}`} className="ui-pill ui-pill-compact">
              <span>{a.name}</span>
            </Link>
          ))}
          {featured.map((a) => (
            <Link key={a.id} to={`/artists/${a.slug}`} className="ui-pill ui-pill-compact">
              <span>feat. {a.name}</span>
            </Link>
          ))}
          <span className="ui-pill ui-pill-compact">
            <span>{song.year}</span>
          </span>
        </div>
        {song.whyItMatters && song.whyItMatters !== noMemoryPlaceholder && (
          <p className="detail-note">{song.whyItMatters}</p>
        )}
      </header>

      <div className="detail-stack">
        <section className="detail-panel">
          <div className="detail-panel-copy">
            {song.story
              ? song.story.split("\n\n").map((para, i) => <p key={i}>{para}</p>)
              : <p className="detail-placeholder">{noMemoryPlaceholder}</p>
            }
          </div>
        </section>
      </div>
    </div>
  )
}
