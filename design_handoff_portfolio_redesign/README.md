# Handoff: Portfolio Redesign

## Overview
Full visual redesign of shanerex.vercel.app — new design system, restructured
sections, new interactions. Replaces the previous "tennis court" theme.

## About the Design Files
The bundled file (`Portfolio Redesign.html`) is a **design reference built in HTML** —
a working prototype showing exact look, copy, and interaction, not production code to
paste in. Rebuild it inside the existing Next.js app (`app/`, `components/*.tsx` +
CSS Modules, `content.ts` as the copy/data source) following the codebase's existing
patterns — one component per section, content pulled from `content.ts`, tokens in
`design/tokens.css` — rather than introducing a new stack.

## Fidelity
**High-fidelity.** Colors, type, spacing, and copy in the prototype are final. Recreate
pixel-perfectly with the codebase's existing component/CSS Module pattern.

## Design System

**Fonts** (Google Fonts): Bricolage Grotesque (display/headings, weight 700), IBM Plex
Sans (body, 400/500/600), JetBrains Mono (labels, nav, code/data, 400–600).

**Dark theme (default)**
- `--bg: #14141A` `--surface: #1B1B21` `--ink: #EDEAE2` `--ink-dim: #8F8B84` `--ink-mute: #5E5B56`
- `--line: rgba(237,234,225,.14)` `--line-strong: rgba(237,234,225,.28)`
- Accent pair (toggleable lead, see Tweaks): lime `#D6F23C` (ink `#1C210A`) / coral `#FF5A4E` (ink `#2B0B08`)
- `--accent-text` / `--accent-2-text`: same as accent colors in dark mode

**Light theme**
- `--bg: #F6F4EF` `--surface: #FFFFFF` `--ink: #14141A` `--ink-dim: #5B574F` `--ink-mute: #8C877D`
- `--line: rgba(20,20,26,.12)` `--line-strong: rgba(20,20,26,.24)`
- `--accent-text` / `--accent-2-text` use darkened variants for contrast: olive `#5C6B12` (for lime), deep red `#B23327` (for coral) — swap whichever isn't the lead accent

Accent lead is a toggle: "lime" (lime = primary/accent-text, coral = secondary/accent-2-text)
or "coral" (reversed). Default lime.

Radii: pills/buttons `border-radius: 99px`. Cards: `10px`. Max content width: `1280px`.
Section vertical padding: `clamp(56px,8vw,96px)` typical, hero larger.

## Screens / Sections (single scrolling page)

### 1. Header (sticky)
- Sticky top, `rgba(20,20,26,.82)` + `backdrop-filter: blur(10px)`, bottom border `--line`.
- Left: wordmark `shane` + `@dev` (ink-mute) + blinking `_` cursor (accent-text, 1.1s step blink) — links to top.
- Right: nav as REST-style routes in JetBrains Mono 12px — `GET /journey`, `GET /projects`,
  `GET /skills`, `GET /now`, `POST /contact` (method prefix in accent-text, 75% opacity).
  Anchors to section ids. Wraps to a second row on narrow widths (flex-wrap, justify-end).
- Theme toggle: 36px circular icon-only button, lightbulb SVG outline (filled when light
  theme active), toggles dark/light and persists to localStorage.
- "Résumé ↓" pill button, links to a downloadable resume file.

### 2. Hero
- Two-column flex (wraps to stacked on narrow): text column (flex:1) + circular photo
  slot 180×180px, right side, for a LinkedIn-style headshot.
- Eyebrow (mono, uppercase, accent-2-text): "— No dwelling on the last point."
- H1 (Bricolage Grotesque 700, clamp(52px,9.5vw,132px), line-height .94): "Shane Rex" / "Sasikumar" (two lines).
- Subhead (ink-dim, ~20px): "Senior Software Engineer building event-driven backends on Java, Spring Boot and GCP."
- Lede paragraph (17px, 1.7 line-height): longer bio paragraph — see `content.ts` `site.lede`.
- CTA row: email pill button (accent bg), LinkedIn outline pill, GitHub outline pill,
  "Open to new roles" availability tag with pulsing dot.
- Location line (mono, ink-mute): "Bengaluru, India"
- **Terminal card** (bespoke touch): mock-window chrome (3 colored dots) titled
  `health-check.sh`, body shows a fake `curl` + JSON response using real metrics
  (status: ok, reliability: 99.99%, throughput: 300k+/day, p95_latency: <1s).
- All hero elements fade+slide in on load, staggered ~90ms apart (opacity 0→1,
  translateY 16px→0, over .7s).

### 3. System status band (metrics)
- Full-width band, background = accent primary color, text = accent "ink" color (dark text on lime, light text on coral).
- Eyebrow row: pulsing dot + "system_status — live" label.
- 4-column grid (auto-fit, min 180px), each cell divided by a subtle left border:
  big mono figure (300K+, 99.99%, 3M+, 6s → 1s) + small label underneath.
- Cells stagger-reveal on scroll (90ms apart).

### 4. Journey (combined experience + education timeline)
- Vertical timeline: rail line (2px, --line-strong) down the left, each entry has a
  dot marker (accent-text; ink-mute for the education entry) on the rail.
- Entries, oldest → newest:
  1. **Education** — Thiagarajar College of Engineering, "Computer Science · CGPA 9.42/10",
     tag "EDUCATION" (dateLabel), a short personal-interests paragraph below (sport/film — see `content.ts` `about`).
  2. **Software Analyst**, Bounteous x Accolite, Jun 2023 — Jul 2025, 5 bullet points (see `content.ts` `experience[1]`).
  3. **Senior Software Engineer**, Bounteous x Accolite, Aug 2025 — Present, marked
     "● current" with a pulsing dot, 6 bullet points (see `content.ts` `experience[0]`).
- Each entry: small uppercase kind pill ("WORK"/"EDUCATION"), title (Bricolage 700, ~24px),
  date on the right (mono, ink-mute), subtitle/company line, then bullets (work) or a
  note paragraph (education). Bullets use a "→" marker in accent-2-text.
- Entries stagger-reveal ~110ms apart.

### 5. Projects
- One row per project (see `content.ts` `projects`), each: large outlined index number
  (01/02/03, stroke-only text using -webkit-text-stroke), title, status pill
  ("Completed" = ink-mute, "In progress" = accent-2-text), stack tags (mono),
  2–4 description lines, "View repo ↗" link (when `href` present) that underlines
  in accent-text on hover.

### 6. Skills
- Grid of category groups (auto-fit, min 260px): Languages & Frameworks, Cloud &
  Infrastructure, Databases & Data, Core Concepts, Tools (see `content.ts` `skills`).
  Each group has a `lead` count — that many chips render "loud" (solid ink-colored
  pill, bg swapped per theme), the rest render as quiet outlined mono chips.
- Groups stagger-reveal ~100ms apart.

### 7. Now
- Simple log-style list, 3 rows: a mono tag ("AT WORK"/"BUILDING") + one line of text,
  separated by hairline borders. Content grounded in current role + in-progress projects
  (Spec Driven Development rollout, Atlas PIM build, alef-jasper-rebuild).

### 8. Contact (footer)
- Surface background, top border.
- Large headline: "Let's build something that stays up."
- Email link (underline, accent-text on hover), Download Résumé (solid accent pill),
  LinkedIn/GitHub outline pills.
- Bottom row: location + availability, and © year + name.

### Global: floating scroll-to-top
- Fixed bottom-right circular button (46px), appears after scrolling ~480px, smooth-scrolls to top.
- Fixed top progress bar (3px, accent color) tracks scroll position across the whole page.

## Interactions & Behavior
- **Scroll reveal**: every `[data-reveal]` element starts at opacity 0 / translateY(16px)
  and animates in via IntersectionObserver (rootMargin `0px 0px -8% 0px`, threshold 0.05),
  transition `.7s ease` on opacity+transform, with per-element `transition-delay` for stagger.
  Fallback: reveal everything after 2s if IntersectionObserver unavailable.
- **Theme toggle**: click flips `light`/`dark`, persisted in `localStorage` under key
  `srs-theme`, read back on load (defaults to `dark`). All CSS custom properties swap;
  transition `background .3s ease, color .3s ease` on the root.
- **Scroll progress + scroll-to-top**: single scroll listener computes
  `scrollTop / (scrollHeight - clientHeight) * 100` for the bar width; toggles the
  scroll-to-top button's visibility past 480px scrolled; button calls
  `window.scrollTo({top:0, behavior:'smooth'})`.
- **Nav/CTA hover states**: color shifts to `--ink` or `--accent-text` on hover, buttons
  lift `translateY(-2px)` on hover (email CTA, download résumé).
- No client-side routing — all nav items are same-page anchors.

## State Management
- `theme`: `'dark' | 'light'`, persisted to localStorage.
- `showScrollTop`: boolean, derived from scroll position.
- No forms/data fetching — content is static from `content.ts`.

## Design Tokens
See "Design System" above for full color/type/radius values. Spacing is ad hoc
(clamp-based section padding, 24–48px gaps) rather than a fixed scale — match values
as shown in the prototype file.

## Assets
- Fonts loaded via Google Fonts (`Bricolage Grotesque`, `IBM Plex Sans`, `JetBrains Mono`).
- One user-supplied photo (LinkedIn headshot) — circular, 180×180px in the hero. No other
  images; icons are inline SVG (lightbulb toggle only).
- All copy sourced from the repo's own `content.ts` — reuse it as-is (extend its shape to
  add `education`, `now`, and the merged `journey` structure described above).

## Files
- `Portfolio Redesign.html` — full working prototype (open directly in a browser).
- Reference the live prototype for exact spacing/hover states not fully spelled out above.
