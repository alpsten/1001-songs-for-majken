import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { loadSongs, loadArtists } from "../lib/parseContent"
import { getSongArtistEntities } from "../lib/songArtists"
import TitlePostit from "../components/TitlePostit"
import type { Song, Artist } from "../types"
// Spike: trying @paper-design/shaders-react's PaperTexture on a real photo.
// Scoped to this one song on purpose — remove once evaluated either way.
import { PaperTexture } from "@paper-design/shaders-react"

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
  // Prefer the song's own track link — a Spotify track page shows the song,
  // its artist, and its album all in one place, which a bare artist link
  // doesn't. Track IDs only exist for songs that were on the synced playlist
  // at some point (306/313), so fall back to the artist's own Spotify page
  // (first primary/featured artist that has one) for the rest.
  const spotifyArtist = [...primary, ...featured].find((a) => a.spotifyId)
  const spotifyUrl = song.spotifyId
    ? `https://open.spotify.com/track/${song.spotifyId}`
    : spotifyArtist
      ? `https://open.spotify.com/artist/${spotifyArtist.spotifyId}`
      : null

  return (
    <div className="detail-page">
      <header className="detail-header">
        <TitlePostit seedKey={song.id}>{song.title}</TitlePostit>
        <div className="detail-meta-row">
          {primary.map((a) => (
            <Link key={a.id} to={`/artists/${a.slug}`} className="tag-postit">
              <span>{a.name}</span>
            </Link>
          ))}
          {featured.map((a) => (
            <Link key={a.id} to={`/artists/${a.slug}`} className="tag-postit">
              <span>feat. {a.name}</span>
            </Link>
          ))}
          <span className="tag-postit">
            <span>{song.year}</span>
          </span>
          {spotifyUrl && (
            <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="tag-postit">
              <span>Spotify</span>
            </a>
          )}
        </div>
        {song.whyItMatters && song.whyItMatters !== noMemoryPlaceholder && (
          <p className="detail-note detail-note-personal">{song.whyItMatters}</p>
        )}
      </header>

      <div className="detail-stack">
        {song.slug === "new-york-state-of-mind" && (
          <PaperTexture
            image={`${import.meta.env.BASE_URL}test/majken-1.jpeg`}
            width={210}
            height={280}
            fit="cover"
            scale={0.95}
            contrast={0.57}
            roughness={0.41}
            folds={0.65}
            drops={0.25}
            fiber={0}
            fiberSize={0.2}
            crumples={0}
            crumpleSize={0.35}
            fade={0}
            style={{ borderRadius: 8 }}
          />
        )}
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
