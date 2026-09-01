# 1001 Songs for Majken

`1001 Songs for Majken` is a personal music archive I am building for my daughter.
It is meant to become a long-term digital mixtape: a place for songs, artists, albums, moods, decades, and, over time, the personal stories behind why they matter.

The goal is not to build a streaming app.
The goal is to build a world of music that can be explored and slowly filled with memory.

## Current Structure

The app currently has three main sections:

- `Songs`
- `Artists`
- `Explore`

`Explore` currently includes:

- mood
- genre
- year/decade
- family entries

The project is still in a structure-first phase.
That means the browsing logic, content model, and archive flow are being built before all the personal writing has been added.

## Placeholder Rule

Until real memories and personal notes are written, the project uses:

`[No memory added]`

This is intentional.
It avoids generic filler text and makes it clear which parts of the archive are still waiting for personal writing.

## Content Workflow

The archive is file-based.

Source content lives in Markdown under `content/`, and the app consumes generated files from `public/data/`.

Current content areas include:

- `content/songs`
- `content/artists`
- `content/themes`
- `content/memories`

Generated outputs include:

- `public/data/songs.json`
- `public/data/artists.json`
- `public/data/themes.json`
- `public/data/memories.json`
- `public/data/song-catalog.csv`

The CSV exists both as a practical catalog export and as a way to track the archive:

- how many songs have been added
- repeated artists
- duplicates
- album, year, and genre coverage

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Validate the content:

```bash
npm run validate
```

Regenerate derived data:

```bash
npm run generate
```

Build the project:

```bash
npm run build
```

`npm run build` also runs validation and derived-data generation before the final client build.

## Spotify Sync

A scheduled GitHub Action (`.github/workflows/spotify-sync.yml`) keeps the archive in step with the actual Spotify playlist, so adding or removing a track there eventually shows up here with the correct title/artist/album/year — without hand-typing it.

Every 6 hours (and on manual dispatch) it:

- fetches the current playlist tracks from the Spotify Web API
- creates a new `content/songs/*.md` stub (and any missing `content/artists/*.md` stub) for tracks that aren't in the archive yet, tagged with `spotifyId` and a `[No memory added]` placeholder
- links existing hand-written songs to their Spotify track by matching on title, backfilling `spotifyId` so future syncs recognize them directly
- marks a song `status: archived` (never deletes it) when its track disappears from the playlist, and flips it back to `published` if it reappears
- opens a pull request with the changes instead of committing straight to `master`, so new entries can be reviewed, tagged, or given a memory before they go live

To enable it, create a [Spotify Developer app](https://developer.spotify.com/dashboard) and add these repository secrets (Settings → Secrets and variables → Actions):

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_PLAYLIST_ID` — the playlist's id from its Spotify URL/URI

To run it locally:

```bash
export SPOTIFY_CLIENT_ID=...
export SPOTIFY_CLIENT_SECRET=...
export SPOTIFY_PLAYLIST_ID=...
npm run sync:spotify
```

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shared global CSS for custom styling

The styling is currently a hybrid approach:
Tailwind utilities are used where they help, while the main visual language is still driven by shared classes in `src/styles/global.css`.

## Project Direction

Near term:

- keep the archive structure coherent
- keep content entry simple
- improve browsing without overcomplicating the app
- continue adding songs, artists, and metadata

Later:

- replace placeholders with real memories
- deepen album and category logic
- refine Explore further
- possibly expand family entries into a more meaningful layer

## Notes

This project is meant to feel personal, durable, and explorable.
It is not finished, and it is not supposed to be finished quickly.
The archive should grow over time, song by song.
