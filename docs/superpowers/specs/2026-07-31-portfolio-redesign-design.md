# Portfolio Redesign — Night Match

## Overview

The current site is a faithful build of a handoff that specified "no imagery, no accent colour — hierarchy comes from type scale and hairline dividers." It succeeds at being a CV. It fails at being a portfolio: it makes no impression, and it says nothing about who Shane is.

This redesign replaces the visual system entirely. The content layer, framework, build target and testing approach carry over.

**Direction:** tennis owns space and colour; cinema owns time and pacing. That division is the rule that keeps two metaphors from fighting — every static decision derives from the court, every temporal decision from film.

**Literalness:** abstracted. The court is present as proportion, colour and light. There is no tennis vocabulary, no iconography, no match-play language anywhere in the interface. A reader who plays tennis feels it; a reader who does not sees a confident, unusual layout. This constraint is absolute — it is what keeps the site from reading as a novelty.

**Consequence accepted:** with imagery abstracted away, the personal thread survives in copy and pacing alone. The hero line carries it. This is a deliberate trade, chosen over a more explicit treatment.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Visual source | Tennis, abstracted to geometry and light | Already load-bearing in Shane's own copy — the lede uses it to explain handling production outages |
| Motion language | Cinematic — cuts, holds, wipes | Decisive motion reads as designed; slow floaty fades read as templated |
| Themes | Night match (default) and day match | Two real playing conditions, not an inverted palette. The toggle becomes part of the concept |
| Layout | Asymmetric grid on court proportions | The grid must position content, not decorate it — otherwise the abstraction has nothing to stand on |
| Persistent chrome | Fixed rail: name, nav ticks, email | Contact is never off screen; nav ticks give scroll position |
| Section order | Experience before Projects | Evidence is lopsided: 300K req/day sits in Experience, while two of three projects are in progress and one runs on static sample data |
| Hero height | Full viewport (100dvh) | Impact band sits immediately below, so the first scroll lands on metrics |
| Imagery | None — CSS and inline SVG only | `public/` is empty and no assets exist. Floodlight, court lines and grid are all drawn |
| Accent behaviour | Optic yellow as text on night, as fill on day | `#DCF24B` fails contrast on the day surround; a darkened ink variant carries accented type |
| Dependencies | None added | Static export must stay trivial to deploy |
| Framework / output | Unchanged — Next.js App Router, `output: 'export'` | Nothing about the redesign requires a data layer |

## Design tokens

All tokens live in `app/globals.css` as the runtime source of truth. `design/tokens.css` is updated to match, since the original handoff no longer describes the site.

### Colour — night match (default)

| Token | Value | Use |
|---|---|---|
| `--surround` | `#060A11` | Page background — night beyond the lights |
| `--court` | `#0F3A63` | Full-bleed bands (carries text) |
| `--court-tint` | `#0A2440` | Decorative washes only — never behind text |
| `--line` | `#EEF3F8` | Primary text, court lines |
| `--line-2` | `#9DB0C6` | Body copy, secondary text |
| `--meta` | `#6E839B` | Mono meta, dates, tertiary |
| `--ball` | `#DCF24B` | Accent — section labels, active tick, metric figures, rules |
| `--ball-ink` | `#DCF24B` | Accent as text (identical on night) |
| `--on-court` | `#EEF3F8` | Text sitting on `--court` |
| `--flood` | `rgba(255,247,225,.16)` | Floodlight bloom |
| `--rule` | `rgba(238,243,248,.16)` | Court lines, dividers |
| `--rule-strong` | `rgba(238,243,248,.30)` | Centre line, baseline |

### Colour — day match

| Token | Value | Use |
|---|---|---|
| `--surround` | `#EAEDF1` | Cool concrete, deliberately not cream |
| `--court` | `#1F5A93` | Full-bleed bands (dark enough to carry white text) |
| `--court-tint` | `#3E7CB8` | Decorative washes only — never behind text |
| `--line` | `#0C1A2A` | Primary text |
| `--line-2` | `#3C4E63` | Body copy |
| `--meta` | `#56677D` | Mono meta, tertiary |
| `--ball` | `#DCF24B` | Accent as **fill** only — behind dark text, as rules and dots |
| `--ball-ink` | `#55670A` | Accent as **text** |
| `--on-court` | `#F7F9FB` | Text sitting on `--court` |
| `--flood` | `rgba(255,250,235,.70)` | Sun wash |
| `--rule` | `rgba(12,26,42,.14)` | Court lines, dividers |
| `--rule-strong` | `rgba(12,26,42,.28)` | Centre line, baseline |

### Contrast — verified WCAG AA

| Pair | Ratio | Requirement |
|---|---|---|
| Night `--line-2` on `--surround` | 9.5:1 | AA normal text |
| Night `--meta` on `--surround` | 5.5:1 | AA normal text |
| Night `--ball` on `--surround` | 16.8:1 | AA normal text |
| Night `--ball` on `--court` | 9.4:1 | AA normal text |
| Night `--on-court` on `--court` | 10.5:1 | AA normal text |
| Day `--line-2` on `--surround` | 7.3:1 | AA normal text |
| Day `--meta` on `--surround` | 4.9:1 | AA normal text |
| Day `--ball-ink` on `--surround` | 5.3:1 | AA normal text |
| Day `--on-court` on `--court` | 6.4:1 | AA normal text |

`--ball` (`#DCF24B`) on the day surround is ~1.6:1 and must never carry text in day match. `--court-tint` is ~4.0:1 against both white and `--line` and must never carry text in either theme. These two rules are the reason the day palette has separate `--ball-ink` and `--court-tint` tokens.

### Typography

Three families, all self-hosted via `next/font/google`:

- **Archivo** (variable, width + weight axes) — display
- **IBM Plex Sans** — body
- **IBM Plex Mono** — labels, meta, metrics

Archivo carries over from the current site but is used at a width and weight it has never been used at here. The variable width axis is what makes it read athletic rather than corporate.

| Token | Value | Use |
|---|---|---|
| `--t-hero` | `clamp(44px, 9vw, 132px)` / lh `.92` / ls `-.04em` / wdth 112 / wght 800 / uppercase | Hero thesis |
| `--t-display` | `clamp(28px, 4vw, 46px)` / lh `1.05` / ls `-.025em` / wght 700 | Contact email, section openers |
| `--t-metric` | `clamp(22px, 3.2vw, 38px)` / mono 500 / tabular-nums | Impact band figures |
| `--t-h3` | `20px` / lh `1.3` / wght 700 | Experience entry titles, skill lead line |
| `--t-h4` | `17px` / lh `1.3` / wght 700 | Project names |
| `--t-lede` | `clamp(19px, 2.2vw, 24px)` / lh `1.6` | Intro paragraph |
| `--t-body` | `16px` / lh `1.7` | Bullets, prose |
| `--t-sm` | `14.5px` / lh `1.6` | Project descriptions, company |
| `--t-label` | `12px` / ls `.2em` / uppercase / mono | Section labels |
| `--t-meta` | `12.5px` / mono | Dates, location, stack tags |

### Spacing

An 8-based scale: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 176` exposed as `--s-1` through `--s-11`.

### Motion

| Token | Value |
|---|---|
| `--ease-cut` | `cubic-bezier(.2, .9, .25, 1)` |
| `--ease-wipe` | `cubic-bezier(.65, 0, .35, 1)` |
| `--dur-cut` | `380ms` |
| `--dur-wipe` | `700ms` |
| `--dur-hover` | `250ms` |
| `--dur-theme` | `450ms` |

## Layout system

### The court grid

A doubles court is 36ft wide, with lines at 0, 4.5, 18, 31.5 and 36 feet — that is 0%, 12.5%, 50%, 87.5%, 100%. Expressed as CSS:

```css
grid-template-columns: 1fr 3fr 3fr 1fr;
column-gap: clamp(16px, 2.5vw, 32px);
```

Four placements, and only these four:

| Placement | Grid column | Use |
|---|---|---|
| Full bleed | `1 / -1` | Impact band, contact close, section rules |
| Singles | `2 / 4` | Main reading column — prose, bullets |
| Deuce court | `1 / 3` | Left-weighted blocks |
| Ad court | `3 / -1` | Right-weighted blocks |

Asymmetry comes from alternating placements down the page, not from arbitrary offsets. Projects alternate deuce / ad so the eye crosses the court.

Container: `max-width: 1280px`, gutter `clamp(20px, 4vw, 56px)`.

### Court lines

Five vertical hairlines at 0%, 12.5%, 50%, 87.5%, 100% of the grid, fixed to the viewport behind all content, drawn in `--rule` with the centre line in `--rule-strong`. Rendered by a single `CourtLines` component using CSS gradients — no SVG, no DOM per line.

### The rail

Fixed, persistent, holding: name mark, four nav ticks (Experience, Projects, Skills, About), email link, theme toggle.

- **≥1024px:** fixed left column, width `clamp(112px, 10vw, 168px)`. `body` receives matching `padding-left` so the court grid never runs under it. The rail reads as part of the frame — a letterbox edge, which suits the cinematic register.
- **<1024px:** becomes a fixed bottom bar, height 56px, carrying the email link and theme toggle only. Nav ticks are dropped — with seven sections in one page, scrolling is sufficient. `body` receives matching `padding-bottom`.

Nav ticks are 1px rules that widen and shift to `--ball` when their section is active.

## Page structure

| # | Section | Placement | Notes |
|---|---|---|---|
| 00 | Hero | Full bleed, `100dvh` | Floodlight bloom, court lines, thesis line at `--t-hero`. Name, role, scroll cue. Nothing else |
| 01 | Impact band | Full bleed | Four metrics on `--court`. Wipes in horizontally |
| 02 | Intro | Singles | Existing lede, minus the tennis sentence (promoted to hero) |
| 03 | Experience | Singles, with dates in the left alley | Two roles, bullets, metrics accented in `--ball-ink` |
| 04 | Projects | Alternating deuce / ad | Status dot retained; stack tags in mono |
| 05 | Skills | Singles | Retains the lead-line treatment: `lead` count per group, display face for leads, mono run for the rest |
| 06 | About | Deuce, with a full-bleed rule above | Tennis, film, Bengaluru — the hero quote finally gets explained |
| 07 | Contact | Full bleed | Email at `--t-display`. Last thing on screen is the action wanted |

Section labels sit in `--ball-ink`, mono, `--t-label`.

## Content layer

`content.ts` remains the single file Shane edits. Changes:

```ts
site.thesis: string     // NEW — 'No dwelling on the last point.'
site.lede: string       // EDITED — tennis sentence removed, now in thesis
site.metrics: Metric[]  // NEW — { figure: string; label: string }
```

`Metric` seeds with four entries, chosen because each is a verifiable claim already made in an experience bullet:

| Figure | Label | Source bullet |
|---|---|---|
| `300K+` | requests a day | Pub/Sub pipeline |
| `99.99%` | delivery reliability | Pub/Sub pipeline |
| `3M+` | records migrated live | Credit management system |
| `6s → 1s` | API response time | Order history / BigQuery replacement |

`experience`, `projects`, `about` and `skills` are unchanged in shape. `site.nav` keeps its four entries.

## Motion

### Load sequence — once, hero only

| At | What | Duration |
|---|---|---|
| 0ms | Floodlight bloom, opacity 0 → 1 | 700ms |
| 150ms | Court lines, `scaleY(0) → 1` from top, 60ms stagger across five | 600ms |
| 450ms | Hero lines, `translateY(14px)` + opacity, 80ms stagger | 500ms |
| 900ms | Optic-yellow rule, `scaleX(0) → 1` | 400ms |
| 1150ms | Role line and scroll cue, opacity | 400ms |

Total ≈ 1.55s. Implemented as pure CSS `animation-delay` so `Hero` stays a server component and ships no JavaScript.

### Scroll

- **Cuts** — `.reveal` elements: opacity 0 → 1 with `translateY(10px)` over `--dur-cut` on `--ease-cut`. Sibling stagger 50ms, capped at 3 steps. Decisive, not floaty.
- **Band wipe** — impact band and contact close: `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` over `--dur-wipe` on `--ease-wipe`, on enter.
- **Scroll-spy** — nav ticks track the section in view, toggling classes and `aria-current` on DOM nodes directly, so the rail stays a server component.

### Interaction

- Project rows shift 6px toward the centre line on hover, and their edge rule brightens to `--ball`, over `--dur-hover`.
- Theme toggle crossfades background, text and court fills over `--dur-theme`.

### Reduced motion

`prefers-reduced-motion: reduce` disables every animation and transition above. The hero renders in its final state, bands render un-wiped, reveals render visible. This is a correctness requirement, not a nicety — reveals start at `opacity: 0`.

## Failure modes

Carried forward from the current implementation, all still required:

- **Observer never fires** — a 2s timer reveals everything unconditionally and cancels itself once the observer has done its work.
- **JavaScript disabled** — a `<noscript>` block forces `.reveal { opacity: 1; transform: none; }` and un-wipes bands. The 2s failsafe is itself JavaScript and does not cover this.
- **Theme flash** — an inline script in `<head>` applies the stored theme before first paint, reading `localStorage` key `srs-theme`, falling back to `prefers-color-scheme`.

## Responsive behaviour

| Breakpoint | Grid | Rail | Hero |
|---|---|---|---|
| ≥1024px | `1fr 3fr 3fr 1fr`, all four placements | Fixed left column | `100dvh` |
| 768–1023px | `1fr 3fr 3fr 1fr`, deuce and ad both become singles | Fixed bottom bar | `100dvh` |
| <768px | Single column, full-bleed retained for bands | Fixed bottom bar | `min(100dvh, 640px)` |

Court lines reduce from five to three below 768px (0%, 50%, 100%) to avoid visual noise at narrow widths. Impact band stacks to a 2×2 figure grid below 768px. All interactive targets stay ≥44px.

## Architecture

```
app/
├── layout.tsx          # fonts, metadata, pre-paint theme script
├── page.tsx            # composes sections
└── globals.css         # tokens, court grid, base, reveal
components/
├── CourtLines.tsx      # NEW — fixed background lines + floodlight
├── Rail.tsx            # NEW — replaces Sidebar; name, ticks, email, toggle
├── Hero.tsx            # NEW — thesis, CSS-only load sequence
├── ImpactBand.tsx      # NEW — four metrics, wipe on enter
├── Intro.tsx           # NEW — lede
├── Experience.tsx      # reworked
├── Projects.tsx        # reworked — alternating placement
├── Skills.tsx          # restyled — lead-line treatment retained
├── About.tsx           # reworked
├── Contact.tsx         # NEW — full-bleed close
├── SectionLabel.tsx    # restyled
├── ThemeToggle.tsx     # reworked — labels become Day match / Night match
└── ScrollEffects.tsx   # extended — reveal, scroll-spy, band wipe
content.ts              # + thesis, + metrics, − tennis sentence from lede
design/tokens.css       # rewritten to match globals.css
```

Removed: `components/Sidebar.tsx`, `components/Sidebar.module.css`, `app/page.module.css` (unused Next.js scaffold left over from `create-next-app`).

Every component is a server component except `ThemeToggle` and `ScrollEffects`.

## Testing

The existing 44 Playwright tests are updated, not dropped. Content assertions continue to derive from `content.ts` rather than hardcoding strings.

| Spec | Change |
|---|---|
| `smoke` | Unchanged |
| `sections` | Updated for new structure; adds hero thesis, impact band metrics, contact |
| `sidebar` → `rail` | Renamed; asserts rail contents, and bottom-bar swap below 1024px |
| `theme` | Updated toggle labels; existing persistence and pre-paint tests retained |
| `tokens` | Asserts the documented hex values resolve per theme, and the `1fr 3fr 3fr 1fr` grid |
| `reveal` | Retained, plus band-wipe coverage and both failsafes |
| `a11y` | axe against both themes, zero violations |
| `responsive` | Updated for the three breakpoints above |

New coverage:

- Every colour pair in the contrast table is asserted programmatically, so a future palette edit that breaks AA fails the build rather than shipping.
- `prefers-reduced-motion: reduce` renders the page fully visible — every `.reveal` at `opacity: 1`, bands un-wiped.

## Out of scope

- CV PDF for `public/` — still does not exist
- OG / link preview image
- Blog, case-study pages, CMS, analytics
- Any second page — the site remains one page
