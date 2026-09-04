import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { loadArtists, loadSongs } from "../lib/parseContent"
import { formatGenreTag } from "../lib/genres"
import TitlePostit from "../components/TitlePostit"
import StatusPostit from "../components/StatusPostit"
import NumberPostit from "../components/NumberPostit"
import BrowseRow from "../components/BrowseRow"
import type { Artist, Song } from "../types"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
const browseLetters = ["#", ...alphabet]
const browseLetterRows = [browseLetters.slice(0, 13), browseLetters.slice(13)]

function getArtistSortName(name: string): string {
  return name.replace(/^the\s+/i, "").trim()
}

function getArtistLetter(name: string): string {
  const firstCharacter = getArtistSortName(name).charAt(0).toUpperCase()
  return /^[A-Z]$/.test(firstCharacter) ? firstCharacter : "#"
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedLetter = searchParams.get("letter") ?? ""
  const searchQuery = searchParams.get("q") ?? ""

  useEffect(() => {
    Promise.all([loadArtists(), loadSongs()]).then(([arts, sngs]) => {
      setArtists([...arts].sort((a, b) => getArtistSortName(a.name).localeCompare(getArtistSortName(b.name))))
      setSongs(sngs)
    })
  }, [])

  const songCountById = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const song of songs) {
      if (song.status !== "published") continue
      for (const id of [...(song.artistIds ?? []), ...(song.featuredArtistIds ?? [])]) {
        counts[id] = (counts[id] ?? 0) + 1
      }
    }
    return counts
  }, [songs])

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const matchingArtists = normalizedQuery
    ? artists.filter((artist) => artist.name.toLowerCase().includes(normalizedQuery))
    : artists

  const availableLetters = browseLetters.filter((letter) =>
    matchingArtists.some((artist) => getArtistLetter(artist.name) === letter)
  )

  const isFiltered = Boolean(normalizedQuery || selectedLetter)
  const visibleArtists = selectedLetter
    ? matchingArtists.filter((artist) => getArtistLetter(artist.name) === selectedLetter)
    : matchingArtists

  const groupedResults = useMemo(() => {
    const map = new Map<string, Artist[]>()
    for (const artist of visibleArtists) {
      const letter = getArtistLetter(artist.name)
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter)!.push(artist)
    }
    return map
  }, [visibleArtists])

  const visibleLetters = browseLetters.filter((letter) => groupedResults.has(letter))

  function toggleLetter(letter: string) {
    const next = new URLSearchParams(searchParams)
    if (selectedLetter === letter) next.delete("letter")
    else next.set("letter", letter)
    setSearchParams(next)
  }

  function updateSearch(value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set("q", value)
    else next.delete("q")
    setSearchParams(next)
  }

  function clearFilters() {
    setSearchParams({})
  }

  return (
    <div className="detail-page detail-page-wide">
      <header className="detail-header detail-header-centered">
        <TitlePostit seedKey="page-artists">Artists</TitlePostit>
        <div className="detail-header-status-row">
          <StatusPostit seedKey="page-artists-summary" align="flex-start">
            {isFiltered ? (
              <>
                There are currently <NumberPostit value={visibleArtists.length} seedKey="page-artists-summary-count" /> of{" "}
                <NumberPostit value={artists.length} seedKey="page-artists-summary-total" /> artists shown in the archive
              </>
            ) : (
              <>
                There are currently <NumberPostit value={artists.length} seedKey="page-artists-summary-count" /> artists
                in the archive
              </>
            )}
          </StatusPostit>
          {!isFiltered && (
            <StatusPostit seedKey="page-artists-placeholder" align="flex-start">
              [Select a letter or search to browse artists]
            </StatusPostit>
          )}
        </div>
      </header>

      <div className="detail-stack">
        <section className="detail-panel detail-section filter-panel-compact">
          <div className="filter-toolbar">
            <div className="filter-grid">
              <label className="filter-field filter-field-search">
                <input
                  type="search"
                  aria-label="Search artists and groups"
                  className="filter-input"
                  placeholder="Search for an artist or group..."
                  value={searchQuery}
                  onChange={(event) => updateSearch(event.target.value)}
                />
              </label>
            </div>

            {isFiltered && (
              <button type="button" className="ui-pill ui-pill-compact" onClick={clearFilters}>
                <span>Clear filters</span>
              </button>
            )}
          </div>

          <nav className="jump-nav" aria-label="Jump to artist letter">
            {browseLetterRows.map((row, rowIndex) => (
              <div key={rowIndex} className={`jump-nav-row ${rowIndex === 0 ? "jump-nav-row-short" : "jump-nav-row-long"}`}>
                {row.map((letter) =>
                  availableLetters.includes(letter) ? (
                    <button
                      key={letter}
                      type="button"
                      className={`jump-link ${selectedLetter === letter ? "jump-link-active" : ""}`}
                      onClick={() => toggleLetter(letter)}
                    >
                      {letter}
                    </button>
                  ) : (
                    <span key={letter} className="jump-link jump-link-disabled">
                      {letter}
                    </span>
                  )
                )}
              </div>
            ))}
          </nav>
        </section>

        {isFiltered && (
          <section className="detail-results">
            {visibleLetters.length > 0 ? (
              <div className="record-rows">
                {visibleLetters.map((letter) => (
                  <section key={letter} id={`artists-letter-${letter}`} className="record-row-group">
                    <StatusPostit seedKey={`artists-letter-heading-${letter}`} align="center">
                      Artists that begin with &apos;
                      <NumberPostit value={letter} seedKey={`artists-letter-heading-${letter}`} />
                      &apos;
                    </StatusPostit>
                    <div className="browse-row-list">
                      {groupedResults.get(letter)!.map((artist) => {
                        const count = songCountById[artist.id] ?? 0
                        return (
                          <BrowseRow key={artist.id} to={`/artists/${artist.slug}`} seedKey={artist.id}>
                            <div className="browse-row-title-line">
                              <span className="archive-link-title not-italic">{artist.name}</span>
                              {count > 0 && (
                                <span className="archive-song-artist browse-row-suffix">
                                  {count} {count === 1 ? "song" : "songs"}
                                </span>
                              )}
                            </div>
                            {artist.genreTags?.length ? (
                              <div className="archive-meta">
                                <span>{artist.genreTags.slice(0, 3).map(formatGenreTag).join(", ")}</span>
                              </div>
                            ) : null}
                          </BrowseRow>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="detail-results-empty">
                <StatusPostit seedKey="page-artists-no-results" align="center">
                  [No artists match these filters]
                </StatusPostit>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
