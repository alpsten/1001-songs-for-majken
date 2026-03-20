# AGENT.md

## Project
1001 Songs for Daughter

An interactive, explorable music memory archive built as a static website.
The project should not feel like a flat playlist.
It should feel like a world you move through, where songs, artists, eras, themes, and personal memories connect to each other.

The long term goal is to create a meaningful digital gift that can be explored years from now.
The short term goal is to make adding new content simple, structured, and sustainable.

---

## Core product idea

This project combines three layers:

1. Music knowledge
   Songs, artists, albums, genres, years, influences, and relationships.

2. Graph relationships
   Songs connect to artists, artists connect to other artists, songs connect to songs, and memories connect to themes or life moments.

3. Personal meaning
   Each song can include a story, memory, reason for inclusion, or context from life.

This personal layer is what makes the project special.
Without it, the project becomes a catalog.
With it, the project becomes a time capsule.

---

## Product principles

### 1. Explore, do not just list
Navigation should encourage discovery.
A visitor should be able to move from:
- song to artist
- artist to related artist
- song to song
- song to memory
- theme to song
- era to artist

### 2. Add content with low friction
Adding one song should be quick.
The system should not require editing many files by hand.

### 3. Keep the source of truth simple
Prefer structured content files over a database in V1.
The project should work well on GitHub Pages.

### 4. Personal stories matter most
A smaller number of meaningful entries is better than a large empty catalog.

### 5. Build static first
Prefer static generation and file based content for simplicity, portability, version control, and free hosting.

---

## Recommended stack

### Frontend
- React
- TypeScript
- Vite

### Styling
- CSS Modules or plain CSS
- Keep styling simple and readable
- Avoid a heavy UI framework in V1 unless clearly needed

### Hosting
- GitHub Pages

### Data source
- Markdown files with frontmatter
- Generated JSON for the app to consume

### Optional later
- React Flow or D3 for graph visualisation
- MiniSearch or Lunr for static search
- Spotify or YouTube embeds where appropriate

---

## Why static first is the correct approach

A backend is not needed in V1 because:
- content changes infrequently
- the project is mostly read focused
- deployment should stay simple
- Git history is valuable
- GitHub Pages can host a static build for free

Use a backend only if one of these becomes necessary later:
- authentication
- private admin panel
- user submitted content
- analytics heavy features
- dynamic recommendations
- cloud persistence outside the repo

---

## Suggested folder structure

```text
1001-songs-for-daughter/
  public/
    images/
    covers/
  src/
    components/
    pages/
    features/
      songs/
      artists/
      graph/
      daily-song/
      timeline/
    data/
      generated/
    lib/
    styles/
    types/
  content/
    songs/
    artists/
    albums/
    themes/
    memories/
  scripts/
    validate-content.ts
    generate-derived-data.ts
  docs/
    AGENT.md
    FOLLOWUP.md
  package.json
  tsconfig.json
  vite.config.ts
```

---

## Content strategy

There are two good approaches.

### Option A: JSON only
Simple and direct.
Best if you want a developer first workflow.

### Option B: Markdown with frontmatter
Better if you want richer writing and easier long form editing.
Best if each song page includes a real story.

### Recommended approach
- Store metadata in frontmatter
- Store the story in the Markdown body
- Generate derived JSON during build time

This gives:
- a good writing experience
- structured metadata
- static friendly output

---

## Core domain entities

The project should be modeled around explicit entities.

### Main entities
- Song
- Artist
- Album
- Theme
- Memory

### Optional later
- Era
- Genre
- Playlist
- Relationship
- Milestone
- Location

---

## Entity definitions

### Song
Represents one track in the archive.

Required fields:
- id
- slug
- title
- artistIds
- year
- whyItMatters
- addedAt
- status

Suggested fields:
- albumId
- genreTags
- moodTags
- themeIds
- memoryIds
- relatedSongIds
- relatedArtistIds
- sourceLinks
- dailySongEligible
- sortOrder

Example shape:

```ts
type Song = {
  id: string
  slug: string
  title: string
  artistIds: string[]
  albumId?: string
  year: number
  whyItMatters: string
  story: string
  genreTags?: string[]
  moodTags?: string[]
  themeIds?: string[]
  memoryIds?: string[]
  relatedSongIds?: string[]
  relatedArtistIds?: string[]
  sourceLinks?: ExternalLink[]
  dailySongEligible?: boolean
  addedAt: string
  sortOrder?: number
  status: "draft" | "published"
}
```

### Artist
Represents a musician, band, or project.

Required fields:
- id
- slug
- name

Suggested fields:
- birthYear
- formedYear
- country
- genreTags
- summary
- notableSongIds
- relatedArtistIds

Example shape:

```ts
type Artist = {
  id: string
  slug: string
  name: string
  birthYear?: number
  formedYear?: number
  country?: string
  genreTags?: string[]
  summary?: string
  notableSongIds?: string[]
  relatedArtistIds?: string[]
}
```

### Album

```ts
type Album = {
  id: string
  slug: string
  title: string
  artistIds: string[]
  year?: number
  songIds?: string[]
  summary?: string
}
```

### Theme

```ts
type Theme = {
  id: string
  slug: string
  name: string
  description?: string
  relatedThemeIds?: string[]
}
```

### Memory

```ts
type Memory = {
  id: string
  slug: string
  title: string
  dateApprox?: string
  summary: string
  body: string
  relatedSongIds?: string[]
  relatedArtistIds?: string[]
  tags?: string[]
}
```

---

## Recommended content file format

### Song file example
`content/songs/what-a-wonderful-world.md`

```md
---
id: song-what-a-wonderful-world
slug: what-a-wonderful-world
title: What a Wonderful World
artistIds:
  - artist-louis-armstrong
year: 1967
themeIds:
  - theme-wonder
  - theme-warmth
memoryIds:
  - memory-sunday-mornings
relatedSongIds:
  - song-la-vie-en-rose
whyItMatters: A song about seeing beauty in ordinary life.
dailySongEligible: true
addedAt: 2026-03-19
status: published
---

This is where the long story goes.

Maybe this was playing on a quiet morning.
Maybe it became linked to a specific period in life.
Maybe this is a song she should know because of the feeling it teaches, not just because it is famous.
```

### Artist file example
`content/artists/louis-armstrong.md`

```md
---
id: artist-louis-armstrong
slug: louis-armstrong
name: Louis Armstrong
birthYear: 1901
country: United States
genreTags:
  - jazz
  - traditional-pop
relatedArtistIds:
  - artist-ella-fitzgerald
summary: One of the most influential musicians in 20th century music.
---
```

---

## Relationship model

Relationships are what make this feel like a world.

At minimum support these:

### Direct relationships
- Song -> Artist
- Song -> Album
- Song -> Theme
- Song -> Memory
- Song -> Song
- Artist -> Artist
- Artist -> Song
- Theme -> Song
- Memory -> Song

### Practical rule
Do not try to model every relationship type at once.
Start with a few high value links and expand only when needed.

Best V1 relationships:
- song to artist
- song to related songs
- song to themes
- song to memories
- artist to related artists

That is enough to create meaningful exploration paths.

---

## Derived data

Raw content should stay human friendly.
Derived data can be generated automatically.

Examples of derived data:
- all published songs
- songs grouped by year
- artists with reverse linked songs
- graph nodes and edges
- daily song rotation pool
- theme index
- search index

Store generated outputs in:

```text
src/data/generated/
```

Example generated files:
- songs.json
- artists.json
- themes.json
- graph.json
- search-index.json
- daily-song-pool.json

---

## Graph model

The graph view is a core experience, not just decoration.

Use a normalized graph format:

```ts
type GraphNode = {
  id: string
  type: "song" | "artist" | "album" | "theme" | "memory"
  label: string
  slug: string
}

type GraphEdge = {
  id: string
  source: string
  target: string
  relation:
    | "performed-by"
    | "appears-on"
    | "related-song"
    | "related-artist"
    | "has-theme"
    | "has-memory"
}
```

### V1 graph rule
Do not show every node in existence immediately.
Large graphs become unreadable fast.

Instead:
- open a focused graph from a page context
- show the current item and nearby connected nodes
- allow expansion outward

Example:
On a song page, show:
- the song
- the artist
- related songs
- themes
- linked memories

This is much more useful than one giant catalog graph.

---

## Daily song feature

This should be a first class feature.

### Goal
Each day, one song is highlighted on the homepage.

### Static friendly approach
Choose the song deterministically based on date.

Pseudo logic:

```text
1. Load all published songs
2. Filter by dailySongEligible if enough exist
3. Sort them in a stable order
4. Convert today's date into a day number from a fixed origin
5. dayIndex = dayNumber % songCount
6. dailySong = songs[dayIndex]
```

### Why this is good
- no backend needed
- same result for everyone on the same day
- predictable
- easy to test

---

## Routing recommendations

Suggested routes:

```text
/
  homepage with introduction, daily song, featured paths

/songs
  browse all songs

/songs/:slug
  song detail page

/artists
  browse all artists

/artists/:slug
  artist detail page

/themes
  browse themes

/themes/:slug
  theme detail page

/memories/:slug
  memory detail page

/explore
  graph or discovery page
```

---

## Homepage recommendations

The homepage should communicate that this is a gift and a world.

Suggested sections:
- project introduction
- daily song
- explore by artist
- explore by theme
- recently added songs
- random memory
- graph entry point

Avoid a homepage that looks like a spreadsheet.

---

## Song page recommendations

Each song page should include:

### Core content
- title
- artist
- year
- album if available
- why it matters
- story

### Connection blocks
- related songs
- linked themes
- linked memories
- related artists

This page is the emotional center of the project.

---

## Artist page recommendations

Each artist page should include:
- short summary
- notable songs in the archive
- related artists
- themes frequently associated with their songs
- timeline context if useful

The artist page should be a hub, not just a bio.

---

## Validation rules

The content system should fail fast on bad data.

Create a validation script that checks:
- ids are unique
- slugs are unique
- all referenced ids exist
- published songs have required fields
- related links do not point to missing content
- year values are sane
- no duplicate relationships inside the same entry

Example script targets:
- `npm run validate`
- `npm run generate`

---

## Pseudocode for content pipeline

```text
1. Read all content files from the content folders
2. Parse frontmatter and body
3. Convert raw files into typed domain entities
4. Validate required fields and references
5. Build reverse lookup maps
6. Generate derived indexes and graph data
7. Write generated JSON files into src/data/generated
8. Build the frontend using the generated data
```

---

## Recommended TypeScript types

```ts
type EntityId = string

type ExternalLink = {
  label: string
  url: string
  kind?: "spotify" | "youtube" | "wikipedia" | "other"
}
```

Keep ids explicit and readable, for example:
- song-bohemian-rhapsody
- artist-queen
- theme-joy
- memory-road-trip-2028

This is better than random UUIDs for a static content project.

---

## Admin workflow

The repo should support a simple content creation workflow.

### Manual workflow in V1
1. Create or edit a song Markdown file
2. Link the song to artists, themes, and memories
3. Run validation
4. Run generation
5. Preview locally
6. Commit and push
7. Deploy to GitHub Pages

This is enough for a hobby project.

### Optional later
Build a small internal content form or admin UI only if manual editing becomes painful.

Do not build admin tools too early.

---

## Search strategy

Search is useful, but it is not the first priority.

### V1
Basic client side search over:
- song title
- artist name
- theme name
- keywords
- story excerpts

### Recommended approach
Generate a static search index during build.

This avoids backend complexity.

---

## Visual design direction

The site should feel:
- warm
- personal
- readable
- timeless

Avoid making it feel like:
- a dashboard
- a developer tool
- a raw database browser

The UI should support quiet discovery.

---

## Versioning philosophy

This project is intended to grow for years.
That means the content model should be stable and easy to evolve.

Guidelines:
- prefer additive changes
- avoid breaking old content files
- keep migrations simple
- document schema updates

---

## Non goals for V1

Do not build these first:
- user accounts
- comments
- complex recommendation engine
- animation heavy graph
- full streaming integration
- public contribution system
- large CMS
- database backend
- mobile app

---

## V1 milestone

A good V1 is:

- static website deployed on GitHub Pages
- homepage with intro and daily song
- songs index
- song detail pages with stories
- artist pages
- themes
- simple local graph around each song
- content stored in files
- validation and generation scripts
- easy process for adding songs

If that works, the project already succeeds.

---

## Build order

```text
1. Set up React + TypeScript + Vite
2. Define content schema and TypeScript types
3. Create content folders and sample entries
4. Build parser and validation script
5. Generate derived JSON
6. Build homepage
7. Build song pages
8. Build artist pages
9. Build theme pages
10. Add daily song feature
11. Add local graph exploration
12. Deploy to GitHub Pages
```

---

## Final guidance for coding agents

When implementing this project:
- preserve clarity over cleverness
- prefer explicit types and naming
- keep the data model stable
- do not introduce a backend unless clearly justified
- do not optimize early for scale that does not exist yet
- treat stories and memories as first class content
- keep adding a new song simple and fast
- protect the feeling of exploration

The project is successful if it becomes easy to keep alive for years.
