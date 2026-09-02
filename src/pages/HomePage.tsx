import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { loadSongs, loadArtists } from "../lib/parseContent"
import { getDailySong } from "../lib/getDailySong"
import { getSongArtistCredit } from "../lib/songArtists"
import type { Song, Artist } from "../types"

export default function HomePage() {
  const [dailySong, setDailySong] = useState<Song | null>(null)
  const [artistsById, setArtistsById] = useState<Record<string, Artist>>({})

  useEffect(() => {
    Promise.all([loadSongs(), loadArtists()]).then(([songs, arts]) => {
      setDailySong(getDailySong(songs))
      setArtistsById(
        arts.reduce<Record<string, Artist>>((acc, artist) => {
          acc[artist.id] = artist
          return acc
        }, {})
      )
    })
  }, [])

  const dailySongArtists = dailySong ? getSongArtistCredit(dailySong, artistsById) : ""

  return (
    <div>
      {/* Hero */}
      <section
        className="flex items-center justify-center"
        style={{ minHeight: "min(100vh, 52rem)", padding: "7rem 2rem 4rem" }}
      >
        <div className="flex flex-col items-center gap-10 w-full" style={{ maxWidth: 860 }}>
          <div className="hero-postit">
            <span className="tape-piece tape-tl" />
            <span className="tape-piece tape-tr" />
            <span className="tape-piece tape-bl" />
            <span className="tape-piece tape-br" />
            <h1 className="text-center leading-none">
              <span
                className="block"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: "clamp(4.5rem, 15vw, 7.5rem)",
                  color: "var(--color-postit-ink)",
                }}
              >
                1001
              </span>
              <span
                className="mt-3 block"
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--color-postit-ink)",
                  opacity: 0.7,
                }}
              >
                Songs for Majken
              </span>
            </h1>
          </div>

          {dailySong && (
            <div className="mx-auto w-fit max-w-full">
              <Link
                to={`/songs/${dailySong.slug}`}
                className="ui-card-link sotd-card block max-w-full"
              >
                <div className="sotd-card-body">
                  <div className="sotd-kicker">Song of the day</div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: "1.6rem",
                      lineHeight: 1.25,
                    }}
                  >
                    &apos;{dailySong.title}&apos;{dailySongArtists ? ` — ${dailySongArtists}` : ""}
                  </p>
                  <p className="archive-meta mt-3">
                    {dailySong.album ? `${dailySong.album} (${dailySong.year})` : `(${dailySong.year})`}
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
