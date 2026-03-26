import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { loadArtists } from "../lib/parseContent"
import { formatGenreTag } from "../lib/genres"
import type { Artist } from "../types"

function getArtistSortName(name: string): string {
  return name.replace(/^the\s+/i, "").trim()
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])

  useEffect(() => {
    loadArtists().then((list) =>
      setArtists(
        [...list].sort((a, b) => getArtistSortName(a.name).localeCompare(getArtistSortName(b.name)))
      )
    )
  }, [])

  return (
    <div className="detail-page">
      <header className="detail-header">
        <div aria-hidden="true" className="detail-title-spacer" />
      </header>

      <div className="detail-stack">
        <section className="detail-panel">
          <ul className="archive-list">
            {artists.map((artist) => (
              <li key={artist.id} className="archive-item">
                <div className="archive-item-row">
                  <Link to={`/artists/${artist.slug}`} className="archive-link archive-link-title">
                    {artist.name}
                  </Link>
                  {artist.genreTags?.length ? (
                    <div className="archive-side-pills">
                      {artist.genreTags.slice(0, 2).map((genre) => (
                        <span key={genre} className="ui-pill ui-pill-compact archive-side-pill">
                          <span>{formatGenreTag(genre)}</span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                {artist.summary && <p className="archive-copy">{artist.summary}</p>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
