import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { loadSongs } from "../lib/parseContent"
import { getGenreFamily, getGenreFamilyBySlug } from "../lib/genres"
import type { Song } from "../types"

export default function GenreDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [songs, setSongs] = useState<Song[]>([])

  const family = slug ? getGenreFamilyBySlug(slug) : null

  useEffect(() => {
    if (!family) return

    loadSongs().then((allSongs) => {
      setSongs(
        allSongs.filter(
          (song) =>
            song.status === "published" &&
            (song.genreTags ?? []).some((genre) => getGenreFamily(genre).slug === family.slug)
        )
      )
    })
  }, [family])

  if (!family) return null

  const subGenres = Array.from(
    new Set(
      songs.flatMap((song) =>
        (song.genreTags ?? []).filter((genre) => getGenreFamily(genre).slug === family.slug)
      )
    )
  ).sort((a, b) => a.localeCompare(b))

  return (
    <div className="detail-page">
      <header className="detail-header">
        <h1 className="detail-title font-normal">{family.label}</h1>
        <p className="detail-note not-italic">
          Browse the subgenres collected under {family.label}.
        </p>
      </header>

      <div className="detail-stack">
        <section className="detail-panel detail-section">
          <h3 className="detail-section-title">Subgenres</h3>
          {subGenres.length > 0 ? (
            <div className="detail-pill-list">
              {subGenres.map((genre) => (
                <Link key={genre} to={`/songs?genre=${encodeURIComponent(genre)}`} className="ui-pill ui-pill-compact">
                  <span>{genre}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="detail-placeholder">[No subgenres added]</p>
          )}
        </section>

        <section className="detail-panel detail-section">
          <h3 className="detail-section-title">Songs in this genre family</h3>
          {songs.length > 0 ? (
            <ul className="list-none detail-pill-list">
              {songs.map((song) => (
                <li key={song.id}>
                  <Link to={`/songs/${song.slug}`} className="ui-pill ui-pill-compact">
                    <span>{song.title} ({song.year})</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="detail-placeholder">[No songs added]</p>
          )}
        </section>
      </div>
    </div>
  )
}
