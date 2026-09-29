# ORGANIZE

A minimalist historical narrative game about Black organizing in the United
States. Twelve stories. **READ A LITTLE → THINK A LITTLE → TAP.**

V1.1 is a static, offline-capable, installable web app (PWA). No backend, no
login, no analytics, no external requests, no build step, no runtime
dependencies.

## Run it

Any static file server works. Service workers need `http://localhost` or HTTPS
(not `file://`).

```sh
npm start                  # node tools/serve.mjs 8080  → http://localhost:8080
# or
python3 -m http.server 8080
```

Open the URL on a phone on the same network (or deploy, below) and play.

## Install on a phone

1. Serve over HTTPS (any static host: GitHub Pages, Netlify, Cloudflare Pages,
   an S3 bucket…). Upload the repository root as-is; all paths are relative, so
   a sub-path like `https://user.github.io/organize/` works.
2. Open it once while online. Every file is cached on first load.
3. **Android / Chrome:** menu → *Install app*. **iOS / Safari:** Share → *Add to
   Home Screen*.
4. After that it runs fully offline.

## Project structure

```
index.html              app shell (views, dialogs)
css/styles.css          all styling; dark-first, light theme, reduced motion
js/content.js           ← ALL player-facing content lives here (edit this)
js/app.js               engine: beat renderers, state, routing, ending
sw.js                   service worker (precache + offline fallback)
manifest.webmanifest    PWA manifest
icons/                  SVG + PNG app icons
docs/
  ORGANIZE_V1.1_Game_Bible.md   authoritative content source (frozen)
  SOURCE_TODOS.md               items needing human historical/copy confirmation
  QA_CHECKLIST.md               release checklist
tools/
  check-content.mjs     content integrity check (zero deps)
  e2e.mjs               full browser playthrough (needs Playwright)
  serve.mjs             tiny static server
```

## Editing content

Everything the player reads is in **`js/content.js`** — stories, beats,
decisions, reveals, memory phrases, ending, UI labels and the About text. The
engine never contains story copy.

- Each story is `{ id, order, title, memory, chrono, xp, beats: [...], lookCloser: [...] }`.
- Beat types: `title`, `big`, `body`, `number`, `tapSequence`, `decision`,
  `reveal`, `split`, `timeline`, `connection`; `storyComplete` is appended
  automatically and the final grid is driven by `ending`. The header comment in
  `content.js` documents each type's fields.
- Reveal `echo` supports the player's choice: `"You chose {choice}. Some of them did too."`
- Lines not taken verbatim from the Bible are marked `draft: true` with a `note`.
- Content the Bible makes conditional on sources uses `requires: '<flag>'` and a
  `fallback`. Flags live in `SOURCE_FLAGS` at the top of the file and are all
  **off** — see `docs/SOURCE_TODOS.md`.
- **LOOK CLOSER**: add cards to a story's `lookCloser` array
  (`{ kind, title, body: [...], source }`). The button only appears when cards exist.

After editing, run:

```sh
npm run check
```

It fails if story order, decision counts (Story 8 must have zero), XP, or ending
order drift from the Bible, if any non-draft story line is not verbatim in the
Bible, or if gamification / moral-summary vocabulary appears.

When you add or rename files, add them to `ASSETS` in `sw.js` and bump
`VERSION`. Content edits to existing files do not need a bump: the service
worker is network-first, so online players get new content and offline players
get the cached copy.

## Tests

```sh
npm run check              # content integrity, no dependencies
npm i -D playwright        # once, for the browser test
npm run test:e2e           # plays all 12 stories on phone, small phone, desktop
npm run shots              # same, plus screenshots in tools/shots/
```

In environments with a preinstalled Chromium, set `CHROMIUM_PATH` if Playwright
can't find it.

## Design and behaviour notes

- **No auto-advance.** Every beat waits for a tap, click, Space, Enter or →.
  The only timed element is the delayed *REVISIT STORIES* on the final screen.
- **Decisions** store only `{ storyId: { decisionId: optionLabel } }` so a
  reveal can echo the choice. No correctness, alignment, score or profile is
  computed anywhere.
- **XP**: +100 per first completion, shown quietly in the top bar and on the
  completion screen. Nothing for choices, revisits or reading. Story 12 adds
  its XP silently and hides XP through the ending.
- **Ending**: 12 memory cards one at a time → a grid → the grid glides into
  chronological order with years → fade → *WHAT NOW?* → *REVISIT STORIES*.
- **Saved locally** (`localStorage` key `organize.v1`): current story, beat and
  step; completed stories; XP; choices; theme; motion preference. Refresh resumes
  exactly where you were.
- **Accessibility**: full keyboard play, Esc opens the story menu, live-region
  announcements for new text, 56px tap targets, respects
  `prefers-reduced-motion` plus an in-app *Reduced* setting, nothing conveyed by
  colour alone, text sized with container units so words never break.
- **Fonts**: system fonts only (a Helvetica-class display face, a
  Palatino/Georgia-class body face, system monospace), so nothing is fetched.
