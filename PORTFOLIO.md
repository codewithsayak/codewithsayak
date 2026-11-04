# Code with character — Portfolio v2

An editorial, motion-led rebuild of Sayak Karmakar’s portfolio. React handles the
interface, Node.js/Express serves the app and a small honest API, and GSAP +
Lenis choreograph the scroll experience. The visual language stays true to the
original profile: warm paper, ink, burgundy, and a little serif personality.

## Run it

Requires **Node.js 22.12+**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The Express server mounts Vite in middleware mode,
so the UI and API share one origin and one port.

```bash
npm run build      # production assets in dist/
npm start          # Express serves dist/ + the API
npm test           # Node API/validation tests
npm run test:e2e   # Playwright browser tests (bundled Chromium)
```

`PORT` overrides the default port:

```bash
PORT=8080 npm start
```

## What’s inside

- **Sculptural hero.** A lazy-loaded Three.js torus knot reacts to pointer and
  scroll position, with an SVG fallback when WebGL is unavailable.
- **Layered selected work.** Real projects stack, scale, and settle as you
  scroll; each opens an accessible case-study dialog.
- **Scroll-punctuated manifesto.** The about section reveals its statement word
  by word, then introduces the maker and toolkit.
- **Working gradient playground.** Pick a mood, switch gradient type, rotate the
  angle, copy real CSS, and export a 1920×1200 PNG wallpaper.
- **Horizontal journey cinema.** On large screens the four real milestones pin
  and unfold horizontally with scroll. A visible skip link jumps to the build
  log. On mobile, short viewports, or reduced motion, the same chapters render
  as a normal vertical story—no scroll trapping.
- **Contribution snapshot.** Real public GitHub activity, clearly labelled as a
  snapshot rather than a live counter.
- **Contact draft flow.** Server-side validation prepares a `mailto:` draft.
  Nothing is sent or stored by the website; the visitor sends from their own
  email app.

## Motion & accessibility

- Honors `prefers-reduced-motion` by default.
- A persistent header toggle lets visitors pause or enable animation explicitly.
- Native `<dialog>` elements provide focus containment, Escape, and focus return.
- Semantic sections, skip links, visible focus states, and labelled controls.
- The horizontal story contains no off-screen interactive traps; its only
  control is the visible “Skip to the build log” link.
- Automated axe checks cover the page, journey, and dialogs.

## Project map

```text
src/
  App.jsx                    page composition + reveal choreography
  components/                hero, work, about, playground, journey, contact
  hooks/ExperienceContext.jsx motion preference, Lenis, scrolling, dialogs
  styles.css                 editorial design system + responsive layouts
server/
  index.js                   Express + Vite dev / static production server
  app.js                     security headers, API routes, rate limiting
  contact.js                 validation + mailto draft preparation
  activity.js                verified contribution snapshot loader
shared/
  portfolio.js               profile, projects, and journey content
  contributions-snapshot.json public GitHub activity snapshot
public/                      images, résumé, icons, social image
tests/                       Node tests + Playwright browser tests
```

Edit `shared/portfolio.js` to change profile details, projects, or journey
chapters. The UI and `/api/portfolio` read from the same source.

## API

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Service health |
| `GET /api/portfolio` | Shared profile/projects/journey content |
| `GET /api/activity` | Contribution snapshot (`isLive: false`) |
| `POST /api/contact` | Validates input and returns a mailto draft; never sends |

The contact endpoint is rate-limited and rejects malformed/oversized payloads.

## Deploy as a Node service

The production server is a normal Node process, suitable for Render, Railway,
Fly.io, a VPS, or any container host:

```bash
npm ci
npm run build
NODE_ENV=production npm start
```

A multi-stage `Dockerfile` is included:

```bash
docker build -t sayak-portfolio .
docker run -p 3000:3000 sayak-portfolio
```

Production responses include a strict Content Security Policy. The app allows
same-origin and Arena preview framing so the live preview works inside Arena.
