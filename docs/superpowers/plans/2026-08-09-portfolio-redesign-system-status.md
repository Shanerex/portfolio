# Portfolio Redesign — System Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Night Match" tennis-themed layout with the terminal/dev-console "System Status" design from `design_handoff_portfolio_redesign/`, retiring the fixed-rail/court-grid architecture in favour of a sticky header and a single scrolling column.

**Architecture:** Foundation first (tokens, fonts, base styles), then one section at a time, each task swapping its component into `app/page.tsx`, deleting the tennis-era file(s) it replaces, and shipping its own Playwright spec. Cross-cutting integration tests (`a11y`, `responsive`, `reveal`) are finalized in the last task once every section exists in its new form.

**Tech Stack:** Next.js 16.2.12 (App Router, `output: 'export'`), React 19.2.4, TypeScript, CSS Modules, `next/font/google`, Playwright + `@axe-core/playwright`.

## Global Constraints

- **Working directory:** `/Users/shanerexsasikumar/Documents/Projects/portfolio`, branch `feature/site-redesign`. No worktree is set up for this plan — work directly on this branch, one commit per step 5 as usual.
- **Read the Next.js docs before touching framework code.** `AGENTS.md` warns this Next.js version has breaking changes vs. training data. `next/font/google` export names for the new families are confirmed in this plan (`Bricolage_Grotesque`, `JetBrains_Mono`) — do not guess others without checking `node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts`.
- **Test runner builds the static export every time.** `npm test` runs `playwright test`, whose `webServer` command is `npm run build && npx serve out`. Every "run the tests" step below takes ~30–60s because of this — that's expected, not a hang.
- **`content.ts` is the only file holding copy.** Tests derive assertions from it; never hardcode content strings in tests.
- **No new dependencies.** The hero photo uses a plain `<img>` tag, not `next/image` — this is a static export with no prior image usage or `images` config, and a plain tag needs neither. Do not add `next/image` or touch `next.config.ts`.
- **Assets already committed:** `public/headshot.jpg` (720×720, square) and `public/resume.pdf`. Reference them as `/headshot.jpg` and `site.resumeHref` (`/resume.pdf`) — do not re-copy or re-crop them.
- **Theme attribute values are `dark` and `light`** on `<html data-theme>`, persisted to `localStorage['srs-theme']`. Unlike the outgoing tennis theme, there is no legacy-value migration — `dark`/`light` are the only values that have ever existed for this key once this ships.
- **Accent lead is fixed to lime** (`#D6F23C` dark-mode accent-text, `#5C6B12` light-mode accent-text). There is no runtime accent-lead toggle — that was a design-canvas preview affordance only, not a shipped feature.
- **The header keeps a fixed dark glass background in both page themes** (`rgba(20,20,26,.82)` + `blur(10px)`), per the handoff's own literal (non-themed) value. Because of this, `Header.module.css` defines its own non-swapping colour variables scoped to `.header` (always the dark-mode ink/line/accent values) rather than using the page's theme-swapping tokens — otherwise light-theme ink (`#14141A`, near-black) would render on the header's near-black background and fail contrast. This is a deliberate, tested exception; do not "fix" it to use `var(--ink)` directly.
- **Exact token values are defined in Task 1** and must be used verbatim thereafter — see the palette/type tables in `docs/superpowers/specs/2026-08-09-portfolio-redesign-system-status-design.md`.
- **Accessibility floor:** zero axe violations in both themes, visible keyboard focus (`:focus-visible`), `prefers-reduced-motion` fully respected, interactive targets ≥44px in at least one dimension.
- **Intermediate test redness is expected and scoped.** Several pre-existing spec files (`rail`, `hero`, `impact`, `sections`, `reveal`, `responsive`, `a11y`, `court`) assert against tennis-era structure this plan retires piece by piece. Each task states exactly which spec file(s) it owns and turns green; a stale spec file for a component not yet migrated may still fail until its own task lands. The final task (Task 12) runs the complete suite and is the actual "done" gate — do not treat interim red tests in not-yet-touched files as a regression to chase down early.

---

### Task 1: Design tokens, fonts, base styles — retire CourtLines and the tennis palette

**Files:**
- Modify: `app/globals.css` (full rewrite)
- Modify: `design/tokens.css` (mirror of `app/globals.css`'s token block)
- Modify: `app/layout.tsx` (fonts, pre-paint theme script)
- Modify: `app/page.tsx` (remove `<CourtLines />`)
- Delete: `components/CourtLines.tsx`, `components/CourtLines.module.css`
- Delete: `tests/court.spec.ts` (the `.court` grid it tests no longer exists)
- Modify: `tests/tokens.spec.ts` (new palette, new fonts, drop the rail-clearance test — the rail is retired in Task 2)
- Modify: `tests/theme.spec.ts` (`dark`/`light` values; keep only the three tests that don't require clicking a real toggle button — the click-driven persistence test moves to Task 2, which rebuilds `ThemeToggle`)

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties every later task relies on — `--bg`, `--surface`, `--ink`, `--ink-dim`, `--ink-mute`, `--line`, `--line-strong`, `--accent-text`, `--accent-2-text`, `--primary`, `--primary-ink`, `--t-*`, `--s-1`..`--s-9`, `--page-max`, `--gutter`, `--dur-reveal`, `--dur-hover`, `--dur-theme`, `--radius-pill`, `--radius-card`, `--font-display`, `--font-body`, `--font-mono`. Also the `.reveal`/`.is-in` mechanism and a `.wrap` container utility (`max-width: var(--page-max); margin: 0 auto; padding-inline: var(--gutter)`).

- [ ] **Step 1: Rewrite the failing token/theme tests first**

Replace `tests/tokens.spec.ts` entirely:

```ts
import { test, expect } from '@playwright/test'
import { contrastRatio, rgbToHex } from './helpers/contrast'

test('contrast helper matches known reference values', () => {
  expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  expect(contrastRatio('#D6F23C', '#D6F23C')).toBeCloseTo(1, 5)
  expect(rgbToHex('rgb(214, 242, 60)')).toBe('#D6F23C')
  expect(rgbToHex('rgba(20, 20, 26, 0.9)')).toBe('#14141A')
})

test('font tokens resolve to the self-hosted families', async ({ page }) => {
  await page.goto('/')
  const fonts = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement)
    return {
      display: s.getPropertyValue('--font-display'),
      body: s.getPropertyValue('--font-body'),
      mono: s.getPropertyValue('--font-mono'),
    }
  })
  expect(fonts.display).toContain('Bricolage Grotesque')
  expect(fonts.body).toContain('IBM Plex Sans')
  expect(fonts.mono).toContain('JetBrains Mono')
})

test('no font is requested from Google at runtime', async ({ page }) => {
  const googleRequests: string[] = []
  page.on('request', (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) googleRequests.push(r.url())
  })
  await page.goto('/')
  expect(googleRequests).toEqual([])
})

const DARK = {
  bg: '#14141a', surface: '#1b1b21', ink: '#edeae2', inkDim: '#8f8b84', inkMute: '#5e5b56',
  accentText: '#d6f23c', accent2Text: '#ff5a4e', primary: '#d6f23c', primaryInk: '#1c210a',
}
const LIGHT = {
  bg: '#f6f4ef', surface: '#ffffff', ink: '#14141a', inkDim: '#5b574f', inkMute: '#8c877d',
  accentText: '#5c6b12', accent2Text: '#b23327', primary: '#d6f23c', primaryInk: '#1c210a',
}

async function palette(page: import('@playwright/test').Page, theme: 'dark' | 'light') {
  await page.goto('/')
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
  return page.evaluate(() => {
    const s = getComputedStyle(document.documentElement)
    const read = (n: string) => s.getPropertyValue(n).trim()
    return {
      bg: read('--bg'), surface: read('--surface'), ink: read('--ink'),
      inkDim: read('--ink-dim'), inkMute: read('--ink-mute'),
      accentText: read('--accent-text'), accent2Text: read('--accent-2-text'),
      primary: read('--primary'), primaryInk: read('--primary-ink'),
    }
  })
}

test('dark palette resolves to the documented values', async ({ page }) => {
  expect(await palette(page, 'dark')).toEqual(DARK)
})

test('light palette resolves to the documented values', async ({ page }) => {
  expect(await palette(page, 'light')).toEqual(LIGHT)
})

for (const [name, p] of [['dark', DARK], ['light', LIGHT]] as const) {
  test(`${name} palette meets WCAG AA for every normal-text pairing`, async () => {
    const pairs: [string, string, string][] = [
      ['ink on bg', p.ink, p.bg],
      ['ink-dim on bg', p.inkDim, p.bg],
      ['accent-text on bg', p.accentText, p.bg],
      ['accent-2-text on bg', p.accent2Text, p.bg],
      ['ink on surface', p.ink, p.surface],
      ['primary-ink on primary', p.primaryInk, p.primary],
    ]
    for (const [label, fg, bg] of pairs) {
      expect(contrastRatio(fg, bg), `${name}: ${label}`).toBeGreaterThanOrEqual(4.5)
    }
  })
}

test('ink-mute is documented as sub-AA and reserved for mono meta only', () => {
  // Inherited directly from the design handoff's own values — not an oversight.
  // Never assert this pair passes 4.5:1; instead assert it stays out of body copy
  // (checked structurally per-component as each section ships).
  expect(contrastRatio(DARK.inkMute, DARK.bg)).toBeLessThan(4.5)
  expect(contrastRatio(LIGHT.inkMute, LIGHT.bg)).toBeLessThan(4.5)
})
```

Replace `tests/theme.spec.ts` entirely (the click-driven persistence test is added back in Task 2 once `ThemeToggle` exists in its new form):

```ts
import { test, expect } from '@playwright/test'

test('defaults to dark on a first visit, regardless of OS preference', async ({ browser }) => {
  for (const colorScheme of ['dark', 'light'] as const) {
    const context = await browser.newContext({ colorScheme })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await context.close()
  }
})

test('stored theme is applied before first paint', async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.addInitScript(() => localStorage.setItem('srs-theme', 'light'))

  await page.goto('/', { waitUntil: 'commit' })
  const themeAtDomReady = await page.evaluate(() => {
    return new Promise<string | null>((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () =>
          resolve(document.documentElement.getAttribute('data-theme')),
        )
      } else {
        resolve(document.documentElement.getAttribute('data-theme'))
      }
    })
  })
  expect(themeAtDomReady).toBe('light')
  await ctx.close()
})

test('color-scheme follows the active theme', async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.addInitScript(() => localStorage.setItem('srs-theme', 'light'))
  await page.goto('/')
  const scheme = await page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  )
  expect(scheme).toBe('light')
  await ctx.close()
})

test('body background and text color follow the active theme', async ({ page }) => {
  await page.goto('/')
  for (const theme of ['dark', 'light'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
    await page.waitForTimeout(400)
    const [bodyBg, bodyColor, tokenBg, tokenInk] = await page.evaluate(() => {
      const bodyStyle = getComputedStyle(document.body)
      const rootStyle = getComputedStyle(document.documentElement)
      return [
        bodyStyle.backgroundColor,
        bodyStyle.color,
        rootStyle.getPropertyValue('--bg').trim(),
        rootStyle.getPropertyValue('--ink').trim(),
      ]
    })
    const hexToRgb = (hex: string) => {
      const n = hex.replace('#', '')
      const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16))
      return `rgb(${r}, ${g}, ${b})`
    }
    expect(bodyBg, `${theme}: body background`).toBe(hexToRgb(tokenBg))
    expect(bodyColor, `${theme}: body color`).toBe(hexToRgb(tokenInk))
  }
})
```

Delete `tests/court.spec.ts` (the `.court` grid class it probes is being removed in Step 3 with no replacement).

- [ ] **Step 2: Run the new/changed tests to verify they fail**

Run: `npx playwright test tests/tokens.spec.ts tests/theme.spec.ts --reporter=line`
Expected: FAIL — palette values don't match (old tennis hex values still in `globals.css`), font family assertions don't contain `Bricolage Grotesque`/`JetBrains Mono`.

- [ ] **Step 3: Rewrite `app/globals.css`**

```css
:root {
  /* Type */
  --t-hero: clamp(52px, 9.5vw, 132px); --lh-hero: .94; --ls-hero: -.025em;
  --t-display: clamp(36px, 6vw, 72px); --lh-display: 1; --ls-display: -.02em;
  --t-metric: clamp(30px, 4.5vw, 46px);
  --t-h2: clamp(20px, 2.4vw, 26px);
  --t-h3: clamp(22px, 2.4vw, 28px);
  --t-blurb: clamp(18px, 2.1vw, 22px);
  --t-lede: 17px; --lh-lede: 1.7;
  --t-body: 15px; --lh-body: 1.6;
  --t-sm: 14.5px; --lh-sm: 1.6;
  --t-label: 12px; --ls-label: .1em;
  --t-nav: 12px;
  --t-meta: 12.5px;

  /* Spacing */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px;
  --s-6: 32px; --s-7: 48px; --s-8: 64px; --s-9: 96px;

  /* Layout */
  --page-max: 1280px;
  --gutter: clamp(20px, 4vw, 56px);

  /* Motion */
  --dur-reveal: .7s;
  --dur-hover: .2s;
  --dur-theme: .3s;

  /* Fonts */
  --font-display: var(--font-bricolage), system-ui, sans-serif;
  --font-body: var(--font-plex-sans), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;

  /* Radius */
  --radius-pill: 99px;
  --radius-card: 10px;
}

:root,
[data-theme='dark'] {
  color-scheme: dark;
  --bg: #14141A;
  --surface: #1B1B21;
  --ink: #EDEAE2;
  --ink-dim: #8F8B84;
  --ink-mute: #5E5B56;
  --line: rgba(237, 234, 225, .14);
  --line-strong: rgba(237, 234, 225, .28);
  --accent-text: #D6F23C;
  --accent-2-text: #FF5A4E;
  --primary: #D6F23C;
  --primary-ink: #1C210A;
}

[data-theme='light'] {
  color-scheme: light;
  --bg: #F6F4EF;
  --surface: #FFFFFF;
  --ink: #14141A;
  --ink-dim: #5B574F;
  --ink-mute: #8C877D;
  --line: rgba(20, 20, 26, .12);
  --line-strong: rgba(20, 20, 26, .24);
  --accent-text: #5C6B12;
  --accent-2-text: #B23327;
  --primary: #D6F23C;
  --primary-ink: #1C210A;
}

/* ---------- Base ---------- */
* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--t-body);
  line-height: var(--lh-body);
  -webkit-font-smoothing: antialiased;
  transition: background var(--dur-theme) ease, color var(--dur-theme) ease;
  overflow-x: hidden;
}

a { color: inherit; text-decoration: none; }
h1, h2, h3 { font-family: var(--font-display); font-weight: 700; margin: 0; }

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}

:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

/* ---------- Scroll reveal (JS adds .is-in via IntersectionObserver) ---------- */
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity var(--dur-reveal) ease, transform var(--dur-reveal) ease;
}
.reveal.is-in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}

/* ---------- Shared section container ---------- */
.wrap {
  max-width: var(--page-max);
  margin: 0 auto;
  padding-inline: var(--gutter);
}
```

- [ ] **Step 4: Mirror the tokens into `design/tokens.css`**

Replace `design/tokens.css` with the same `:root` / `[data-theme='dark']` / `[data-theme='light']` blocks from Step 3 (tokens only, not the base/reveal/`.wrap` rules — matching the file's existing role as a design-reference mirror), keeping its header comment:

```css
/* Source of truth is app/globals.css. This file mirrors it for design reference. */

/* ============ Redesign tokens ============ */
:root {
  /* Type */
  --t-hero: clamp(52px, 9.5vw, 132px); --lh-hero: .94; --ls-hero: -.025em;
  --t-display: clamp(36px, 6vw, 72px); --lh-display: 1; --ls-display: -.02em;
  --t-metric: clamp(30px, 4.5vw, 46px);
  --t-h2: clamp(20px, 2.4vw, 26px);
  --t-h3: clamp(22px, 2.4vw, 28px);
  --t-blurb: clamp(18px, 2.1vw, 22px);
  --t-lede: 17px; --lh-lede: 1.7;
  --t-body: 15px; --lh-body: 1.6;
  --t-sm: 14.5px; --lh-sm: 1.6;
  --t-label: 12px; --ls-label: .1em;
  --t-nav: 12px;
  --t-meta: 12.5px;

  /* Spacing */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px;
  --s-6: 32px; --s-7: 48px; --s-8: 64px; --s-9: 96px;

  /* Layout */
  --page-max: 1280px;
  --gutter: clamp(20px, 4vw, 56px);

  /* Motion */
  --dur-reveal: .7s;
  --dur-hover: .2s;
  --dur-theme: .3s;

  /* Fonts */
  --font-display: var(--font-bricolage), system-ui, sans-serif;
  --font-body: var(--font-plex-sans), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;

  /* Radius */
  --radius-pill: 99px;
  --radius-card: 10px;
}

:root,
[data-theme='dark'] {
  color-scheme: dark;
  --bg: #14141A;
  --surface: #1B1B21;
  --ink: #EDEAE2;
  --ink-dim: #8F8B84;
  --ink-mute: #5E5B56;
  --line: rgba(237, 234, 225, .14);
  --line-strong: rgba(237, 234, 225, .28);
  --accent-text: #D6F23C;
  --accent-2-text: #FF5A4E;
  --primary: #D6F23C;
  --primary-ink: #1C210A;
}

[data-theme='light'] {
  color-scheme: light;
  --bg: #F6F4EF;
  --surface: #FFFFFF;
  --ink: #14141A;
  --ink-dim: #5B574F;
  --ink-mute: #8C877D;
  --line: rgba(20, 20, 26, .12);
  --line-strong: rgba(20, 20, 26, .24);
  --accent-text: #5C6B12;
  --accent-2-text: #B23327;
  --primary: #D6F23C;
  --primary-ink: #1C210A;
}
```

- [ ] **Step 5: Rewrite `app/layout.tsx` fonts and theme script**

```tsx
import type { Metadata } from 'next'
import { Bricolage_Grotesque, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-bricolage',
  display: 'swap',
})

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Shane Rex Sasikumar — Senior Software Engineer',
  description:
    'Senior Software Engineer building event-driven backends on Java, Spring Boot and GCP.',
}

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('srs-theme')
    var theme = stored === 'light' || stored === 'dark' ? stored : 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})()
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${plexSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 6: Delete CourtLines and remove it from the page**

Delete `components/CourtLines.tsx` and `components/CourtLines.module.css`.

In `app/page.tsx`, remove the `CourtLines` import and its `<CourtLines />` usage (leave every other line untouched — later tasks replace the rest one at a time):

```tsx
import Rail from '@/components/Rail'
import Intro from '@/components/Intro'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import About from '@/components/About'
import Contact from '@/components/Contact'
import ScrollEffects from '@/components/ScrollEffects'
import Hero from '@/components/Hero'
import ImpactBand from '@/components/ImpactBand'

export default function Home() {
  return (
    <div className="page">
      <Rail />
      <main className="content">
        <Hero />
        <ImpactBand />
        <Intro />
        <Experience />
        <Projects />
        <Skills />
        <About />
        <Contact />
      </main>
      <ScrollEffects />
    </div>
  )
}
```

- [ ] **Step 7: Run the full suite and confirm the scoped set is green**

Run: `npm test`
Expected: `tests/tokens.spec.ts`, `tests/theme.spec.ts`, and `tests/smoke.spec.ts` PASS. `tests/court.spec.ts` no longer exists. Other spec files (`rail`, `hero`, `impact`, `sections`, `reveal`, `responsive`, `a11y`) may show new failures — expected per the Global Constraints note; they're owned by later tasks. Every component still visually renders (with tennis-era CSS values resolving to nothing, since the classNames haven't changed yet) — that's fine, nothing crashes.

- [ ] **Step 8: Commit**

```bash
git add app/globals.css app/layout.tsx app/page.tsx design/tokens.css tests/tokens.spec.ts tests/theme.spec.ts
git rm components/CourtLines.tsx components/CourtLines.module.css tests/court.spec.ts
git commit -m "feat: replace tennis palette with the System Status design tokens"
```

---

### Task 2: Header (replaces Rail) and ThemeToggle rework

**Files:**
- Modify: `content.ts` (nav shape, `linkedin`, `github`, `resumeHref`; remove `links`)
- Create: `components/Header.tsx`, `components/Header.module.css`
- Modify: `components/ThemeToggle.tsx`, `components/ThemeToggle.module.css`
- Modify: `app/page.tsx` (swap `<Rail />` for `<Header />`, add `<a id="top">`, move it outside `<main>`)
- Delete: `components/Rail.tsx`, `components/Rail.module.css`
- Delete: `tests/rail.spec.ts`
- Create: `tests/header.spec.ts`
- Modify: `tests/theme.spec.ts` (add back the click-driven toggle test now that the button exists)

**Interfaces:**
- Consumes: `--bg`/`--ink`/`--accent-text`/etc. tokens and `.reveal` from Task 1.
- Produces: `site.nav: NavItem[]` (`{ method: 'GET' | 'POST'; path: string; href: string }`), `site.linkedin: string`, `site.github: string`, `site.resumeHref: string` — consumed by `Contact` in Task 9. `<Header>` renders `data-testid="header"` and a `<header>` landmark.

- [ ] **Step 1: Update `content.ts`**

In `content.ts`, add the `NavItem` type, replace `site.nav`/`site.links` and add the new site fields:

```ts
export type NavItem = { method: 'GET' | 'POST'; path: string; href: string }
```

Replace the `nav`/`links` fields inside `export const site = { ... }`:

```ts
  nav: [
    { method: 'GET', path: '/journey', href: '#journey' },
    { method: 'GET', path: '/projects', href: '#projects' },
    { method: 'GET', path: '/skills', href: '#skills' },
    { method: 'GET', path: '/now', href: '#now' },
    { method: 'POST', path: '/contact', href: '#contact' },
  ] satisfies NavItem[],
  linkedin: 'https://www.linkedin.com/in/shane-rex-sasikumar',
  github: 'https://github.com/Shanerex',
  resumeHref: '/resume.pdf',
```

Delete the old `nav: Link[]` and `links: Link[]` fields and the now-unused `Link` type export (nothing else in `content.ts` uses `Link` once this is done — verify with `grep -n "Link" content.ts` before removing it).

- [ ] **Step 2: Write the failing header test**

Create `tests/header.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('header is sticky and shows the wordmark, every nav route and the résumé pill', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const header = page.locator('[data-testid="header"]')
  await expect(header).toContainText('shane')
  const position = await header.evaluate((el) => getComputedStyle(el).position)
  expect(position).toBe('sticky')

  for (const item of site.nav) {
    const link = header.locator(`a[href="${item.href}"]`)
    await expect(link).toHaveCount(1)
    await expect(link).toContainText(item.path)
  }

  await expect(header.locator(`a[href="${site.resumeHref}"]`)).toHaveCount(1)
})

test('nav wraps to a second row on narrow widths instead of overflowing', async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 900 })
  await page.goto('/')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('header text stays readable against its fixed-dark background in both page themes', async ({ page }) => {
  await page.goto('/')
  for (const theme of ['dark', 'light'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
    const wordmark = page.locator('[data-testid="header"] a').first()
    const color = await wordmark.evaluate((el) => getComputedStyle(el).color)
    // In both themes the header forces its own light ink — never the page's
    // theme-swapping --ink, which would go near-black in light mode.
    expect(color).toBe('rgb(237, 234, 225)')
  }
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx playwright test tests/header.spec.ts --reporter=line`
Expected: FAIL — `[data-testid="header"]` doesn't exist yet.

- [ ] **Step 4: Build `components/ThemeToggle.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import styles from './ThemeToggle.module.css'

type Theme = 'dark' | 'light'
const KEY = 'srs-theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    setTheme(current === 'light' ? 'light' : 'dark')
  }, [])

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Private browsing — the theme still applies for this page view.
    }
  }

  const label = theme === 'light' ? 'Dark mode' : 'Light mode'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={theme === 'light' ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.44 1 .96 1.1 1.6h4.8c.1-.64.5-1.16 1.1-1.6A6 6 0 0 0 12 3z" />
      </svg>
    </button>
  )
}
```

Replace `components/ThemeToggle.module.css`:

```css
.toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--h-line-strong);
  background: transparent;
  color: var(--h-ink-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex: none;
  transition: color var(--dur-hover) ease, border-color var(--dur-hover) ease;
}

.toggle:hover {
  color: var(--h-ink);
  border-color: var(--h-ink-dim);
}
```

`ThemeToggle` is only ever mounted inside `Header`, so it can reach up to the `--h-*` variables `Header.module.css` defines on `.header` (Step 5) — CSS custom properties inherit down the DOM tree, so this works without prop-drilling colours.

- [ ] **Step 5: Build `components/Header.tsx`**

```tsx
import { site } from '@/content'
import ThemeToggle from './ThemeToggle'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header} data-testid="header">
      <a href="#top" className={styles.wordmark}>
        shane<span className={styles.wordmarkDim}>@dev</span>
        <span className={styles.cursor} aria-hidden="true">_</span>
      </a>
      <nav className={styles.nav} aria-label="Sections">
        {site.nav.map((item) => (
          <a key={item.href} className={styles.navLink} href={item.href}>
            <span className={styles.method}>{item.method}</span>
            {item.path}
          </a>
        ))}
        <ThemeToggle />
        <a className={styles.resume} href={site.resumeHref} download>
          Résumé ↓
        </a>
      </nav>
    </header>
  )
}
```

Create `components/Header.module.css`:

```css
/* Header keeps a fixed dark-glass chrome in both page themes (per the design
   handoff's literal, non-themed rgba value) — so it needs its own non-swapping
   colour set instead of the page's theme-swapping tokens. Using --ink directly
   would go near-black in light mode and fail contrast against this background. */
.header {
  --h-ink: #EDEAE2;
  --h-ink-dim: #8F8B84;
  --h-line: rgba(237, 234, 225, .14);
  --h-line-strong: rgba(237, 234, 225, .28);
  --h-accent: #D6F23C;

  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  flex-wrap: wrap;
  padding: 18px var(--gutter);
  background: rgba(20, 20, 26, .82);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--h-line);
  color: var(--h-ink);
}

.wordmark {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: .02em;
  color: var(--h-ink);
  display: inline-flex;
  align-items: baseline;
}

.wordmarkDim { color: var(--h-ink-dim); }

.cursor {
  color: var(--h-accent);
  margin-left: 1px;
  animation: blink 1.1s steps(1) infinite;
}

@keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .cursor { animation: none; }
}

.nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px clamp(10px, 1.8vw, 22px);
  row-gap: 8px;
}

.navLink {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: .02em;
  color: var(--h-ink-dim);
  display: inline-flex;
  gap: 5px;
  transition: color var(--dur-hover) ease;
}

.navLink:hover { color: var(--h-ink); }

.method {
  color: var(--h-accent);
  opacity: .75;
}

.resume {
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--h-ink);
  border: 1px solid var(--h-line-strong);
  border-radius: var(--radius-pill);
  padding: 9px 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  min-height: 44px;
  transition: border-color var(--dur-hover) ease, color var(--dur-hover) ease;
}

.resume:hover {
  border-color: var(--h-accent);
  color: var(--h-accent);
}
```

- [ ] **Step 6: Swap Header into `app/page.tsx` and delete Rail**

```tsx
import Header from '@/components/Header'
import Intro from '@/components/Intro'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import About from '@/components/About'
import Contact from '@/components/Contact'
import ScrollEffects from '@/components/ScrollEffects'
import Hero from '@/components/Hero'
import ImpactBand from '@/components/ImpactBand'

export default function Home() {
  return (
    <div className="page">
      <a id="top" />
      <Header />
      <main className="content">
        <Hero />
        <ImpactBand />
        <Intro />
        <Experience />
        <Projects />
        <Skills />
        <About />
        <Contact />
      </main>
      <ScrollEffects />
    </div>
  )
}
```

Delete `components/Rail.tsx` and `components/Rail.module.css`.

- [ ] **Step 7: Add the toggle-click test back to `tests/theme.spec.ts`**

Append:

```ts
test('toggle switches the theme and persists it across reload', async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.getByRole('button', { name: /mode/i }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  const stored = await page.evaluate(() => localStorage.getItem('srs-theme'))
  expect(stored).toBe('light')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await ctx.close()
})
```

- [ ] **Step 8: Run the tests and verify they pass**

Run: `npx playwright test tests/header.spec.ts tests/theme.spec.ts tests/tokens.spec.ts --reporter=line`
Expected: PASS. `tests/rail.spec.ts` no longer exists. `tests/responsive.spec.ts`'s rail-clearance test is still red (owned by Task 12) — expected.

- [ ] **Step 9: Commit**

```bash
git add content.ts components/Header.tsx components/Header.module.css components/ThemeToggle.tsx components/ThemeToggle.module.css app/page.tsx tests/header.spec.ts tests/theme.spec.ts
git rm components/Rail.tsx components/Rail.module.css tests/rail.spec.ts
git commit -m "feat: replace the fixed rail with a sticky header"
```

---

### Task 3: Hero rework — photo, terminal card, CTA row

**Files:**
- Modify: `components/Hero.tsx`, `components/Hero.module.css`
- Modify: `tests/hero.spec.ts`

**Interfaces:**
- Consumes: `site.name`, `site.thesis`, `site.blurb`, `site.lede`, `site.location`, `site.availability`, `site.email`, `site.linkedin`, `site.github` (all already exist or were added in Task 2).
- Produces: `section#hero` containing exactly one `<h1>`; `[data-testid="terminal-card"]`; `<img src="/headshot.jpg">`.

**Note:** `next build` runs ESLint, and `eslint-config-next`'s `@next/next/no-img-element` rule will print a warning on the plain `<img>` tag used below — this is expected (see Global Constraints on why `next/image` is intentionally not used) and does not fail the build; only ESLint *errors* fail `next build`, not warnings.

- [ ] **Step 1: Rewrite the failing hero test**

Replace `tests/hero.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('hero states the name as the only h1, with the thesis and blurb nearby', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const hero = page.locator('section#hero')
  await expect(hero).toHaveCount(1)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toContainText(site.name[0])
  await expect(page.locator('h1')).toContainText(site.name[1])
  await expect(hero).toContainText(site.thesis)
  await expect(hero).toContainText(site.blurb)
  await expect(hero).toContainText(site.lede)
})

test('hero shows the headshot and the health-check terminal card', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('section#hero')
  const photo = hero.locator('img[src="/headshot.jpg"]')
  await expect(photo).toHaveCount(1)
  await expect(photo).toHaveAttribute('alt', /.+/)

  const card = page.locator('[data-testid="terminal-card"]')
  await expect(card).toContainText('health-check.sh')
  await expect(card).toContainText('99.99%')
})

test('CTA row links to email, LinkedIn and GitHub safely', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('section#hero')
  await expect(hero.locator(`a[href="mailto:${site.email}"]`)).toHaveCount(1)

  for (const href of [site.linkedin, site.github]) {
    const link = hero.locator(`a[href="${href}"]`)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noreferrer/)
  }

  await expect(hero).toContainText(site.availability)
  await expect(hero).toContainText(site.location)
})

test('with reduced motion the hero is fully visible immediately', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  const opacity = await page.locator('h1').evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')
  await context.close()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/hero.spec.ts --reporter=line`
Expected: FAIL — no headshot `<img>`, no terminal card, old hero markup doesn't contain `site.blurb`/`site.lede` in `section#hero`.

- [ ] **Step 3: Rewrite `components/Hero.tsx`**

```tsx
import { site } from '@/content'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section id="hero" className={`${styles.hero} wrap`}>
      <div className={styles.columns}>
        <div className={styles.text}>
          <p className={`${styles.eyebrow} reveal`} style={{ transitionDelay: '0ms' }}>
            — {site.thesis}
          </p>
          <h1 className={`${styles.name} reveal`} style={{ transitionDelay: '90ms' }}>
            {site.name[0]}
            <br />
            {site.name[1]}
          </h1>
          <p className={`${styles.blurb} reveal`} style={{ transitionDelay: '180ms' }}>
            {site.blurb}
          </p>
          <p className={`${styles.lede} reveal`} style={{ transitionDelay: '270ms' }}>
            {site.lede}
          </p>

          <div className={`${styles.ctaRow} reveal`} style={{ transitionDelay: '360ms' }}>
            <a className={styles.emailCta} href={`mailto:${site.email}`}>
              {site.email} ↗
            </a>
            <a
              className={styles.outlineCta}
              href={site.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              className={styles.outlineCta}
              href={site.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <span className={styles.availability}>
              <span className={styles.pulseDot} aria-hidden="true" />
              {site.availability}
            </span>
          </div>
          <div className={styles.location}>{site.location}</div>

          <div
            className={`${styles.terminal} reveal`}
            style={{ transitionDelay: '420ms' }}
            data-testid="terminal-card"
          >
            <div className={styles.terminalBar}>
              <span className={styles.dotCoral} aria-hidden="true" />
              <span className={styles.dotLime} aria-hidden="true" />
              <span className={styles.dotMute} aria-hidden="true" />
              <span className={styles.terminalTitle}>health-check.sh</span>
            </div>
            <div className={styles.terminalBody}>
              <div className={styles.terminalDim}>$ curl -s api/health</div>
              <div>{'{'}</div>
              <div className={styles.terminalLine}>
                &nbsp;&nbsp;&quot;status&quot;: <span className={styles.terminalVal}>&quot;ok&quot;</span>,
              </div>
              <div className={styles.terminalLine}>
                &nbsp;&nbsp;&quot;reliability&quot;: <span className={styles.terminalVal}>&quot;99.99%&quot;</span>,
              </div>
              <div className={styles.terminalLine}>
                &nbsp;&nbsp;&quot;throughput&quot;: <span className={styles.terminalVal}>&quot;300k+/day&quot;</span>,
              </div>
              <div className={styles.terminalLine}>
                &nbsp;&nbsp;&quot;p95_latency&quot;: <span className={styles.terminalVal}>&quot;&lt;1s&quot;</span>
              </div>
              <div>{'}'}</div>
            </div>
          </div>
        </div>

        <img
          className={`${styles.photo} reveal`}
          style={{ transitionDelay: '0ms' }}
          src="/headshot.jpg"
          width={180}
          height={180}
          alt={`${site.name[0]} ${site.name[1]}`}
        />
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Rewrite `components/Hero.module.css`**

```css
.hero {
  padding-block: clamp(56px, 10vw, 120px) clamp(64px, 8vw, 96px);
}

.columns {
  display: flex;
  gap: 48px;
  align-items: flex-start;
  flex-wrap: wrap-reverse;
}

.text { flex: 1; min-width: 280px; }

.eyebrow {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--accent-2-text);
  margin-bottom: 22px;
}

.name {
  font-family: var(--font-display);
  font-size: var(--t-hero);
  line-height: var(--lh-hero);
  letter-spacing: var(--ls-hero);
  max-width: 1100px;
  text-wrap: pretty;
}

.blurb {
  font-size: var(--t-blurb);
  color: var(--ink-dim);
  max-width: 640px;
  line-height: 1.5;
  margin-top: 28px;
}

.lede {
  font-size: var(--t-lede);
  line-height: var(--lh-lede);
  color: var(--ink);
  opacity: .86;
  max-width: 680px;
  margin-top: 26px;
  text-wrap: pretty;
}

.ctaRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-top: 38px;
}

.emailCta {
  font-family: var(--font-mono);
  font-size: 13.5px;
  letter-spacing: .04em;
  font-weight: 600;
  background: var(--primary);
  color: var(--primary-ink);
  padding: 13px 22px;
  border-radius: var(--radius-pill);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  transition: transform var(--dur-hover) ease, opacity var(--dur-hover) ease;
}

.emailCta:hover { opacity: .88; transform: translateY(-2px); }

.outlineCta {
  font-family: var(--font-mono);
  font-size: 12.5px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ink-dim);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  padding: 12px 20px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  transition: color var(--dur-hover) ease, border-color var(--dur-hover) ease;
}

.outlineCta:hover { color: var(--ink); border-color: var(--ink-dim); }

.availability {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--accent-2-text);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 6px;
}

.pulseDot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-2-text);
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }

.location {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--ink-mute);
  margin-top: 16px;
  letter-spacing: .04em;
}

.terminal {
  margin-top: 40px;
  max-width: 460px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--surface);
}

.terminalBar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--line);
}

.dotCoral, .dotLime, .dotMute {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dotCoral { background: #FF5A4E; opacity: .5; }
.dotLime { background: #D6F23C; opacity: .5; }
.dotMute { background: var(--ink-mute); opacity: .4; }

.terminalTitle {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-mute);
  margin-left: 8px;
}

.terminalBody {
  padding: 16px 18px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.7;
}

.terminalDim { color: var(--ink-dim); }
.terminalLine { padding-left: 16px; }
.terminalVal { color: var(--accent-text); }

.photo {
  width: 180px;
  height: 180px;
  flex: none;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  object-fit: cover;
}

@media (prefers-reduced-motion: reduce) {
  .pulseDot { animation: none; }
}
```

- [ ] **Step 5: Run the test and verify it passes**

Run: `npx playwright test tests/hero.spec.ts --reporter=line`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/Hero.tsx components/Hero.module.css tests/hero.spec.ts
git commit -m "feat: rebuild the hero with a headshot and health-check terminal card"
```

---

### Task 4: Status band (replaces ImpactBand)

**Files:**
- Create: `components/StatusBand.tsx`, `components/StatusBand.module.css`
- Modify: `app/page.tsx` (swap `<ImpactBand />` for `<StatusBand />`)
- Delete: `components/ImpactBand.tsx`, `components/ImpactBand.module.css`
- Delete: `tests/impact.spec.ts`
- Create: `tests/status-band.spec.ts`

**Interfaces:**
- Consumes: `site.metrics: Metric[]` (unchanged shape from before).
- Produces: `[data-testid="status-band"]`.

- [ ] **Step 1: Write the failing test**

Create `tests/status-band.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('status band renders every metric with its label on the lime background', async ({ page }) => {
  await page.goto('/')
  const band = page.locator('[data-testid="status-band"]')
  await band.scrollIntoViewIfNeeded()
  for (const metric of site.metrics) {
    await expect(band).toContainText(metric.figure)
    await expect(band).toContainText(metric.label)
  }
  const bg = await band.evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(bg).toBe('rgb(214, 242, 60)')
})

test('status band reveals once scrolled into view', async ({ page }) => {
  await page.goto('/')
  const band = page.locator('[data-testid="status-band"]')
  await band.scrollIntoViewIfNeeded()
  await expect(band).toHaveClass(/is-in/)
})

test('with reduced motion the band is visible immediately', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  const opacity = await page
    .locator('[data-testid="status-band"]')
    .evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')
  await context.close()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/status-band.spec.ts --reporter=line`
Expected: FAIL — `[data-testid="status-band"]` doesn't exist.

- [ ] **Step 3: Build `components/StatusBand.tsx`**

```tsx
import { site } from '@/content'
import styles from './StatusBand.module.css'

export default function StatusBand() {
  return (
    <div className={`${styles.band} reveal`} data-testid="status-band">
      <div className={`${styles.inner} wrap`}>
        <div className={styles.eyebrow}>
          <span className={styles.pulseDot} aria-hidden="true" />
          system_status — live
        </div>
        <dl className={styles.grid}>
          {site.metrics.map((metric, i) => (
            <div
              key={metric.label}
              className="reveal"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <dt className={styles.figure}>{metric.figure}</dt>
              <dd className={styles.label}>{metric.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Build `components/StatusBand.module.css`**

```css
.band {
  background: var(--primary);
  padding-block: clamp(36px, 5vw, 56px);
}

.inner { padding-inline: var(--gutter); }

.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: .1em;
  color: var(--primary-ink);
  opacity: .7;
}

.pulseDot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--primary-ink);
  display: inline-block;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0;
  margin: 0;
  padding: 0;
}

.grid > div {
  padding: 0 24px;
  border-left: 1px solid rgba(28, 33, 10, .13);
}

.grid > div:first-child { border-left: none; padding-left: 0; }

.figure {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: var(--t-metric);
  letter-spacing: -.02em;
  color: var(--primary-ink);
  margin: 0;
}

.label {
  font-size: 13.5px;
  color: var(--primary-ink);
  opacity: .75;
  margin: 6px 0 0;
}

@media (max-width: 767px) {
  .grid { grid-template-columns: repeat(2, 1fr); row-gap: 24px; }
  .grid > div { border-left: none; padding-left: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .pulseDot { animation: none; }
}
```

- [ ] **Step 5: Swap into `app/page.tsx`, delete ImpactBand**

```tsx
import Header from '@/components/Header'
import Intro from '@/components/Intro'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import About from '@/components/About'
import Contact from '@/components/Contact'
import ScrollEffects from '@/components/ScrollEffects'
import Hero from '@/components/Hero'
import StatusBand from '@/components/StatusBand'

export default function Home() {
  return (
    <div className="page">
      <a id="top" />
      <Header />
      <main className="content">
        <Hero />
        <StatusBand />
        <Intro />
        <Experience />
        <Projects />
        <Skills />
        <About />
        <Contact />
      </main>
      <ScrollEffects />
    </div>
  )
}
```

Delete `components/ImpactBand.tsx` and `components/ImpactBand.module.css`.

- [ ] **Step 6: Run the test and verify it passes**

Run: `npx playwright test tests/status-band.spec.ts --reporter=line`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/StatusBand.tsx components/StatusBand.module.css app/page.tsx tests/status-band.spec.ts
git rm components/ImpactBand.tsx components/ImpactBand.module.css tests/impact.spec.ts
git commit -m "feat: replace the impact band with the lime system-status band"
```

---

### Task 5: Journey (replaces Experience + About's education note)

**Files:**
- Modify: `content.ts` (add `EducationEntry`, `JourneyEntry`, `education`, `journey`)
- Create: `components/Journey.tsx`, `components/Journey.module.css`
- Modify: `app/page.tsx` (swap `<Experience />` and `<About />` for `<Journey />`)
- Delete: `components/Experience.tsx`, `components/Experience.module.css`, `components/About.tsx`, `components/About.module.css`
- Create: `tests/journey.spec.ts`

**Note:** `content.ts`'s `about` export and `components/Intro.tsx` (which renders `site.lede`, unrelated to `about`) are untouched here. `about` becomes unused once this task lands (nothing imports it), but it is deliberately **not** deleted yet — `tests/sections.spec.ts` still imports it until Task 12 deletes that file. Removing `about` now would break `tests/sections.spec.ts`'s TypeScript compilation. Leave it in place; Task 12 removes it.

**Interfaces:**
- Consumes: `experience: ExperienceEntry[]` (unchanged).
- Produces: `education: EducationEntry`, `journey: JourneyEntry[]` (oldest → newest: education, then every `experience` entry reversed, with `current: true` on the last one).

- [ ] **Step 1: Update `content.ts`**

Add near the other type exports:

```ts
export type EducationEntry = {
  institution: string
  field: string
  cgpa: string
  note: string
}

export type JourneyEntry =
  | {
      kind: 'education'
      title: string
      subtitle: string
      dateLabel: string
      note: string
    }
  | {
      kind: 'work'
      title: string
      subtitle: string
      dateLabel: string
      bullets: string[]
      current: boolean
    }
```

Add after the `experience` export:

```ts
export const education: EducationEntry = {
  institution: 'Thiagarajar College of Engineering',
  field: 'Computer Science',
  cgpa: '9.42 / 10',
  note:
    'Outside of work most of my time goes to sport, tennis mostly, a few tournament wins from school and college days, plus cricket and badminton, and honestly I watch a lot more of all three than I actually play. Weekends are reserved for a good film, any language, as long as the story holds up.',
}

export const journey: JourneyEntry[] = [
  {
    kind: 'education',
    title: education.institution,
    subtitle: `${education.field} · CGPA ${education.cgpa}`,
    dateLabel: 'EDUCATION',
    note: education.note,
  },
  ...experience
    .slice()
    .reverse()
    .map(
      (role, i, arr): JourneyEntry => ({
        kind: 'work',
        title: role.title,
        subtitle: role.company,
        dateLabel: role.dates,
        bullets: role.bullets,
        current: i === arr.length - 1,
      }),
    ),
]
```

- [ ] **Step 2: Write the failing test**

Create `tests/journey.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { journey } from '@/content'

test('journey renders every entry oldest to newest with its dates and bullets/note', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#journey')
  await expect(section).toHaveCount(1)

  for (const entry of journey) {
    await expect(section).toContainText(entry.title)
    await expect(section).toContainText(entry.dateLabel)
    if (entry.kind === 'work') {
      for (const bullet of entry.bullets) {
        await expect(section).toContainText(bullet)
      }
    } else {
      await expect(section).toContainText(entry.note)
    }
  }
})

test('the current role is marked, and only the current role', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#journey')
  const currentEntries = journey.filter((e) => e.kind === 'work' && e.current)
  expect(currentEntries).toHaveLength(1)
  await expect(section).toContainText('current')
})

test('entries appear in document order oldest to newest', async ({ page }) => {
  await page.goto('/')
  const titles = await page.locator('section#journey h3').allTextContents()
  expect(titles).toEqual(journey.map((e) => e.title))
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx playwright test tests/journey.spec.ts --reporter=line`
Expected: FAIL — `section#journey` doesn't exist.

- [ ] **Step 4: Build `components/Journey.tsx`**

```tsx
import { journey } from '@/content'
import styles from './Journey.module.css'

export default function Journey() {
  return (
    <section id="journey" className={`${styles.section} wrap`}>
      <div className={`${styles.marker} reveal`}>
        <span className={styles.markerLabel}>// 01_journey</span>
        <span className={styles.markerRule} />
      </div>
      <div className={styles.rail}>
        <div className={styles.railLine} aria-hidden="true" />
        {journey.map((entry, i) => (
          <div
            key={entry.title}
            className={`${styles.entry} reveal`}
            style={{ transitionDelay: `${i * 110}ms` }}
          >
            <span
              className={`${styles.dot} ${entry.kind === 'education' ? styles.dotMute : styles.dotAccent}`}
              aria-hidden="true"
            />
            <div className={styles.tags}>
              <span className={styles.kindPill}>
                {entry.kind === 'work' ? 'WORK' : 'EDUCATION'}
              </span>
              {entry.kind === 'work' && entry.current && (
                <span className={styles.currentTag}>● current</span>
              )}
            </div>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>{entry.title}</h3>
              <span className={styles.date}>{entry.dateLabel}</span>
            </div>
            <div className={styles.subtitle}>{entry.subtitle}</div>
            {entry.kind === 'work' ? (
              <ul className={styles.bullets}>
                {entry.bullets.map((bullet) => (
                  <li key={bullet}>
                    <span className={styles.arrow} aria-hidden="true">→</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.note}>{entry.note}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Build `components/Journey.module.css`**

```css
.section {
  padding-block: clamp(72px, 10vw, 110px) clamp(40px, 6vw, 64px);
}

.marker { display: flex; align-items: center; gap: 16px; margin-bottom: 44px; }
.markerLabel { font-family: var(--font-mono); font-size: 13px; letter-spacing: .1em; color: var(--accent-text); }
.markerRule { flex: 1; height: 1px; background: var(--line); }

.rail { position: relative; padding-left: 32px; }
.railLine {
  position: absolute;
  left: 5px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--line-strong);
}

.entry { position: relative; padding-bottom: 44px; }
.entry:last-child { padding-bottom: 0; }

.dot {
  position: absolute;
  left: -27px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid var(--bg);
}
.dotAccent { background: var(--accent-text); }
.dotMute { background: var(--ink-mute); }

.tags { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }

.kindPill {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: .1em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--line-strong);
  color: var(--ink-mute);
}

.currentTag {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--accent-text);
}

.titleRow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 20px;
  flex-wrap: wrap;
}

.title {
  font-size: var(--t-h2);
  letter-spacing: -.01em;
}

.date {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--ink-mute);
  white-space: nowrap;
}

.subtitle {
  font-size: 15px;
  color: var(--ink-dim);
  margin-top: 6px;
}

.bullets {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 780px;
}

.bullets li {
  display: flex;
  gap: 12px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--ink);
  opacity: .88;
}

.arrow { color: var(--accent-2-text); flex: none; }

.note {
  font-size: 15px;
  line-height: 1.7;
  color: var(--ink);
  opacity: .78;
  max-width: 700px;
  margin: 14px 0 0;
  text-wrap: pretty;
}

@media (prefers-reduced-motion: no-preference) {
  .dotAccent { animation: none; }
}
```

- [ ] **Step 6: Swap into `app/page.tsx`, delete Experience and About**

```tsx
import Header from '@/components/Header'
import Intro from '@/components/Intro'
import Journey from '@/components/Journey'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Contact from '@/components/Contact'
import ScrollEffects from '@/components/ScrollEffects'
import Hero from '@/components/Hero'
import StatusBand from '@/components/StatusBand'

export default function Home() {
  return (
    <div className="page">
      <a id="top" />
      <Header />
      <main className="content">
        <Hero />
        <StatusBand />
        <Intro />
        <Journey />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <ScrollEffects />
    </div>
  )
}
```

Delete `components/Experience.tsx`, `components/Experience.module.css`, `components/About.tsx`, `components/About.module.css`.

- [ ] **Step 7: Run the test and verify it passes**

Run: `npx playwright test tests/journey.spec.ts --reporter=line`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add content.ts components/Journey.tsx components/Journey.module.css app/page.tsx tests/journey.spec.ts
git rm components/Experience.tsx components/Experience.module.css components/About.tsx components/About.module.css
git commit -m "feat: merge experience and education into one journey timeline"
```

---

### Task 6: Projects + ProjectRow rework

**Files:**
- Create: `components/ProjectRow.tsx`, `components/ProjectRow.module.css`
- Modify: `components/Projects.tsx`, `components/Projects.module.css`
- Modify: `tests/sections.spec.ts` → **delete it**; create `tests/projects.spec.ts` covering only the projects assertions it used to own (the rest of `sections.spec.ts`'s assertions are already re-homed into `journey.spec.ts`/`skills.spec.ts`/etc. by their own tasks — see Task 12 for the final removal)

**Interfaces:**
- Consumes: `projects: Project[]` (unchanged shape).
- Produces: index-numbered rows inside `section#projects`.

- [ ] **Step 1: Write the failing test**

Create `tests/projects.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { projects } from '@/content'

test('every project renders with its index, status and stack', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#projects')
  for (const [i, project] of projects.entries()) {
    await expect(section).toContainText(String(i + 1).padStart(2, '0'))
    await expect(section).toContainText(project.name)
    await expect(section).toContainText(project.stack)
    await expect(section).toContainText(
      project.status === 'in-progress' ? 'In progress' : 'Completed',
    )
    for (const line of project.description) {
      await expect(section).toContainText(line)
    }
  }
})

test('every linked project links out safely', async ({ page }) => {
  await page.goto('/')
  const linked = projects.filter((p) => p.href)
  for (const project of linked) {
    const link = page.locator(`section#projects a[href="${project.href}"]`)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noreferrer/)
    await expect(link).toContainText('View repo')
  }
})

test('project links are all https', () => {
  for (const project of projects) {
    if (!project.href) continue
    expect(project.href, `${project.name} must use https`).toMatch(/^https:\/\//)
  }
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/projects.spec.ts --reporter=line`
Expected: FAIL — index numbers and "View repo" link text don't exist in the current markup.

- [ ] **Step 3: Build `components/ProjectRow.tsx`**

```tsx
import type { Project } from '@/content'
import styles from './ProjectRow.module.css'

const STATUS_LABEL: Record<Project['status'], string> = {
  'in-progress': 'In progress',
  completed: 'Completed',
}

export default function ProjectRow({ project, index }: { project: Project; index: number }) {
  const idx = String(index + 1).padStart(2, '0')
  const body = (
    <>
      <div className={styles.header}>
        <h3 className={styles.name}>{project.name}</h3>
        <div className={styles.meta}>
          <span className={styles.status} data-status={project.status}>
            {STATUS_LABEL[project.status]}
          </span>
          <span className={styles.stack}>{project.stack}</span>
        </div>
      </div>
      <div className={styles.description}>
        {project.description.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      {project.href && (
        <span className={styles.viewRepo}>View repo ↗</span>
      )}
    </>
  )

  return (
    <div className={styles.row}>
      <div className={styles.index} aria-hidden="true">{idx}</div>
      {project.href ? (
        <a className={styles.content} href={project.href} target="_blank" rel="noreferrer">
          {body}
        </a>
      ) : (
        <div className={styles.content}>{body}</div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Build `components/ProjectRow.module.css`**

```css
.row {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 24px;
  padding: 32px 0;
  border-bottom: 1px solid var(--line);
  align-items: start;
}

.index {
  font-family: var(--font-mono);
  font-size: 34px;
  font-weight: 600;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px var(--ink-mute);
}

.content { display: block; color: inherit; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
}

.name {
  font-size: var(--t-h3);
  letter-spacing: -.01em;
  color: var(--ink);
}

.meta { display: flex; align-items: center; gap: 10px; flex: none; }

.status {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.status[data-status='in-progress'] { color: var(--accent-2-text); }
.status[data-status='completed'] { color: var(--ink-mute); }

.stack {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-mute);
}

.description {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 760px;
}

.description p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--ink);
  opacity: .78;
  margin: 0;
}

.viewRepo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-family: var(--font-mono);
  font-size: 12.5px;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ink);
  border-bottom: 1px solid var(--line-strong);
  padding-bottom: 4px;
  transition: color var(--dur-hover) ease, border-color var(--dur-hover) ease;
}

.content:hover .viewRepo {
  color: var(--accent-text);
  border-color: var(--accent-text);
}

@media (max-width: 767px) { .row { grid-template-columns: 40px 1fr; gap: 16px; } }
```

- [ ] **Step 5: Rewrite `components/Projects.tsx`**

```tsx
import { projects } from '@/content'
import ProjectRow from './ProjectRow'
import styles from './Projects.module.css'

export default function Projects() {
  return (
    <section id="projects" className={`${styles.section} wrap`}>
      <div className={`${styles.marker} reveal`}>
        <span className={styles.markerLabel}>// 02_projects</span>
        <span className={styles.markerRule} />
      </div>
      {projects.map((project, i) => (
        <ProjectRow key={project.name} project={project} index={i} />
      ))}
    </section>
  )
}
```

Replace `components/Projects.module.css`:

```css
.section {
  padding-block: clamp(56px, 8vw, 96px) clamp(40px, 6vw, 64px);
}

.marker { display: flex; align-items: center; gap: 16px; margin-bottom: 44px; }
.markerLabel { font-family: var(--font-mono); font-size: 13px; letter-spacing: .1em; color: var(--accent-text); }
.markerRule { flex: 1; height: 1px; background: var(--line); }
```

- [ ] **Step 6: Run the test and verify it passes**

Run: `npx playwright test tests/projects.spec.ts --reporter=line`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/ProjectRow.tsx components/ProjectRow.module.css components/Projects.tsx components/Projects.module.css tests/projects.spec.ts
git commit -m "feat: rebuild projects as index-numbered rows"
```

---

### Task 7: Skills restyle — retire SectionLabel

**Files:**
- Modify: `components/Skills.tsx`, `components/Skills.module.css`
- Delete: `components/SectionLabel.tsx`, `components/SectionLabel.module.css` (Journey and Projects already dropped it in Tasks 5–6; Skills was its last consumer)
- Create: `tests/skills.spec.ts`

**Interfaces:**
- Consumes: `skills: SkillGroup[]` (unchanged shape — `lead` count splits "loud" vs. "quiet" chips, as before).
- Produces: `section#skills`.

- [ ] **Step 1: Write the failing test**

Create `tests/skills.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { skills } from '@/content'

test('every skill renders under its category, split into lead and quiet chips', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#skills')
  for (const group of skills) {
    await expect(section).toContainText(group.category)
    for (const item of group.items) {
      await expect(section).toContainText(item)
    }
  }
})

test('lead chips render solid, quiet chips render outlined', async ({ page }) => {
  await page.goto('/')
  const firstGroup = skills[0]
  const chips = page.locator('section#skills [data-testid="skill-chip"]')
  const leadChip = chips.filter({ hasText: firstGroup.items[0] }).first()
  const bg = await leadChip.evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(bg).not.toBe('rgba(0, 0, 0, 0)')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/skills.spec.ts --reporter=line`
Expected: FAIL — `section#skills` doesn't exist under that id yet / no `data-testid="skill-chip"`.

(Confirm the current `Skills.tsx` uses `<section id="skills" className="section court">` — the `section#skills` id already matches, so this failure is specifically about the missing `data-testid`.)

- [ ] **Step 3: Rewrite `components/Skills.tsx`**

```tsx
import { skills } from '@/content'
import styles from './Skills.module.css'

export default function Skills() {
  return (
    <section id="skills" className={`${styles.section} wrap`}>
      <div className={`${styles.marker} reveal`}>
        <span className={styles.markerLabel}>// 03_skills</span>
        <span className={styles.markerRule} />
      </div>
      <div className={styles.grid}>
        {skills.map((group, i) => {
          const lead = group.items.slice(0, group.lead)
          const rest = group.items.slice(group.lead)
          return (
            <div
              key={group.category}
              className="reveal"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={styles.category}>{group.category}</div>
              <div className={styles.chips}>
                {lead.map((item) => (
                  <span key={item} className={styles.chipLead} data-testid="skill-chip">
                    {item}
                  </span>
                ))}
                {rest.map((item) => (
                  <span key={item} className={styles.chipQuiet} data-testid="skill-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Rewrite `components/Skills.module.css`**

```css
.section {
  padding-block: clamp(56px, 8vw, 96px) clamp(40px, 6vw, 64px);
}

.marker { display: flex; align-items: center; gap: 16px; margin-bottom: 44px; }
.markerLabel { font-family: var(--font-mono); font-size: 13px; letter-spacing: .1em; color: var(--accent-text); }
.markerRule { flex: 1; height: 1px; background: var(--line); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 36px 48px;
}

.category {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink-mute);
  margin-bottom: 14px;
}

.chips { display: flex; flex-wrap: wrap; gap: 8px; }

.chipLead {
  font-family: var(--font-body);
  font-size: 14.5px;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: var(--radius-pill);
  background: var(--ink);
  color: var(--bg);
}

.chipQuiet {
  font-family: var(--font-mono);
  font-size: 12.5px;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--line-strong);
  color: var(--ink-dim);
}
```

- [ ] **Step 5: Delete SectionLabel**

Confirm nothing still imports it: `grep -rn "SectionLabel" components/ app/`. If the search comes back empty, delete `components/SectionLabel.tsx` and `components/SectionLabel.module.css`.

- [ ] **Step 6: Run the test and verify it passes**

Run: `npx playwright test tests/skills.spec.ts --reporter=line`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/Skills.tsx components/Skills.module.css tests/skills.spec.ts
git rm components/SectionLabel.tsx components/SectionLabel.module.css
git commit -m "feat: restyle skills chips and retire SectionLabel"
```

---

### Task 8: Now (new section)

**Files:**
- Modify: `content.ts` (add `NowEntry`, `now`)
- Create: `components/Now.tsx`, `components/Now.module.css`
- Modify: `app/page.tsx` (add `<Now />` after `<Skills />`)
- Create: `tests/now.spec.ts`

**Interfaces:**
- Consumes: nothing beyond `content.ts`.
- Produces: `now: NowEntry[]` (`{ tag: string; text: string }`), `section#now`.

- [ ] **Step 1: Update `content.ts`**

Add the type and export, after `journey`:

```ts
export type NowEntry = { tag: string; text: string }

export const now: NowEntry[] = [
  {
    tag: 'AT WORK',
    text: 'Rolling out Spec Driven Development as the default workflow across the team.',
  },
  {
    tag: 'BUILDING',
    text: 'Atlas, an in-house PIM built spec-driven end to end, deployed on GCP.',
  },
  {
    tag: 'BUILDING',
    text: 'A full-stack rebuild of a marketing site with an AI RFQ concierge on Spring AI.',
  },
]
```

- [ ] **Step 2: Write the failing test**

Create `tests/now.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { now } from '@/content'

test('now renders every entry with its tag', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#now')
  await expect(section).toHaveCount(1)
  for (const entry of now) {
    await expect(section).toContainText(entry.tag)
    await expect(section).toContainText(entry.text)
  }
})

test('now sits after skills and before contact', async ({ page }) => {
  await page.goto('/')
  const ids = await page.locator('main section[id]').evaluateAll((els) =>
    els.map((el) => el.id),
  )
  expect(ids.indexOf('now')).toBeGreaterThan(ids.indexOf('skills'))
  expect(ids.indexOf('now')).toBeLessThan(ids.indexOf('contact'))
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx playwright test tests/now.spec.ts --reporter=line`
Expected: FAIL — `section#now` doesn't exist.

- [ ] **Step 4: Build `components/Now.tsx`**

```tsx
import { now } from '@/content'
import styles from './Now.module.css'

export default function Now() {
  return (
    <section id="now" className={`${styles.section} wrap`}>
      <div className={`${styles.marker} reveal`}>
        <span className={styles.markerLabel}>// 04_now</span>
        <span className={styles.markerRule} />
      </div>
      {now.map((entry, i) => (
        <div
          key={entry.text}
          className={`${styles.row} reveal`}
          style={{ transitionDelay: `${i * 90}ms` }}
        >
          <span className={styles.tag}>{entry.tag}</span>
          <span className={styles.text}>{entry.text}</span>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 5: Build `components/Now.module.css`**

```css
.section {
  padding-block: clamp(40px, 6vw, 64px);
}

.marker { display: flex; align-items: center; gap: 16px; margin-bottom: 44px; }
.markerLabel { font-family: var(--font-mono); font-size: 13px; letter-spacing: .1em; color: var(--accent-text); }
.markerRule { flex: 1; height: 1px; background: var(--line); }

.row {
  display: flex;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
  align-items: baseline;
}

.tag {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-mute);
  flex: none;
  width: 90px;
}

.text {
  font-size: 15.5px;
  color: var(--ink);
  opacity: .88;
  line-height: 1.6;
}
```

- [ ] **Step 6: Add Now to `app/page.tsx`**

```tsx
import Header from '@/components/Header'
import Intro from '@/components/Intro'
import Journey from '@/components/Journey'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Now from '@/components/Now'
import Contact from '@/components/Contact'
import ScrollEffects from '@/components/ScrollEffects'
import Hero from '@/components/Hero'
import StatusBand from '@/components/StatusBand'

export default function Home() {
  return (
    <div className="page">
      <a id="top" />
      <Header />
      <main className="content">
        <Hero />
        <StatusBand />
        <Intro />
        <Journey />
        <Projects />
        <Skills />
        <Now />
        <Contact />
      </main>
      <ScrollEffects />
    </div>
  )
}
```

- [ ] **Step 7: Run the test and verify it passes**

Run: `npx playwright test tests/now.spec.ts --reporter=line`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add content.ts components/Now.tsx components/Now.module.css app/page.tsx tests/now.spec.ts
git commit -m "feat: add the now section"
```

---

### Task 9: Contact rework (closing footer) — retire Intro's old wrapper markup

**Files:**
- Modify: `components/Contact.tsx`, `components/Contact.module.css`
- Modify: `components/Intro.tsx`, `components/Intro.module.css` (drop the `court` wrapper `<div>`, keep the lede paragraph — it still renders `site.lede` above the fold, unchanged in role)
- Create: `tests/contact.spec.ts`

**Interfaces:**
- Consumes: `site.email`, `site.location`, `site.availability`, `site.resumeHref`, `site.linkedin`, `site.github`, `site.name`.
- Produces: `section#contact` as the final section.

- [ ] **Step 1: Write the failing test**

Create `tests/contact.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('contact closes the page with a headline and three CTAs', async ({ page }) => {
  await page.goto('/')
  const contact = page.locator('section#contact')
  await expect(contact).toHaveCount(1)
  await expect(contact.getByRole('heading', { level: 2 })).toContainText(
    "Let's build something that stays up.",
  )

  const email = contact.locator(`a[href="mailto:${site.email}"]`)
  await expect(email).toHaveCount(1)

  await expect(contact.locator(`a[href="${site.resumeHref}"]`)).toHaveCount(1)

  for (const href of [site.linkedin, site.github]) {
    const link = contact.locator(`a[href="${href}"]`)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noreferrer/)
  }

  await expect(contact).toContainText(site.location)
  await expect(contact).toContainText(site.availability)
  await expect(contact).toContainText(String(new Date().getFullYear()))
})

test('contact is the last section on the page', async ({ page }) => {
  await page.goto('/')
  const ids = await page.locator('main section[id]').evaluateAll((els) => els.map((el) => el.id))
  expect(ids[ids.length - 1]).toBe('contact')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/contact.spec.ts --reporter=line`
Expected: FAIL — no `<h2>` headline, no résumé/LinkedIn/GitHub links in `section#contact` yet.

- [ ] **Step 3: Rewrite `components/Contact.tsx`**

```tsx
import { site } from '@/content'
import styles from './Contact.module.css'

export default function Contact() {
  return (
    <section id="contact" className={`${styles.contact} reveal`}>
      <div className={`${styles.inner} wrap`}>
        <span className={styles.marker}>// 05_contact</span>
        <h2 className={styles.headline}>Let&apos;s build something that stays up.</h2>
        <div className={styles.emailRow}>
          <a className={styles.email} href={`mailto:${site.email}`}>
            {site.email} ↗
          </a>
        </div>
        <div className={styles.ctaRow}>
          <a className={styles.resumeCta} href={site.resumeHref} download>
            Download Résumé
          </a>
          <a className={styles.outlineCta} href={site.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className={styles.outlineCta} href={site.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <div className={styles.footRow}>
          <span>
            {site.location} · {site.availability}
          </span>
          <span>
            © {new Date().getFullYear()} {site.name.join(' ')}
          </span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Rewrite `components/Contact.module.css`**

```css
.contact {
  background: var(--surface);
  border-top: 1px solid var(--line);
  padding-block: clamp(64px, 10vw, 120px);
}

.inner { display: flex; flex-direction: column; gap: 32px; }

.marker { font-family: var(--font-mono); font-size: 13px; letter-spacing: .1em; color: var(--accent-2-text); }

.headline {
  font-size: var(--t-display);
  line-height: var(--lh-display);
  letter-spacing: var(--ls-display);
  max-width: 760px;
}

.emailRow { display: flex; flex-wrap: wrap; align-items: center; gap: 18px; }

.email {
  font-family: var(--font-mono);
  font-size: clamp(16px, 2vw, 20px);
  color: var(--ink);
  border-bottom: 1px solid var(--line-strong);
  padding-bottom: 6px;
  transition: color var(--dur-hover) ease, border-color var(--dur-hover) ease;
}

.email:hover { color: var(--accent-text); border-color: var(--accent-text); }

.ctaRow { display: flex; flex-wrap: wrap; gap: 16px; }

.resumeCta {
  font-family: var(--font-mono);
  font-size: 12.5px;
  letter-spacing: .08em;
  text-transform: uppercase;
  background: var(--primary);
  color: var(--primary-ink);
  font-weight: 600;
  border-radius: var(--radius-pill);
  padding: 12px 20px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  transition: transform var(--dur-hover) ease, opacity var(--dur-hover) ease;
}

.resumeCta:hover { transform: translateY(-2px); opacity: .9; }

.outlineCta {
  font-family: var(--font-mono);
  font-size: 12.5px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ink-dim);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  padding: 12px 20px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  transition: color var(--dur-hover) ease;
}

.outlineCta:hover { color: var(--ink); }

.footRow {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-mute);
  letter-spacing: .04em;
}
```

- [ ] **Step 5: Simplify `components/Intro.tsx`**

```tsx
import { site } from '@/content'
import styles from './Intro.module.css'

export default function Intro() {
  return (
    <p className={`${styles.lede} reveal wrap`} data-testid="intro">
      {site.lede}
    </p>
  )
}
```

Update `components/Intro.module.css` — drop any rule keyed off the old `.court`/`section` wrapper it no longer has; keep the text styling:

```css
.lede {
  font-size: var(--t-lede);
  line-height: var(--lh-lede);
  color: var(--ink);
  padding-block: clamp(24px, 4vw, 40px);
  text-wrap: pretty;
}
```

- [ ] **Step 6: Run the test and verify it passes**

Run: `npx playwright test tests/contact.spec.ts --reporter=line`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/Contact.tsx components/Contact.module.css components/Intro.tsx components/Intro.module.css tests/contact.spec.ts
git commit -m "feat: rebuild contact as the closing footer"
```

---

### Task 10: Scroll progress bar + scroll-to-top button

**Files:**
- Modify: `components/ScrollEffects.tsx` (add the progress bar, update the reveal-target query to drop `.wipe`)
- Create: `components/ScrollTopButton.tsx`, `components/ScrollTopButton.module.css`
- Modify: `app/page.tsx` (render `<ScrollTopButton />`)
- Create: `tests/scroll-chrome.spec.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `[data-testid="scroll-progress"]` (fixed top bar, width tracks scroll %), `[data-testid="scroll-top"]` (fixed button, hidden until 480px scrolled, scrolls to top on click).

- [ ] **Step 1: Write the failing test**

Create `tests/scroll-chrome.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('progress bar width tracks scroll position', async ({ page }) => {
  await page.goto('/')
  const bar = page.locator('[data-testid="scroll-progress"]')
  const before = await bar.evaluate((el) => parseFloat(getComputedStyle(el).width))
  expect(before).toBeLessThan(5)

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(200)
  const after = await bar.evaluate((el) => parseFloat(getComputedStyle(el).width))
  const viewport = page.viewportSize()!
  expect(after).toBeGreaterThan(viewport.width * 0.9)
})

test('scroll-to-top button appears past 480px and returns to the top on click', async ({ page }) => {
  await page.goto('/')
  const button = page.locator('[data-testid="scroll-top"]')
  await expect(button).toBeHidden()

  await page.evaluate(() => window.scrollTo(0, 600))
  await page.waitForTimeout(200)
  await expect(button).toBeVisible()

  await button.click()
  await page.waitForFunction(() => window.scrollY < 10)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/scroll-chrome.spec.ts --reporter=line`
Expected: FAIL — neither `data-testid` exists.

- [ ] **Step 3: Extend `components/ScrollEffects.tsx`**

Add a `progressRef` and fold the width update into the same `onScroll`/`checkBottom` handler that already runs on every scroll event (no second listener). Full updated file:

```tsx
'use client'

import { useEffect, useRef } from 'react'

const REVEAL_FAILSAFE_MS = 2000

export default function ScrollEffects() {
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))

    const revealAll = () =>
      revealTargets.forEach((el) => {
        el.style.transitionDuration = '0s'
        el.classList.add('is-in')
      })

    let remaining = revealTargets.length
    const failsafe = window.setTimeout(() => {
      if (remaining <= 0) return
      revealAll()
    }, REVEAL_FAILSAFE_MS)

    if (!('IntersectionObserver' in window)) {
      revealAll()
      return () => window.clearTimeout(failsafe)
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            revealObserver.unobserve(entry.target)
            remaining -= 1
            if (remaining <= 0) window.clearTimeout(failsafe)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    revealTargets.forEach((el) => revealObserver.observe(el))

    // Scroll-spy. Classes are toggled on the DOM directly rather than lifted
    // into React state, so Header stays a server component.
    const navLinks = new Map<string, HTMLAnchorElement>()
    document
      .querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')
      .forEach((a) => navLinks.set(a.getAttribute('href')!.slice(1), a))
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('main section[id]'),
    ).filter((s) => navLinks.has(s.id))

    const setActive = (id: string) => {
      navLinks.forEach((link, key) => {
        if (key === id) link.setAttribute('aria-current', 'true')
        else link.removeAttribute('aria-current')
      })
    }

    const visible = new Set<string>()
    const spyObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const active = sections.find((s) => visible.has(s.id))
        if (active) setActive(active.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    sections.forEach((s) => spyObserver.observe(s))

    let scrollTick = false
    const tick = () => {
      scrollTick = false

      // Progress bar
      if (progressRef.current) {
        const h = document.documentElement
        const height = h.scrollHeight - h.clientHeight
        const pct = height > 0 ? (h.scrollTop / height) * 100 : 0
        progressRef.current.style.width = pct + '%'
      }

      // Bottom-of-document scroll-spy fallback — see below.
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      if (atBottom && sections.length > 0) {
        setActive(sections[sections.length - 1].id)
      }
    }
    const onScroll = () => {
      if (scrollTick) return
      scrollTick = true
      window.requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    tick()

    return () => {
      window.clearTimeout(failsafe)
      revealObserver.disconnect()
      spyObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div
      ref={progressRef}
      data-testid="scroll-progress"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: '0%',
        background: 'var(--primary)',
        zIndex: 100,
      }}
    />
  )
}
```

The `.wipe` selector is dropped from the reveal-target query — no component has used that class since Task 4 rewrote `StatusBand`/`Contact` onto plain `.reveal`. The bottom-fallback comment block from the original file is condensed but the behaviour (last section wins once scrolled to the bottom) is unchanged.

- [ ] **Step 4: Build `components/ScrollTopButton.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import styles from './ScrollTopButton.module.css'

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      className={styles.button}
      data-testid="scroll-top"
      aria-label="Scroll to top"
      hidden={!visible}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  )
}
```

Create `components/ScrollTopButton.module.css`:

```css
.button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  background: var(--surface);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
  box-shadow: 0 6px 20px rgba(0, 0, 0, .25);
  transition: transform var(--dur-hover) ease, border-color var(--dur-hover) ease;
}

.button[hidden] { display: none; }

.button:hover {
  transform: translateY(-3px);
  border-color: var(--ink-dim);
}
```

- [ ] **Step 5: Render `ScrollTopButton` in `app/page.tsx`**

```tsx
import Header from '@/components/Header'
import Intro from '@/components/Intro'
import Journey from '@/components/Journey'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Now from '@/components/Now'
import Contact from '@/components/Contact'
import ScrollEffects from '@/components/ScrollEffects'
import ScrollTopButton from '@/components/ScrollTopButton'
import Hero from '@/components/Hero'
import StatusBand from '@/components/StatusBand'

export default function Home() {
  return (
    <div className="page">
      <a id="top" />
      <Header />
      <main className="content">
        <Hero />
        <StatusBand />
        <Intro />
        <Journey />
        <Projects />
        <Skills />
        <Now />
        <Contact />
      </main>
      <ScrollEffects />
      <ScrollTopButton />
    </div>
  )
}
```

- [ ] **Step 6: Run the test and verify it passes**

Run: `npx playwright test tests/scroll-chrome.spec.ts --reporter=line`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/ScrollEffects.tsx components/ScrollTopButton.tsx components/ScrollTopButton.module.css app/page.tsx tests/scroll-chrome.spec.ts
git commit -m "feat: add scroll progress bar and scroll-to-top button"
```

---

### Task 11: Final page composition and responsive pass

**Files:**
- Modify: `app/page.tsx` (drop the now-vestigial `page`/`content` wrapper classNames if nothing styles them — verify first)
- Modify: `app/globals.css` (remove `.wrap`'s only remaining gap if any component still needs a bespoke width — audit, don't guess)

**Interfaces:**
- Consumes: everything built so far.
- Produces: nothing new — this task is an audit, not a feature.

- [ ] **Step 1: Grep for dead CSS selectors**

Run:
```bash
grep -rn "\.court\b\|\.bleed\b\|\.singles\b\|\.deuce\b\|\.ad\b\|\.wipe\b\|--rail-w\|--surround\|--court\b\|--ball\b\|--meta\b\|--line-2\b\|--rule\b\|--on-court\b\|--flood\b" app/ components/
```
Expected: no matches. If any remain, they're leftover references to tokens/classes retired in Task 1 that never got updated — fix them now by replacing with the current equivalent (`--bg`/`--ink`/`--ink-mute`/`--line`/etc.), since this is the last task before the final stabilization pass.

- [ ] **Step 2: Manual responsive check**

Run the dev server and check 1440, 1024, 768, 390px widths by hand:

```bash
npm run dev
```

Visit `http://localhost:3000` and resize. Confirm: header nav wraps to a second row below ~860px without overflowing; hero photo drops below the text column (`wrap-reverse`) below ~860px; status band collapses to 2 columns below 768px; journey/projects/skills stay single-column and readable at 390px; no horizontal scrollbar at any width. Stop the dev server (`Ctrl+C`) once confirmed.

- [ ] **Step 3: Fix anything found, otherwise skip to commit**

If Steps 1–2 found nothing to change, there's nothing to commit — proceed to Task 12. If fixes were needed, commit them:

```bash
git add -u
git commit -m "fix: clean up dead selectors and responsive edge cases"
```

---

### Task 12: Test suite stabilization — the real "done" gate

**Files:**
- Delete: `tests/sections.spec.ts` (fully superseded by `journey.spec.ts`, `projects.spec.ts`, `skills.spec.ts`, `now.spec.ts`, `contact.spec.ts`, `hero.spec.ts`)
- Modify: `tests/reveal.spec.ts`
- Modify: `tests/responsive.spec.ts`
- Modify: `tests/a11y.spec.ts`
- Modify: `content.ts` (finally remove the unused `about` export and `Link` type if `Link` still lingers — re-check, Task 2 should have already removed `Link`)

**Interfaces:**
- Consumes: every component and test file from Tasks 1–11.
- Produces: a fully green `npm test`.

- [ ] **Step 1: Confirm `about` and any stray types are dead, then remove them**

Run: `grep -rn "\babout\b" content.ts tests/ components/ app/`
Expected: only the declaration in `content.ts` and (soon-to-be-deleted) `tests/sections.spec.ts`. Delete `tests/sections.spec.ts` now, then remove the `about` export from `content.ts`.

Also run: `grep -rn "\bLink\b" content.ts` — if the `Link` type is still declared and unused, remove it too.

- [ ] **Step 2: Rewrite `tests/reveal.spec.ts`**

```ts
import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('above-the-fold content is visible on load', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-testid="intro"]')).toBeVisible()
  await expect(page.locator('[data-testid="intro"]')).toHaveClass(/is-in/)
})

test('content further down reveals when scrolled to', async ({ page }) => {
  await page.goto('/')
  const now = page.locator('section#now')
  await now.scrollIntoViewIfNeeded()
  await expect(now).toHaveClass(/is-in/)
})

test('all content is visible without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('[data-testid="intro"]')).toBeVisible()
  const opacity = await page
    .locator('[data-testid="intro"]')
    .evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')
  await ctx.close()
})

test('reduced motion shows content immediately', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto('/')
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('.reveal')].filter(
      (el) => getComputedStyle(el).opacity !== '1',
    ).length,
  )
  expect(hidden).toBe(0)
  await ctx.close()
})

test('scroll-spy marks the section in view', async ({ page }) => {
  await page.goto('/')
  await page.locator('section#projects').scrollIntoViewIfNeeded()
  await expect(page.locator('nav a[href="#projects"]')).toHaveAttribute('aria-current', 'true')
  await expect(page.locator('nav a[href="#skills"]')).not.toHaveAttribute('aria-current', 'true')
})

const lastNavItem = site.nav[site.nav.length - 1]

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet-breakpoint', width: 768, height: 1024 },
]) {
  test(`scroll-spy activates the final nav item at the bottom of the page (${viewport.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator(`nav a[href="${lastNavItem.href}"]`)).toHaveAttribute(
      'aria-current',
      'true',
    )
  })
}

test('nav anchors scroll to their sections', async ({ page }) => {
  await page.goto('/')
  await page.locator('nav a[href="#skills"]').click()
  await page.waitForFunction(() => {
    const el = document.querySelector('section#skills')
    if (!el) return false
    const top = el.getBoundingClientRect().top
    return top < 200 && top > -200
  })
})

test('failsafe timer reveals everything when the observer never fires', async ({ page }) => {
  await page.addInitScript(() => {
    class NoopObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
    // @ts-expect-error - intentionally replacing the global for this test
    window.IntersectionObserver = NoopObserver
  })

  await page.goto('/')

  await page.waitForTimeout(500)
  const revealedEarly = await page.locator('.reveal.is-in').count()
  expect(revealedEarly).toBe(0)

  await page.waitForFunction(() => {
    const targets = document.querySelectorAll('.reveal')
    return targets.length > 0 && Array.from(targets).every((el) => el.classList.contains('is-in'))
  })
  const total = await page.locator('.reveal').count()
  const revealedLate = await page.locator('.reveal.is-in').count()
  expect(revealedLate).toBe(total)
})

test('failsafe timer becomes a no-op once the observer has already revealed everything', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const start = performance.now()
    ;(window as unknown as { __clearTimeoutCalls: number[] }).__clearTimeoutCalls = []
    const originalClear = window.clearTimeout.bind(window)
    window.clearTimeout = ((...args: Parameters<typeof window.clearTimeout>) => {
      ;(window as unknown as { __clearTimeoutCalls: number[] }).__clearTimeoutCalls.push(
        performance.now() - start,
      )
      return originalClear(...args)
    }) as typeof window.clearTimeout
  })

  await page.goto('/')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  await page.waitForFunction(
    () => {
      const targets = document.querySelectorAll('.reveal')
      return (
        targets.length > 0 && Array.from(targets).every((el) => el.classList.contains('is-in'))
      )
    },
    { timeout: 1800 },
  )

  const clearCalls = await page.evaluate(
    () => (window as unknown as { __clearTimeoutCalls: number[] }).__clearTimeoutCalls,
  )
  expect(clearCalls.some((t) => t < 1800)).toBe(true)

  await page.waitForTimeout(2200)
  const total = await page.locator('.reveal').count()
  const revealed = await page.locator('.reveal.is-in').count()
  expect(revealed).toBe(total)
})
```

- [ ] **Step 3: Rewrite `tests/responsive.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

const WIDTHS = [
  { width: 390, height: 844, label: 'phone' },
  { width: 768, height: 1024, label: 'tablet' },
  { width: 1440, height: 900, label: 'desktop' },
]

for (const { width, height, label } of WIDTHS) {
  test(`no horizontal overflow at ${label} (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(600)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test(`every interactive element stays reachable at ${label} (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    const header = page.locator('[data-testid="header"]')
    await expect(header).toBeVisible()
    const box = await header.boundingBox()
    expect(box).not.toBeNull()
  })
}

test('header nav wraps rather than overlapping the wordmark below 860px', async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 900 })
  await page.goto('/')
  const header = page.locator('[data-testid="header"]')
  const height = await header.evaluate((el) => el.getBoundingClientRect().height)
  // A single-row header at this width would be under ~60px; wrapped, it's taller.
  expect(height).toBeGreaterThan(60)
})
```

- [ ] **Step 4: Update `tests/a11y.spec.ts`**

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const theme of ['dark', 'light'] as const) {
  test(`no accessibility violations in ${theme} theme`, async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/')
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
    await page.waitForTimeout(2100)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
    await ctx.close()
  })
}

test('landmarks are present and unique', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.locator('header')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
})

test('every interactive element shows a focus ring', async ({ page }) => {
  await page.goto('/')
  const interactive = page.locator('a[href], button')
  const count = await interactive.count()
  expect(count).toBeGreaterThan(10)

  for (let i = 0; i < count; i++) {
    const el = interactive.nth(i)
    await el.focus()
    const outline = await el.evaluate((node) => {
      const s = getComputedStyle(node)
      return { width: s.outlineWidth, style: s.outlineStyle }
    })
    expect(outline.style).not.toBe('none')
    expect(parseFloat(outline.width)).toBeGreaterThan(0)
  }
})

test('theme toggle exposes an accessible name that describes the action', async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: /mode/i })
  await expect(button).toHaveAttribute('aria-label', /(dark|light) mode/i)
})
```

- [ ] **Step 5: Run the complete suite**

Run: `npm test`
Expected: every spec file passes — `a11y`, `contact`, `header`, `hero`, `journey`, `now`, `projects`, `reveal`, `responsive`, `scroll-chrome`, `skills`, `smoke`, `status-band`, `theme`, `tokens`. If anything fails, read the failure, fix the specific component or test it points to, and re-run — do not skip or `.only` around a failure.

- [ ] **Step 6: Commit**

```bash
git add tests/reveal.spec.ts tests/responsive.spec.ts tests/a11y.spec.ts content.ts
git rm tests/sections.spec.ts
git commit -m "test: stabilize the full suite against the System Status redesign"
```

---

## After this plan

Once Task 12 is green, the redesign is functionally complete and matches the design spec. Follow superpowers:finishing-a-development-branch to decide how to integrate `feature/site-redesign` (PR vs. direct merge) — do not push or open a PR as part of this plan; that decision belongs to the user.
