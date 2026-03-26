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
        <div className="flex flex-col items-center gap-8 w-full" style={{ maxWidth: 860 }}>
          <h1
            className="text-white font-normal text-center tracking-wide leading-none"
            style={{ textShadow: "0 2px 40px rgba(0,0,0,0.25)" }}
          >
            <span className="block text-7xl sm:text-8xl lg:text-7xl">1001</span>
            <span className="mt-3 hidden text-5xl tracking-[0.18em] uppercase lg:block">Songs for Majken</span>
            <span className="mt-3 block text-5xl tracking-[0.18em] uppercase sm:text-5xl lg:hidden">Songs</span>
            <span className="mt-3 block text-5xl tracking-[0.18em] uppercase sm:text-5xl lg:hidden">For</span>
            <span className="mt-3 block text-5xl tracking-[0.18em] uppercase sm:text-5xl lg:hidden">Majken</span>
          </h1>

          {dailySong && (
            <div className="mx-auto w-fit max-w-full">
              <Link
                to={`/songs/${dailySong.slug}`}
                className="ui-surface ui-card-link sotd-card block max-w-full"
              >
                <div className="sotd-card-body text-center">
                  <div className="sotd-kicker">Song of the day</div>
                  <p className="font-sans text-[17px] font-semibold text-white">
                    &apos;{dailySong.title}&apos;{dailySongArtists ? ` by ${dailySongArtists}` : ""}
                  </p>
                  <p className="archive-meta archive-meta-center mt-0">
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
