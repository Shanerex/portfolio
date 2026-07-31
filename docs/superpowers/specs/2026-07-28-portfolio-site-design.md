# Portfolio Site — Design Spec

**Date:** 2026-07-28
**Owner:** Shane Rex Sasikumar
**Status:** Approved, ready for implementation planning

## Purpose

A single-page personal portfolio for a Senior Software Engineer (Java / Spring Boot / GCP), built to land a full-time role. A recruiter or hiring manager should scan identity → impact → experience → projects in under a minute, then find the email.

The visual design is already complete and handed off in `design/` (referred to as directions **4b / 5a**). This spec covers how that design is rebuilt as a production site — not what it looks like. `design/README.md` remains the authority on every colour, size, and spacing value.

## Division of responsibility

- **Shane supplies all content**: resume summary, experience bullets, project descriptions, skills, hobbies, and the link/CV assets.
- **Implementation supplies everything else**: faithful design reproduction, smooth interaction, accessibility, responsive behaviour, and deployment.

Copy recovered from the design canvas ships as a working default so the site builds and renders correctly from day one. Replacing it is a single-file edit to `content.ts` requiring no markup changes.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js, App Router, TypeScript | Shane has prior exposure; familiarity is the constraint that matters for a site he maintains alone |
| Output mode | `output: 'export'` (static) | No data layer, no server logic. Deploys as plain files |
| Host | Vercel, `*.vercel.app` subdomain | Zero-config for Next.js, preview deploy per branch |
| Repo | Public on GitHub | Source is itself a portfolio artifact |
| Styling | `tokens.css` as global + CSS Modules per component | Design hands over exact px values and a token file; Tailwind would mean translating them into arbitrary-value classes for no gain |
| Fonts | `next/font/google`, self-hosted at build | No runtime request to Google, no layout shift. Exactly what the handoff asked for |
| Scope | One page, four sections, permanently | No blog, no case studies, no CMS |
| Project links | All three link out to GitHub, `target="_blank" rel="noreferrer"` | Follows from one-page-forever; no internal case-study pages |
| CV link | Opens PDF in a new tab | Recruiters skim without a download landing in their Downloads folder |
| Fifth section | Not added | Spec-driven development is already carried by a bullet in the current role and the `file-upload-sdd` project. Protects the one-minute scan |
| Project status | Small pill left of the project name, `in-progress` only | Not in the original design canvas. `completed` is the default state for most projects, so only the exception is flagged. Pill reuses the existing skill-chip pattern (bordered, 99px radius, mono) rather than adding a new visual element |
| OG / link preview | Out of scope | `<title>` and meta description only — browser tab and search result, no unfurl card |

## Architecture

```
portfolio/
├── app/
│   ├── layout.tsx          # fonts, metadata, pre-paint theme script
│   ├── page.tsx            # server component, composes sections
│   └── globals.css         # design/tokens.css + responsive rules
├── components/
│   ├── Sidebar.tsx         # server — identity, nav, contact
│   ├── ThemeToggle.tsx     # client — the only interactive control
│   ├── ScrollEffects.tsx   # client — one IntersectionObserver
│   ├── Experience.tsx      # server
│   ├── Projects.tsx        # server
│   ├── Skills.tsx          # server
│   └── About.tsx           # server
│                           # (+ a .module.css alongside each visual component)
├── content.ts              # every string, typed — the file Shane edits
├── public/                 # cv.pdf, favicon
└── next.config.ts          # output: 'export'
```

Every component except `ThemeToggle` and `ScrollEffects` is a server component and ships no JavaScript.

### Content layer

`content.ts` exports typed structures — `SiteMeta`, `ExperienceEntry[]`, `Project[]`, `SkillGroup`, `About` — consumed by the section components. Adding a role or project means appending an object, never touching JSX. TypeScript types make a malformed entry a build error rather than a broken layout.

### Theme

- `data-theme="light" | "dark"` on `<html>`; every colour is already a CSS variable, so nothing else changes.
- Persisted to `localStorage` under `srs-theme`. First visit initialises from `window.matchMedia('(prefers-color-scheme: dark)')`.
- A small inline script in `layout.tsx`'s `<head>` applies the stored value **before first paint**. React never gets the chance to flash the wrong theme.
- `ThemeToggle` is a `<button>` with an accessible label ("Switch to dark theme"), reading and writing the same key.
- `tokens.css` currently sets `html { color-scheme: light dark; }` statically. This must become per-theme (`color-scheme: light` / `dark` under the respective selectors) so native scrollbars and form controls match the active theme. This is the only edit to the handed-off token file.

### Scroll effects

A single `IntersectionObserver` in `ScrollEffects` serves two purposes:

1. **Reveal** — adds `.is-in` to `.reveal` elements and unobserves them. `rootMargin: '0px 0px -8% 0px'`, `threshold: 0.05`. Sibling stagger via `transition-delay` in `.06s` increments, capped at 3 steps.
2. **Scroll-spy** — highlights the nav item for the section currently in view.

Scroll-spy toggles classes and `aria-current` on DOM nodes directly rather than lifting `activeSection` into React state. This keeps `Sidebar` a server component and avoids threading state through the tree for what is purely a visual affordance.

Nav anchors smooth-scroll to their sections.

### Failure modes

These are requirements, not nice-to-haves. The reveal animation starts elements at `opacity: 0`, so anything that stops the animation from running leaves the page blank.

- **Observer never fires** — a ~2s timer reveals everything unconditionally (specified in the handoff).
- **JavaScript disabled or bundle fails to load** — a `<noscript>` block forces `.reveal { opacity: 1; transform: none; }`. The 2s failsafe is itself JavaScript and does not cover this case.
- **Reduced motion** — `prefers-reduced-motion: reduce` skips the animation entirely; already handled in `tokens.css`.

## Responsive behaviour

| Breakpoint | Layout |
|---|---|
| ≥ 1024px | As designed: 340px sticky sidebar + 720px content column |
| 768–1023px | One column. Sidebar becomes a normal non-sticky header block; vertical nav becomes a horizontal row. Content padding `48px 40px 72px`, max-width 720px, centred |
| < 768px | One column, padding `32px 20px 64px`. Name 26px, lede 18px/1.6. Experience header wraps (title above, dates below at mono 11.5px). Project stack tag wraps under the name |

The sidebar uses `100dvh`, not the prototype's fixed 740px (which exists only because it renders in a preview frame). The theme toggle must stay reachable and never overlap content on mobile. Every link and the toggle must be ≥ 44px in at least one dimension on mobile.

## Accessibility

- Semantic landmarks: `<aside>` for the sidebar, `<main>` for content, `<section>` + `<h2>` per section.
- Visible `:focus-visible` ring on every link and the toggle: `outline: 2px solid var(--fg4); outline-offset: 3px`. The handoff marks this required, not optional — the prototype has no focus states at all.
- `--fg5` is reserved for ≥ 12px mono meta (dates, tags, location). Never body copy.
- Theme toggle is a real `<button>` with an accessible label.

## Verification

- **Visual** — Playwright screenshots at 1440, 1024, 768 and 390px wide, in both themes, compared against the design canvas.
- **Keyboard** — full tab pass confirming focus rings are visible on every interactive element and order is logical.
- **No-JS** — load with JavaScript disabled; all content must be visible.
- **Theme flash** — hard reload in dark mode; no light flash before paint.
- **Lighthouse** — accessibility and best-practices scores, plus contrast checks.

## Out of scope

OG / link-preview cards, case-study pages, blog, analytics, imagery of any kind (no photos, icons, logos, or illustrations), accent colours, shadows, gradients.

## Assets required before launch

Content is finalized in `content.ts` (see Task 3 of the implementation plan) — LinkedIn/GitHub URLs, experience bullets, skills, and the projects list (`alef-jasper-rebuild`, `CryptoUIJC`, `resume-refresh`) are all real values, not placeholders.

Still outstanding:

- CV PDF for `public/` — none exists yet anywhere in `career/` or `Documents/Projects/`

## Known gap in the handoff

`design/README.md` references `design/content.md` ("every string in the design, ready to paste"), which is absent from the bundle. The copy was recovered from `design/templates/Portfolio Directions.dc.html` (options 4b / 5a) instead. Since Shane is supplying final content, this is closed and needs no re-export.
