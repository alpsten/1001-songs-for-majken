import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { loadSongs } from "../lib/parseContent"
import { getGenreFamily, getGenreFamilyBySlug } from "../lib/genres"
import TitlePostit from "../components/TitlePostit"
import StatusPostit from "../components/StatusPostit"
import TagCard from "../components/TagCard"
import BrowseRow from "../components/BrowseRow"
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
        <TitlePostit seedKey={family.slug}>{family.label}</TitlePostit>
        <p className="detail-note not-italic">
          Browse the subgenres collected under {family.label}.
        </p>
      </header>

      <div className="detail-stack">
        <section className="detail-section">
          <h3 className="detail-section-title">Subgenres</h3>
          {subGenres.length > 0 ? (
            <div className="detail-pill-list">
              {subGenres.map((genre) => (
                <TagCard key={genre} to={`/songs?genre=${encodeURIComponent(genre)}`} seedKey={`genre-subgenre-${family.slug}-${genre}`}>
                  <span>{genre}</span>
                </TagCard>
              ))}
            </div>
          ) : (
            <p className="detail-placeholder">[No subgenres added]</p>
          )}
        </section>

        <section className="detail-section">
          <StatusPostit seedKey={`genre-songs-heading-${family.slug}`} align="center">
            Songs in this genre family
          </StatusPostit>
          {songs.length > 0 ? (
            <div className="browse-row-list">
              {songs.map((song) => (
                <BrowseRow key={song.id} to={`/songs/${song.slug}`} seedKey={song.id}>
                  <span className="archive-link-title">&apos;{song.title}&apos;</span>
                  <span className="archive-song-artist browse-row-line">{song.year}</span>
                </BrowseRow>
              ))}
            </div>
          ) : (
            <p className="detail-placeholder">[No songs added]</p>
          )}
        </section>
      </div>
    </div>
  )
}
