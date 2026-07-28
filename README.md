# Handoff: Shane Rex Sasikumar — Portfolio Site

## Overview
A single-page personal portfolio for a Senior Software Engineer (Java / Spring Boot / GCP), built to land a full-time role. Layout is a **fixed left sidebar** (identity + nav + contact) with a **scrolling right column** (lede, Experience, Projects, Skills, About, contact). Light and dark themes, toggled by the user and persisted. No imagery, no accent colour — hierarchy comes from type scale and hairline dividers.

This is the design referred to as **4b / 5a** in the design canvas.

## About the Design Files
The files in this bundle are **design references created in HTML** — a prototype showing intended look and behaviour, **not production code to copy directly**. The task is to **recreate this design in the target codebase's own environment** (React/Next.js, Astro, plain HTML+CSS — whatever you choose) using its established patterns. `tokens.css` is the one file meant to be used more or less as-is: it holds the real values.

If no codebase exists yet, a static site is entirely sufficient here — Next.js (App Router) or Astro, one page, no data layer.

## Fidelity
**High-fidelity.** Colours, type sizes, line-heights, spacing and transitions below are final and should be matched. The only intentionally open items are listed under *Open decisions*.

---

## Screens / Views

### Screen: Home (single page, only view)
**Purpose:** A recruiter or hiring manager scans identity → impact → experience → projects in under a minute, then finds the email.

**Layout**
- Root: CSS Grid, `grid-template-columns: 340px 1fr`, `align-items: start`.
- **Sidebar** (col 1): `position: sticky; top: 0; height: 100vh;` `padding: 64px 40px;` `box-sizing: border-box;` `display: flex; flex-direction: column; justify-content: space-between;` `border-right: 1px solid var(--line)`.
  - (The prototype uses a fixed 740px height because it renders inside a preview frame — use `100vh` / `100dvh` in production.)
- **Content** (col 2): `padding: 64px 56px 90px; max-width: 720px;`
- Sections in the content column are separated by `margin-top: 48px; padding-top: 44px; border-top: 1px solid var(--line)`. The first (Experience) has only `padding-top: 44px`.

**Components**

1. **Theme toggle** — `position: absolute; top: 22px; right: 26px;` pill button.
   - `display:flex; align-items:center; gap:8px; padding:8px 13px;`
   - `border:1px solid var(--line2); border-radius:99px; background:var(--panel); color:var(--fg3);`
   - Font: mono 12px/1. Label text: `Light` / `Dark`.
   - Leading dot: 8px circle, `border:1px solid var(--fg4)`; fill `transparent` in light, `var(--fg4)` in dark.
   - Hover: `border-color: var(--fg4); color: var(--fg)` over 0.25s.
   - In production, place it in the sidebar's top-right or as a fixed element — do not let it overlap content on mobile.

2. **Sidebar name (h1)** — Archivo 600, 30px, line-height 1.18, letter-spacing −0.03em, `color: var(--fg)`. Two lines: "Shane Rex" / "Sasikumar".

3. **Sidebar blurb (p)** — IBM Plex Sans 400, 15.5px/1.55, `color: var(--fg3)`, `margin-top: 14px`.
   Copy: "Senior Software Engineer building event-driven backends on Java, Spring Boot and GCP."

4. **Sidebar nav** — `display:flex; flex-direction:column; gap:12px; margin-top:38px;` Plex Sans 14px.
   - Each item: `display:flex; gap:12px; align-items:center;` preceded by a 16px × 1px rule.
   - Active/first item: text `var(--fg)`, rule `var(--fg4)`. Others: text `var(--fg4)`, rule `var(--line2)`.
   - Hover: text → `var(--fg)`.
   - Items: Experience · Projects · Skills · About. Should be anchor links with smooth scroll + active-section highlighting (scroll-spy) — the prototype only shows the static states.

5. **Sidebar footer** — mono 12.5px/1.9, `color: var(--fg5)`: "Bengaluru, India" / "Open to new roles".
   Below it, `display:flex; gap:16px; margin-top:18px;` Plex Sans 13.5px links: **Email** (colour `var(--fg)`, `border-bottom: 1px solid var(--line2)`, `padding-bottom: 3px`; hover `border-color: var(--fg)`), then LinkedIn · GitHub · CV (colour `var(--fg4)`, hover `var(--fg)`).

6. **Lede paragraph** — Plex Sans 400, 21px/1.65, `color: var(--fg2)`, `text-wrap: pretty`, `margin-bottom: 52px`. Reveals on load.
   Copy: "Three years building distributed services that stay up: streaming pipelines, transaction engines and zero-downtime migrations. I own what I ship — design doc through production incident."

7. **Section label (h2)** — mono 500, 12.5px/1, letter-spacing 0.12em, uppercase, `color: var(--fg4)`, `margin-bottom: 28px` (22px for Skills, 20px for the last two).

8. **Experience entry**
   - Header row: `display:flex; justify-content:space-between; align-items:baseline; gap:18px`.
     - Title: Archivo 600, 18px/1.3, `var(--fg)`.
     - Dates: mono 400, 12px/1, `var(--fg5)`, `flex: none`.
   - Company line: Plex Sans 14.5px/1.5, `var(--fg3)`, `margin-top: 5px`.
   - Bullets: `display:flex; flex-direction:column; gap:9px; margin-top:14px;` Plex Sans 15px/1.7, `var(--fg2)`. **No bullet glyphs** — separation is the 9px gap.
   - Gap between the two roles: `margin-bottom: 34px`.

9. **Project row** — a full-width link, `padding: 18px 0; border-bottom: 1px solid var(--line)`, stacked with no gap.
   - Header row: name (Archivo 600, 16.5px/1.3) left, stack tag (mono 11.5px/1, `var(--fg5)`, `flex:none`) right, `align-items: baseline; gap: 16px`.
   - Description: Plex Sans 14.5px/1.6, `var(--fg3)`, `margin-top: 7px`.
   - Hover: `padding-left: 8px` over 0.3s (the whole row nudges right). No colour change.
   - Each should link to the GitHub repo, `target="_blank" rel="noreferrer"`.

10. **Skill chips** — `display:flex; flex-wrap:wrap; gap:8px`.
    - Chip: `padding: 7px 12px; border: 1px solid var(--line2); border-radius: 99px;` mono 13px/1, `color: var(--fg2)`. Static, not interactive.

11. **About paragraph** — Plex Sans 16px/1.8, `var(--fg2)`, `text-wrap: pretty`.
    Followed by the email link: `display:inline-block; margin-top:26px;` mono 14px/1, `color: var(--fg)`, `border-bottom: 1px solid var(--line2)`, `padding-bottom: 4px`; hover `border-color: var(--fg)`. Text: `shanerexsasikumar@gmail.com →`.

**Exact copy** — see `content.md`.

---

## Interactions & Behavior

- **Scroll reveal.** Elements enter with `opacity 0 → 1` and `translateY(12px) → 0`. Transition `opacity .6s ease, transform .6s ease` (the lede uses `.7s` and a 14px offset). Stagger siblings with `transition-delay` of `.06s` increments (max 3 steps). Implement with a single `IntersectionObserver` (`rootMargin: '0px 0px -8% 0px'`, `threshold: 0.05`) that adds `.is-in` and unobserves. **Ship a fallback**: if the observer hasn't fired within ~2s, reveal everything — content must never be stuck invisible. Respect `prefers-reduced-motion: reduce` by skipping the animation entirely (already handled in `tokens.css`).
- **Theme toggle.** Sets `data-theme="light" | "dark"` on `<html>`; every colour is a CSS variable so nothing else changes. Persist to `localStorage` under a namespaced key (e.g. `srs-theme`); on first visit initialise from `window.matchMedia('(prefers-color-scheme: dark)')`. Apply the stored value in a tiny inline script in `<head>` **before** first paint to avoid a flash. Body transitions `background`/`color` over 0.35s.
- **Hovers.** Project rows: `padding-left: 8px`, 0.3s. Nav and link hovers: colour or border-colour only, 0.25–0.3s. No transforms, no shadows, no scale.
- **Nav.** Smooth-scroll to sections; highlight the section currently in view (scroll-spy via IntersectionObserver).
- **Focus states.** Not designed in the prototype — add a visible ring using `outline: 2px solid var(--fg4); outline-offset: 3px` on `:focus-visible` for every link and the toggle. This is required, not optional.

### Responsive behavior
The prototype is desktop-only (1240px frame). Required breakpoints:

- **≥ 1024px** — as designed: 340px sidebar + 720px content column.
- **768–1023px (tablet)** — collapse to one column. Sidebar becomes a normal (non-sticky) header block: name, blurb, contact links inline; drop the vertical nav or turn it into a horizontal row of links. Content padding `48px 40px 72px`, `max-width: 720px`, centred.
- **< 768px (mobile)** — one column, padding `32px 20px 64px`. Name 26px. Lede 18px/1.6. Experience header row wraps: title on one line, dates below at mono 11.5px. Project rows keep their layout but let the stack tag wrap under the name. Theme toggle stays reachable (top-right, ≥ 44px tap target). Every link and the toggle must be ≥ 44px in at least one dimension.
- Test at 1440, 1024, 768 and 390px wide.

---

## State Management
Trivial — no data layer.
- `theme: 'light' | 'dark'` — persisted in `localStorage`, initialised from OS preference, applied to `document.documentElement[data-theme]`.
- `activeSection: string` — derived from scroll position for nav highlighting.
- Reveal state is per-element and handled by the observer, not app state.

---

## Design Tokens
All values live in **`tokens.css`** (colours for both themes, type scale, spacing, radii, motion). Summary of the colour roles:

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--bg` | `#faf9f7` | `#101011` | page background |
| `--panel` | `#ffffff` | `#17171a` | theme toggle surface |
| `--fg` | `#16161a` | `#edebe8` | headings, primary links |
| `--fg2` | `#3f3f45` | `#c4c1bd` | body copy, bullets, chips |
| `--fg3` | `#5f5d59` | `#a4a19c` | company, project descriptions |
| `--fg4` | `#7a7772` | `#8e8b87` | section labels, inactive nav |
| `--fg5` | `#8d8a85` | `#78756f` | mono meta: dates, tags, location |
| `--line` | `rgba(0,0,0,.10)` | `rgba(255,255,255,.09)` | dividers, sidebar border |
| `--line2` | `rgba(0,0,0,.14)` | `rgba(255,255,255,.14)` | chip borders, link underlines |

Radii: `99px` (pills) only. **No shadows. No accent colour. No gradients.**

### Fonts
Google Fonts — Archivo (600) and IBM Plex Sans (400) and IBM Plex Mono (400, 500):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@600&family=IBM+Plex+Sans:wght@400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```
Prefer self-hosting (or `next/font`) for performance. Weights used: Archivo 600 only; Plex Sans 400 only; Plex Mono 400 and 500. Nothing else is needed.

---

## Assets
**None.** No photos (explicitly out of scope), no icons, no logos, no illustrations. The only non-text elements are 1px hairlines and one 8px circle in the theme toggle. The résumé PDF should be added as a static file and linked from the sidebar "CV" link.

---

## Accessibility checklist
- Semantic landmarks: `<header>` or `<aside>` for the sidebar, `<main>` for content, `<section>` + `<h2>` per section.
- The theme toggle is a `<button>` with `aria-pressed` or an accessible label ("Switch to dark theme").
- Contrast: all pairs above meet WCAG AA for their sizes; keep `--fg5` for ≥ 12px mono meta only, never for body copy.
- Visible `:focus-visible` rings (see Interactions).
- `prefers-reduced-motion` honoured.

## Open decisions (ask Shane)
- Project rows currently link to GitHub. If any project deserves a case-study page, the row becomes an internal link — layout unchanged.
- Whether the CV link opens a PDF in a new tab or downloads.
- Whether to add a fifth section for the spec-driven-development writeup (there's material for it).

## Files
- `tokens.css` — design tokens, both themes, base + reveal styles. Use as the starting stylesheet.
- `content.md` — every string in the design, ready to paste.
- `Portfolio Directions.dc.html` — the full design canvas from the conversation. The relevant options are **`4b`** (dark, as originally designed) and **`5a`** (same layout, light theme, working toggle). Other options (turns 1–3) are earlier explorations — ignore them.
- `support.js` — runtime needed only to open `Portfolio Directions.dc.html` in a browser. Not part of the design.
