import { useEffect, useState, useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { loadArtists, loadSongs } from "../lib/parseContent"
import { formatGenreTag } from "../lib/genres"
import { getCardNote } from "../lib/cardNote"
import CardNoteMark from "../components/CardNoteMark"
import TitlePostit from "../components/TitlePostit"
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

  const groupedByLetter = useMemo(() => {
    const map = new Map<string, Artist[]>()
    for (const artist of artists) {
      const letter = getArtistLetter(artist.name)
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter)!.push(artist)
    }
    return map
  }, [artists])

  const availableLetters = browseLetters.filter((letter) => groupedByLetter.has(letter))
  const activeGroup = selectedLetter ? groupedByLetter.get(selectedLetter) ?? [] : []

  function toggleLetter(letter: string) {
    const next = new URLSearchParams(searchParams)
    if (selectedLetter === letter) next.delete("letter")
    else next.set("letter", letter)
    setSearchParams(next)
  }

  return (
    <div className="detail-page">
      <header className="detail-header">
        <TitlePostit seedKey="page-artists">Artists</TitlePostit>
      </header>

      <div className="detail-stack">
        <section className="detail-panel detail-section">
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

        <section className="detail-panel">
          {selectedLetter && activeGroup.length > 0 ? (
            <div className="record-rows">
              <section className="record-row-group">
                <h2 className="record-row-letter">{selectedLetter}</h2>
                <div className="record-row-scroller">
                  {activeGroup.map((artist) => {
                    const count = songCountById[artist.id] ?? 0
                    const note = getCardNote(artist.id)
                    return (
                      <Link key={artist.id} to={`/artists/${artist.slug}`} className="record-card">
                        {note && <CardNoteMark note={note} />}
                        <span className="artist-tree-pill">{artist.name}</span>
                        {count > 0 && (
                          <p className="artist-tree-count">
                            {count} {count === 1 ? "song" : "songs"}
                          </p>
                        )}
                        {artist.genreTags?.length ? (
                          <div className="artist-tree-genre-pills">
                            {artist.genreTags.slice(0, 2).map((tag) => (
                              <span key={tag} className="artist-tree-tag">
                                {formatGenreTag(tag)}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {artist.summary && <p className="artist-tree-summary">{artist.summary}</p>}
                      </Link>
                    )
                  })}
                </div>
              </section>
            </div>
          ) : (
            <p className="detail-placeholder">[Select a letter to browse artists]</p>
          )}
        </section>
      </div>
    </div>
  )
}
