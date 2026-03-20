# FOLLOWUP.md

## Purpose

This document defines:
- V1 scope
- Open design decisions
- Implementation steps
- Validation rules
- Deployment notes

It is meant to guide execution after AGENT.md.

---

## V1 Scope (strict)

Build only what is needed to prove the idea.

### Must have
- Static site (React + TypeScript + Vite)
- Content stored in Markdown files
- Songs index page
- Song detail page (with story)
- Artist page
- Theme page (basic)
- Daily song feature
- Basic relationships:
  - song → artist
  - song → related songs
  - song → themes
- Content validation script
- Derived JSON generation
- Deployment on GitHub Pages

### Nice to have (only if time)
- Simple local graph on song page
- Recently added songs
- Basic search

### Not in V1
- Backend
- Auth
- CMS
- Complex graph visualisation
- Mobile app

---

## Key design decisions (need answers)

Answer these early to avoid rework.

### 1. Content format
Do you want:
A. Markdown + frontmatter (recommended)
B. Pure JSON

Decision:
[ ]

---

### 2. Writing style
Should stories be:
A. Short (2–5 sentences)
B. Medium (1–3 paragraphs)
C. Long form (essay style)

Decision:
[ ]

---

### 3. Daily song pool
Should daily song include:
A. All songs
B. Only songs marked as `dailySongEligible`

Decision:
[ ]

---

### 4. Graph priority
For V1:
A. Skip graph entirely
B. Minimal graph (only related items on page)
C. Full graph view page

Decision:
[ ]

---

### 5. Song addition workflow
How strict should validation be?

A. Strict (fail on any missing reference)
B. Lenient (warn but allow build)

Decision:
[ ]

---

### 6. Slug strategy
Should slugs be:
A. Manual (you define)
B. Auto-generated from title

Decision:
[ ]

---

## Initial seed content

Create at least:

- 5 songs
- 3 artists
- 3 themes
- 1 memory

Goal:
Test relationships early before scaling.

---

## Implementation steps

### Step 1: Project setup

- Create Vite + React + TypeScript project
- Set up folder structure from AGENT.md

---

### Step 2: Define types

Create:
- Song.ts
- Artist.ts
- Theme.ts
- Memory.ts

Keep types simple and explicit.

---

### Step 3: Content parser

Goal:
Convert Markdown files → typed objects

Pseudocode:

1. Read all files in content folders
2. Parse frontmatter
3. Extract body
4. Map into typed objects

---

### Step 4: Validation script

Checks:
- unique ids
- unique slugs
- valid references
- required fields present

Command:
npm run validate

---

### Step 5: Derived data generation

Generate:
- songs.json
- artists.json
- themes.json

Later:
- graph.json
- search index

Command:
npm run generate

---

### Step 6: Basic pages

Implement:

1. Homepage
2. Songs list
3. Song detail page
4. Artist page
5. Theme page

---

### Step 7: Daily song

Implement deterministic logic:

- fixed start date
- modulo selection

Make it reusable:
getDailySong(songs, today)

---

### Step 8: Relationships UI

On song page show:
- artist links
- related songs
- themes

Keep it simple:
lists, not graphs

---

### Step 9: Deployment

Use GitHub Pages:

Options:
- gh-pages package
- or GitHub Actions

Ensure:
- base path is correct
- assets load correctly

---

## Validation rules (detailed)

Each song must have:
- id
- slug
- title
- artistIds
- year
- whyItMatters
- status

Each reference must:
- point to an existing id
- not be self-referencing incorrectly

No duplicates in:
- relatedSongIds
- artistIds

---

## Risks

### 1. Over-engineering
Mitigation:
Stick to V1 scope strictly

### 2. Content friction
Mitigation:
Make adding a song fast

### 3. Graph complexity
Mitigation:
Delay full graph view

---

## Suggested first milestone

Goal:
Working prototype with 3–5 songs

Includes:
- navigation
- story rendering
- daily song
- relationships

If this feels good, continue.

---

## Questions for you

Answer these before coding further:

1. Do you want the tone of the site to feel more:
   - like a journal
   - like a curated museum
   - something in between

2. Do you want to include:
   - only songs you personally connect to
   - or also historically important songs

3. Should memories be:
   - always tied to songs
   - or standalone entries too

4. Do you want a visible timeline early, or later

5. Is this private until finished, or public from the start

---

## Next step after this

Once decisions are filled:

- lock schema
- create 5 real entries
- build parser + validation
- render first pages

Do not start with UI before data pipeline works.
