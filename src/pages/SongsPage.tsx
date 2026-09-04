import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { loadSongs, loadArtists } from "../lib/parseContent"
import { getAllGenreFamilies, getGenreFamily } from "../lib/genres"
import { getSongArtistCredit } from "../lib/songArtists"
import PaperSelect from "../components/PaperSelect"
import TitlePostit from "../components/TitlePostit"
import StatusPostit from "../components/StatusPostit"
import NumberPostit from "../components/NumberPostit"
import BrowseRow from "../components/BrowseRow"
import type { Song, Artist } from "../types"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
const browseLetters = ["#", ...alphabet]
const browseLetterRows = [browseLetters.slice(0, 13), browseLetters.slice(13)]

function getArtistSortName(name: string): string {
  return name.replace(/^the\s+/i, "").trim()
}

function getDecadeSlug(year: number): string {
  return `${Math.floor(year / 10) * 10}s`
}

function getDecadeLabel(decade: string): string {
  return `${decade.slice(0, 4)}'s`
}

function getSongLetter(title: string): string {
  const firstCharacter = title.trim().charAt(0).toUpperCase()
  return /^[A-Z]$/.test(firstCharacter) ? firstCharacter : "#"
}

function getSongSortCategory(title: string): number {
  const firstCharacter = title.trim().charAt(0)
  if (/\d/.test(firstCharacter)) return 0
  if (firstCharacter === ".") return 1
  if (firstCharacter === '"') return 2
  if (/[A-Za-z]/.test(firstCharacter)) return 3
  return 4
}

function compareSongs(a: Song, b: Song): number {
  const categoryDifference = getSongSortCategory(a.title) - getSongSortCategory(b.title)
  if (categoryDifference !== 0) return categoryDifference
  return a.title.localeCompare(b.title)
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [artists, setArtists] = useState<Record<string, Artist>>({})
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    Promise.all([loadSongs(), loadArtists()]).then(([songList, artistList]) => {
      const artistMap: Record<string, Artist> = {}
      artistList.forEach((a) => { artistMap[a.id] = a })
      setArtists(artistMap)
      setSongs([...songList].filter((s) => s.status === "published").sort(compareSongs))
    })
  }, [])

  const selectedArtistQuery = searchParams.get("artist") ?? ""
  const selectedGenre = searchParams.get("genre") ?? ""
  const selectedDecade = searchParams.get("decade") ?? ""
  const selectedLetter = searchParams.get("letter") ?? ""

  const primaryArtists = Object.values(artists)
    .filter((artist) => songs.some((song) => song.artistIds.includes(artist.id)))
    .sort((a, b) => getArtistSortName(a.name).localeCompare(getArtistSortName(b.name)))

  const artistsWithMultipleSongs = primaryArtists
    .map((artist) => ({
      artist,
      count: songs.filter((song) => song.artistIds.includes(artist.id)).length,
    }))
    .filter(({ count }) => count >= 2)
    .sort((a, b) => b.count - a.count || getArtistSortName(a.artist.name).localeCompare(getArtistSortName(b.artist.name)))

  const genreOptions = getAllGenreFamilies()

  const decadeOptions = Array.from(new Set(songs.map((song) => getDecadeSlug(song.year))))
    .sort((a, b) => a.localeCompare(b))

  const filteredSongsBase = songs.filter((song) => {
    const normalizedArtistQuery = selectedArtistQuery.trim().toLowerCase()
    const matchesArtist = !normalizedArtistQuery || song.artistIds.some((artistId) => {
      const artist = artists[artistId]
      if (!artist) return false
      return artist.slug === normalizedArtistQuery || artist.name.toLowerCase().includes(normalizedArtistQuery)
    })
    const matchesGenre = !selectedGenre || (song.genreTags ?? []).some((genre) =>
      genre === selectedGenre || getGenreFamily(genre).slug === selectedGenre
    )
    const matchesDecade = !selectedDecade || getDecadeSlug(song.year) === selectedDecade
    return matchesArtist && matchesGenre && matchesDecade
  })

  const filteredSongs = filteredSongsBase.filter((song) => !selectedLetter || getSongLetter(song.title) === selectedLetter)

  const groupedSongs = filteredSongs.reduce<Record<string, Song[]>>((groups, song) => {
    const letter = getSongLetter(song.title)
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(song)
    return groups
  }, {})

  Object.values(groupedSongs).forEach((group) => group.sort(compareSongs))

  const availableLetters = browseLetters.filter((letter) =>
    filteredSongsBase.some((song) => getSongLetter(song.title) === letter)
  )
  const visibleLetters = browseLetters.filter((letter) => groupedSongs[letter]?.length)

  function updateFilter(key: "artist" | "genre" | "decade" | "letter", value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  function toggleLetter(letter: string) {
    updateFilter("letter", selectedLetter === letter ? "" : letter)
  }

  function clearFilters() {
    setSearchParams({})
  }

  const isFiltered = Boolean(selectedArtistQuery || selectedGenre || selectedDecade || selectedLetter)

  return (
    <div className="detail-page detail-page-wide">
      <header className="detail-header detail-header-centered">
        <TitlePostit seedKey="page-songs">Songs</TitlePostit>
        <div className="detail-header-status-row">
          <StatusPostit seedKey="page-songs-summary" align="flex-start">
            {isFiltered ? (
              <>
                There are currently <NumberPostit value={filteredSongs.length} seedKey="page-songs-summary-count" /> of{" "}
                <NumberPostit value={songs.length} seedKey="page-songs-summary-total" /> songs shown in the archive
              </>
            ) : (
              <>
                There are currently <NumberPostit value={songs.length} seedKey="page-songs-summary-count" /> songs in
                the archive
              </>
            )}
          </StatusPostit>
          {!isFiltered && (
            <StatusPostit seedKey="page-songs-placeholder" align="flex-start">
              [Select a letter or filter to browse songs]
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
                  aria-label="Search primary artist"
                  className="filter-input"
                  placeholder="Search for artist..."
                  value={selectedArtistQuery}
                  onChange={(event) => updateFilter("artist", event.target.value)}
                />
              </label>

              <div className="filter-field filter-field-genre">
                <PaperSelect
                  ariaLabel="Filter songs by genre"
                  placeholder="All genres"
                  value={selectedGenre}
                  onValueChange={(value) => updateFilter("genre", value)}
                  options={genreOptions.map((genre) => ({ value: genre.slug, label: genre.label }))}
                />
              </div>

              <div className="filter-field filter-field-year">
                <PaperSelect
                  ariaLabel="Filter songs by year"
                  placeholder="All years"
                  value={selectedDecade}
                  onValueChange={(value) => updateFilter("decade", value)}
                  options={decadeOptions.map((decade) => ({ value: decade, label: getDecadeLabel(decade) }))}
                />
              </div>

              {artistsWithMultipleSongs.length > 0 && (
                <div className="filter-field filter-field-multi-artist">
                  <PaperSelect
                    ariaLabel="Filter songs by artists with two or more songs"
                    placeholder="Artist with multiple songs..."
                    value={artistsWithMultipleSongs.some(({ artist }) => artist.name === selectedArtistQuery) ? selectedArtistQuery : ""}
                    onValueChange={(value) => updateFilter("artist", value)}
                    options={artistsWithMultipleSongs.map(({ artist, count }) => ({
                      value: artist.name,
                      label: `${artist.name} (${count})`,
                    }))}
                  />
                </div>
              )}
            </div>

            {isFiltered && (
              <button type="button" className="ui-pill ui-pill-compact" onClick={clearFilters}>
                <span>Clear filters</span>
              </button>
            )}
          </div>

          <nav className="jump-nav" aria-label="Jump to song letter">
            {browseLetterRows.map((row, rowIndex) => (
              <div key={rowIndex} className={`jump-nav-row ${rowIndex === 0 ? "jump-nav-row-short" : "jump-nav-row-long"}`}>
                {row.map((letter) => (
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
                ))}
              </div>
            ))}
          </nav>
        </section>

        {isFiltered && (
          <section className="detail-results">
            {visibleLetters.length > 0 ? (
              <div className="record-rows">
                {visibleLetters.map((letter) => (
                  <section key={letter} id={`songs-letter-${letter}`} className="record-row-group">
                    <StatusPostit seedKey={`songs-letter-heading-${letter}`} align="center">
                      Songs that begin with &apos;
                      <NumberPostit value={letter} seedKey={`songs-letter-heading-${letter}`} />
                      &apos;
                    </StatusPostit>
                    <div className="browse-row-list">
                      {groupedSongs[letter].map((song) => {
                        return (
                          <BrowseRow key={song.id} to={`/songs/${song.slug}`} seedKey={song.id}>
                            <div className="browse-row-title-line">
                              <span className="archive-link-title">&apos;{song.title}&apos;</span>
                              <span className="archive-song-artist browse-row-suffix">
                                by {getSongArtistCredit(song, artists)}
                              </span>
                            </div>
                            <div className="archive-meta">
                              <span>{song.album ?? "[No album added]"} ({song.year})</span>
                            </div>
                          </BrowseRow>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="detail-results-empty">
                <StatusPostit seedKey="page-songs-no-results" align="center">
                  [No songs match these filters]
                </StatusPostit>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
