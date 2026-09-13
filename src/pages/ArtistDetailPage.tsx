import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { loadArtists, loadSongs } from "../lib/parseContent"
import { formatGenreTag, getGenreFamily } from "../lib/genres"
import TitlePostit from "../components/TitlePostit"
import StatusPostit from "../components/StatusPostit"
import BrowseRow from "../components/BrowseRow"
import TagCard from "../components/TagCard"
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
        <TitlePostit seedKey={artist.id}>{artist.name}</TitlePostit>
        <div className="detail-meta-row">
          {artist.country && <span className="ui-pill ui-pill-compact"><span>{artist.country}</span></span>}
          {artist.birthYear && <span className="ui-pill ui-pill-compact"><span>b. {artist.birthYear}</span></span>}
          {artist.formedYear && <span className="ui-pill ui-pill-compact"><span>formed {artist.formedYear}</span></span>}
        </div>
        {artist.genreTags && artist.genreTags.length > 0 && (
          <div className="detail-pill-list">
            {artist.genreTags.map((tag) => {
              const genre = getGenreFamily(tag)
              return (
                <TagCard key={tag} to={`/explore/genre/${genre.slug}`} seedKey={`artist-genre-${artist.id}-${tag}`}>
                  <span>{formatGenreTag(tag)}</span>
                </TagCard>
              )
            })}
          </div>
        )}
        {artist.summary && <p className="detail-note not-italic">{artist.summary}</p>}
      </header>

      <div className="detail-stack">
        {songs.length > 0 && (
          <section className="detail-panel detail-section">
            <StatusPostit seedKey={`artist-songs-heading-${artist.id}`} align="center">
              Songs in the archive
            </StatusPostit>
            <div className="browse-row-list">
              {songs.map((s) => (
                <BrowseRow key={s.id} to={`/songs/${s.slug}`} seedKey={s.id}>
                  <span className="archive-link-title">&apos;{s.title}&apos;</span>
                  <span className="archive-song-artist browse-row-line">{s.year}</span>
                </BrowseRow>
              ))}
            </div>
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
