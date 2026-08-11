# Portfolio Redesign — System Status

## Overview

The current site ("Night Match") leans on a tennis metaphor abstracted into court geometry, a fixed rail, and cinematic motion. User feedback on the live site was negative — the metaphor doesn't land, and the fixed rail/court grid read as unfamiliar rather than confident. This redesign replaces the visual system, page structure and rail-based layout entirely, following the high-fidelity handoff in `design_handoff_portfolio_redesign/`.

**Direction:** developer-console aesthetic — REST-style nav routes, a `shane@dev_` wordmark with a blinking cursor, a mock `health-check.sh` terminal card in the hero, and a `system_status — live` metrics band. The register is literal (a terminal, an API response, a route list) rather than abstracted, which is the opposite choice from the outgoing tennis metaphor.

**Layout:** single scrolling page with a sticky top header (not a fixed rail). This is the single biggest structural change — the 340px/240px sidebar-plus-content grid and the four-column "court" grid are both retired in favor of a conventional max-width container with a sticky header and full-bleed section bands.

**Content:** the handoff's `journey` structure merges Experience and Education into one timeline, and adds a new `Now` section. Everything else (`experience`, `projects`, `skills`, `about`) carries over from `content.ts` with a restructure, not a rewrite.

**Fidelity:** the handoff (`design_handoff_portfolio_redesign/README.md` and `Portfolio Redesign.html`) is high-fidelity and final on colour, type, spacing, copy and interaction. This spec translates it into the codebase's own component/CSS-Module pattern and fills the gaps the handoff leaves open (exact contrast verification, test plan, file-level architecture).

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Layout | Sticky top header + single column, `max-width: 1280px` | Matches the handoff exactly; retires the fixed rail and court grid |
| Accent lead | Lime fixed, not a runtime toggle | The lime/coral swap in the prototype is a design-canvas preview affordance, not a shipped feature; lime is the handoff's stated default |
| Theme naming | `dark` / `light` (drops `night` / `day`) | The tennis vocabulary is retired along with the rest of the metaphor; the new design's own copy already says "Light mode" / "Dark mode" |
| Photo | `public/headshot.jpg`, square-cropped from the supplied source photo, displayed as a 180×180 circle | User-supplied; cropped top-anchored to frame head and shoulders since the source was a fuller-body shot |
| Résumé | `public/resume.pdf`, wired to both the header pill and footer button | User-supplied; the prior "drop the CV link" commit is superseded now that the file exists |
| Section labels | Inline `// 0N_slug` comment-style label per section, not a shared `SectionLabel` component | Matches the handoff; each section owns its own label markup since the numbering is section-specific |
| `journey` | Derived in `content.ts` from `education` + `experience`, not hand-duplicated | Keeps a single source of truth; the merge order (education, then experience oldest→newest) is fixed data, not view logic |
| Scroll effects | Extend the existing `ScrollEffects.tsx` rather than write a new observer | It already implements the reveal + scroll-spy pattern the handoff specifies (same `rootMargin`/`threshold`, same 2s failsafe); only the scroll-progress bar and scroll-to-top visibility are new |
| Dependencies | None added | Progress bar, scroll-to-top and reveal are all achievable with the existing IntersectionObserver + scroll-listener pattern |
| Framework / output | Unchanged — Next.js App Router | Nothing about the redesign requires a data layer or routing change |

## Design tokens

Tokens move from `app/globals.css` (source of truth) with `design/tokens.css` kept as a mirror, matching the existing convention.

### Colour — dark theme (default)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#14141A` | Page background |
| `--surface` | `#1B1B21` | Terminal card, contact footer, project row stripes |
| `--ink` | `#EDEAE2` | Primary text |
| `--ink-dim` | `#8F8B84` | Secondary text — nav, blurb, descriptions |
| `--ink-mute` | `#5E5B56` | Tertiary — dates, location, kind pills (≥12px mono only, never body copy) |
| `--line` | `rgba(237,234,225,.14)` | Hairlines, header border |
| `--line-strong` | `rgba(237,234,225,.28)` | Card borders, pill borders, timeline rail |
| `--accent-text` | `#D6F23C` (lime) | Nav method prefix, section markers, accent copy |
| `--accent-2-text` | `#FF5A4E` (coral) | Availability dot, "current" marker, timeline arrows |
| `--primary` | `#D6F23C` (lime) | Status band background — fixed regardless of theme |
| `--primary-ink` | `#1C210A` | Text/figures on the status band |

### Colour — light theme

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F6F4EF` | Page background |
| `--surface` | `#FFFFFF` | Terminal card, contact footer |
| `--ink` | `#14141A` | Primary text |
| `--ink-dim` | `#5B574F` | Secondary text |
| `--ink-mute` | `#8C877D` | Tertiary (≥12px mono only) |
| `--line` | `rgba(20,20,26,.12)` | Hairlines |
| `--line-strong` | `rgba(20,20,26,.24)` | Card/pill borders |
| `--accent-text` | `#5C6B12` (darkened olive) | Same roles as dark, contrast-adjusted |
| `--accent-2-text` | `#B23327` (deep red) | Same roles as dark, contrast-adjusted |
| `--primary` / `--primary-ink` | `#D6F23C` / `#1C210A` | Unchanged — the lime band itself doesn't change per theme |

### Contrast — verified WCAG AA

Computed with the exact sRGB piecewise formula via the existing `tests/helpers/contrast.ts`, matching how the outgoing palette was verified.

| Pair | Ratio | Requirement |
|---|---|---|
| Dark `--ink` on `--bg` | 15.3:1 | AA normal text |
| Dark `--ink-dim` on `--bg` | 5.4:1 | AA normal text |
| Dark `--accent-text` on `--bg` | 14.5:1 | AA normal text |
| Dark `--accent-2-text` on `--bg` | 6.0:1 | AA normal text |
| Dark `--ink` on `--surface` | 14.3:1 | AA normal text |
| `--primary-ink` on `--primary` (both themes) | 13.1:1 | AA normal text |
| Light `--ink` on `--bg` | 16.7:1 | AA normal text |
| Light `--ink-dim` on `--bg` | 6.5:1 | AA normal text |
| Light `--accent-text` on `--bg` | 5.4:1 | AA normal text |
| Light `--accent-2-text` on `--bg` | 5.6:1 | AA normal text |
| Light `--ink` on `--surface` | 18.4:1 | AA normal text |

`--ink-mute` is **below** AA at normal-text sizes (dark 2.7:1, light 3.3:1) in both themes — this is inherited directly from the handoff's own values, not an oversight. It is restricted to ≥12px mono meta (dates, location, kind pills, stack tags) exactly as the handoff uses it, and must never carry body copy. Tests assert the AA-passing pairs at the 4.5:1 threshold and separately assert `--ink-mute` is never applied to a body-copy class, so a future edit that widens its usage fails the build rather than shipping.

### Typography

Three families, self-hosted via `next/font/google`, replacing Archivo/Plex Sans/Plex Mono:

- **Bricolage Grotesque** (weight 700) — display: hero name, section h3/h2 headings
- **IBM Plex Sans** (400/500/600) — body: blurb, lede, bullets, descriptions
- **JetBrains Mono** (400–600) — mono: nav, labels, dates, terminal card, chips

| Token | Value | Use |
|---|---|---|
| Hero H1 | `clamp(52px,9.5vw,132px)` / lh `.94` / ls `-.025em` / Bricolage 700 | "Shane Rex" / "Sasikumar" |
| Contact H2 | `clamp(36px,6vw,72px)` / lh `1` / ls `-.02em` / Bricolage 700 | "Let's build something that stays up." |
| Journey/Section H3 | `clamp(20px,2.4vw,26px)` / Bricolage 700 | Timeline entry titles |
| Project name | `clamp(22px,2.4vw,28px)` / Bricolage 700 | Project row titles |
| Status figure | `clamp(30px,4.5vw,46px)` / mono 600 | Metric figures |
| Blurb/subhead | `clamp(18px,2.1vw,22px)` | Hero subhead |
| Lede | `17px` / lh `1.7` | Hero paragraph |
| Body | `15–16px` / lh `1.6–1.7` | Bullets, descriptions |
| Mono label | `11–13px` / ls `.08–.16em` uppercase | Nav, eyebrows, section markers, chips |

### Spacing / radius

Section vertical padding: `clamp(56px,8vw,96px)` typical (hero larger, `clamp(56px,10vw,120px)`). Max content width `1280px`, gutter `clamp(20px,4vw,56px)`. Radii: `99px` pills, `10px` cards.

## Page structure

Single scrolling page, no grid placements to alternate — every section is a full-width block within the `1280px` container.

| # | Section | Notes |
|---|---|---|
| — | Header (sticky) | `rgba(20,20,26,.82)` + `blur(10px)`, wordmark + REST nav + theme toggle + résumé pill |
| — | Hero | Two-column (text + 180×180 circular photo), thesis eyebrow, H1, blurb, lede, CTA row, terminal card |
| — | Status band | Full-bleed lime band, 4-metric grid |
| `journey` | Journey | Merged timeline: education → Software Analyst → Senior Software Engineer (current) |
| `projects` | Projects | Index-numbered rows, status pill, stack tags |
| `skills` | Skills | Grouped chips, lead vs. quiet per group |
| `now` | Now | 3-row log list |
| `contact` | Contact (footer) | Headline, email, résumé, LinkedIn/GitHub |
| — | Scroll-to-top + progress bar | Global, fixed |

Section markers use the handoff's `// 0N_slug` inline style (mono, accent-text, followed by a hairline rule) rather than a shared heading component, since each label is section-specific copy, not a repeated pattern worth abstracting.

## Content layer

`content.ts` is restructured, not rewritten — `experience`, `projects`, `skills`, `about` keep their existing shape and are reused by the new components.

```ts
// NEW
export type EducationEntry = { institution: string; field: string; cgpa: string; note: string }
export const education: EducationEntry = { ... }        // pulled from the existing `about` copy

export type NowEntry = { tag: string; text: string }
export const now: NowEntry[] = [ ... ]                    // 3 entries, from the handoff

// NEW — derived, not hand-maintained
export type JourneyEntry =
  | { kind: 'education'; title: string; subtitle: string; dateLabel: string; note: string }
  | { kind: 'work'; title: string; subtitle: string; dateLabel: string; bullets: string[]; current: boolean }
export const journey: JourneyEntry[] = [
  { kind: 'education', ...education-derived fields... },
  ...experience.slice().reverse().map(toJourneyEntry), // oldest role first, current last
]

// EDITED
site.nav = [
  { method: 'GET', label: 'Journey', href: '#journey' },
  { method: 'GET', label: 'Projects', href: '#projects' },
  { method: 'GET', label: 'Skills', href: '#skills' },
  { method: 'GET', label: 'Now', href: '#now' },
  { method: 'POST', label: 'Contact', href: '#contact' },
]
site.linkedin = 'https://www.linkedin.com/in/shane-rex-sasikumar'  // promoted out of `links[]`
site.github = 'https://github.com/Shanerex'                        // promoted out of `links[]`
site.resumeHref = '/resume.pdf'
```

`site.metrics`, `about` (still used as the journey education note) are unchanged in shape. `experience`'s `current` flag is derived at the `journey`-building step from array position (last entry), not stored redundantly on `ExperienceEntry`.

## Interactions & state

- **Theme**: `theme: 'dark' | 'light'`, `localStorage['srs-theme']`, applied pre-paint via the existing inline `<head>` script (updated to use `dark`/`light` directly — the `night`/`day` migration shim is removed, since there are no `night`/`day` values left to migrate from once this ships).
- **Scroll reveal**: reuse `ScrollEffects.tsx`'s existing `IntersectionObserver` (`rootMargin: 0px 0px -8% 0px`, `threshold: [0, 0.05]`) and 2s failsafe — already matches the handoff's spec exactly. `.wipe` targets are dropped (the new design has no clip-path wipes); every revealing element uses `.reveal` (fade + translateY).
- **Scroll-spy**: reuse the existing nav-highlighting logic; update to the 5 new section ids (`journey`, `projects`, `skills`, `now`, `contact`).
- **Scroll progress bar**: new — single passive scroll listener computes `scrollTop / (scrollHeight - clientHeight) * 100`, sets a fixed top bar's width. Folded into the same listener `ScrollEffects.tsx` already owns for bottom-fallback detection, rather than adding a second listener.
- **Scroll-to-top button**: new — same listener toggles visibility past 480px scrolled; click calls `window.scrollTo({ top: 0, behavior: 'smooth' })`.
- **Reduced motion**: `prefers-reduced-motion: reduce` disables `.reveal` transitions and `html { scroll-behavior: smooth }`, same as today.

## Failure modes

Carried forward, all still required:

- **Observer never fires** — 2s failsafe reveals everything unconditionally (existing behaviour, unchanged).
- **JavaScript disabled** — `<noscript>` block forces `.reveal { opacity: 1; transform: none; }`.
- **Theme flash** — inline pre-paint script applies stored theme before first paint.

## Responsive behaviour

| Breakpoint | Header | Hero | Status band | Skills grid |
|---|---|---|---|---|
| ≥1024px | Nav inline, single row | Two columns (text + photo) | 4-column grid | `auto-fit, minmax(260px,1fr)` |
| 768–1023px | Nav wraps to second row (`flex-wrap`) | Stacks (`wrap-reverse` — photo above text) | 2-column grid | 2-column |
| <768px | Nav wraps, résumé pill stays reachable | Stacked, photo shrinks | Single column | Single column |

All interactive targets ≥44px in at least one dimension. Header nav uses `flex-wrap: wrap; justify-content: flex-end` exactly as the handoff specifies — no separate mobile nav treatment is needed since it degrades gracefully by wrapping.

## Architecture

```
app/
├── layout.tsx          # fonts (Bricolage Grotesque, IBM Plex Sans, JetBrains Mono), pre-paint theme script
├── page.tsx            # composes new section list
└── globals.css         # rewritten tokens, base styles, reveal (wipe removed)
components/
├── Header.tsx           # NEW — replaces Rail; sticky, wordmark, REST nav, ThemeToggle, résumé pill
├── Hero.tsx              # REWORKED — two-column, photo, terminal card
├── StatusBand.tsx        # NEW — replaces ImpactBand
├── Journey.tsx            # NEW — replaces Experience + the education portion of About
├── Projects.tsx           # REWORKED — index rows, no alternating placement
├── ProjectRow.tsx         # NEW — extracted per the handoff's own component split
├── Skills.tsx             # RESTYLED — same lead/quiet chip logic, new visual treatment
├── Now.tsx                # NEW
├── Contact.tsx             # REWORKED — footer with headline + 3 CTAs
├── ScrollTopButton.tsx      # NEW
├── ThemeToggle.tsx          # REWORKED — icon-only circular lightbulb button, dark/light labels
└── ScrollEffects.tsx        # EXTENDED — adds progress bar + scroll-to-top visibility state
content.ts               # + education, + now, + journey (derived), + site.linkedin/github/resumeHref
design/tokens.css        # rewritten to mirror globals.css
public/
├── headshot.jpg          # NEW — user photo, square-cropped
└── resume.pdf            # NEW — user résumé
```

Removed entirely: `components/CourtLines.tsx` (+ `.module.css`), `components/Rail.tsx` (+ `.module.css`), `components/ImpactBand.tsx` (+ `.module.css`), `components/Intro.tsx` (+ `.module.css`), `components/SectionLabel.tsx` (+ `.module.css`), `components/About.tsx` (+ `.module.css` — its content folds into `Journey`'s education entry), the `court`/`bleed`/`singles`/`deuce`/`ad` grid classes and the `.wipe` reveal variant in `globals.css`, the tennis palette and `--rail-w`/court-grid tokens.

Every component is a server component except `ThemeToggle` and `ScrollEffects`, matching the current split.

## Testing

The existing 60 Playwright tests are updated for the new structure, not dropped wholesale — assertions keep deriving from `content.ts` rather than hardcoded strings, and the contrast-verification pattern (`tests/helpers/contrast.ts`) carries over unchanged.

| Spec | Change |
|---|---|
| `smoke` | Unchanged |
| `sections` | Updated for the new section list (journey/projects/skills/now/contact ids) |
| `rail` → `header` | Renamed; asserts header contents, sticky behaviour, nav wrap on narrow widths |
| `hero` | Updated for two-column layout, photo, terminal card |
| `impact` → `status-band` | Renamed; asserts the 4-metric grid on the lime band |
| `theme` | Updated for `dark`/`light` values (drops the `night`/`day` migration test — no legacy value exists to migrate) |
| `tokens` | Asserts the new palette's documented hex values resolve per theme, and the AA contrast table above |
| `reveal` | Retained; `.wipe`-specific assertions removed since `.wipe` no longer exists |
| `a11y` | axe against both themes, zero violations — unchanged approach |
| `responsive` | Updated for the breakpoints above (no more rail-becomes-bottom-bar case) |

New coverage:

- Scroll-progress bar width tracks `scrollTop` proportionally.
- Scroll-to-top button is hidden below 480px scrolled, visible above, and returns to top on click.
- `--ink-mute` contrast is documented as sub-AA and a test asserts it is never applied to a body-copy element (only meta/mono contexts).

## Out of scope

- OG / link-preview image
- Blog, case-study pages, CMS, analytics
- Any second page — the site remains one page
- A runtime accent-lead (lime/coral) toggle — fixed to lime per the "Decisions" table above
