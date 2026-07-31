# Portfolio Redesign (Night Match) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CV-like visual system with an art-directed portfolio built on tennis-court geometry and two lighting themes, keeping the content layer, static export and test suite intact.

**Architecture:** Tokens and a four-placement CSS grid derived from real court proportions land first, alongside the existing tokens so nothing breaks. Sections are then migrated one at a time, each swapping itself into `app/page.tsx` and updating its own tests. Legacy tokens and dead files are removed last, once nothing references them.

**Tech Stack:** Next.js 16.2.12 (App Router, `output: 'export'`), React 19.2.4, TypeScript, CSS Modules, `next/font/google`, Playwright + `@axe-core/playwright`.

## Global Constraints

- **Working directory is the worktree:** `/Users/shanerexsasikumar/Documents/Projects/portfolio/.claude/worktrees/portfolio-site`. All paths below are relative to it.
- **Read the Next.js docs before writing framework code.** `AGENTS.md` states this Next.js version has breaking changes versus training data. Consult `node_modules/next/dist/docs/` for anything touching `next/font`, metadata, or App Router conventions.
- **No new dependencies.** Nothing may be added to `package.json`.
- **No images.** `public/` stays empty. Floodlight, court lines and all ornament are CSS or inline SVG.
- **Every component is a server component** except `ThemeToggle` and `ScrollEffects`.
- **`content.ts` is the only file holding copy.** Tests derive assertions from it; never hardcode content strings in tests.
- **Abstraction rule:** no tennis vocabulary, iconography or match-play language in any user-visible string. Court geometry, colour and light only. Internal CSS class and token names may reference the court. **Two explicit, deliberate exceptions, both resolved with the human partner during planning — no others exist:**
  1. The theme toggle's visible label and accessible name read "Night match" / "Day match" (Task 6). This is the sole place the word "match" may appear as user-visible text.
  2. `site.thesis` (Task 3), rendered as the hero's only `<h1>` (Task 4): **"No dwelling on the last point."** Read as ordinary English — the takeaway, not sports jargon like "ace" or "match point" — and unchanged from every mockup shown during design. It is how the personal thread survives now that all other imagery is abstracted away; it must not be genericized, and it must not spread further tennis-adjacent phrasing into any other string.
- **Theme attribute values are `night` and `day`** on `<html data-theme>`, persisted to `localStorage` under `srs-theme`. Legacy values `dark`/`light` migrate to `night`/`day`.
- **Night is the first-visit default,** unconditionally. The OS `prefers-color-scheme` is not consulted.
- **Accessibility floor:** zero axe violations in both themes, visible keyboard focus, `prefers-reduced-motion` fully respected, interactive targets ≥44px.
- **Exact token values are defined in Task 1** and must be used verbatim thereafter.
- **The new primary-text token is named `--ink`, not `--line`.** It was renamed during Task 1's implementation because `--line` collides with the legacy hairline-divider token of the same name — same identifier, incompatible meaning (opaque text colour vs. translucent divider) and incompatible format (hex vs. rgba). The legacy `--line`/`--fg*`/`--bg`/`--accent` block must keep its original selector, `:root, [data-theme='light']` (bare `:root` included) — that inclusion is what lets legacy tokens keep resolving for not-yet-migrated components after Task 6 changes the `data-theme` attribute's value space to `night`/`day`. Do not narrow that selector and do not reintroduce a token named `--line` in the new system.

---

### Task 1: Design tokens, fonts and the contrast guard

**Files:**
- Modify: `app/globals.css` (add new token sets; leave existing `--fg*`/`--bg`/`--line*` in place)
- Modify: `app/layout.tsx`
- Modify: `design/tokens.css`
- Create: `tests/helpers/contrast.ts`
- Test: `tests/tokens.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties consumed by every later task — `--surround`, `--court`, `--court-tint`, `--ink`, `--line-2`, `--meta`, `--ball`, `--ball-ink`, `--on-court`, `--flood`, `--rule`, `--rule-strong`, `--t-*`, `--s-1`..`--s-11`, `--page-max`, `--gutter`, `--col-gap`, `--rail-w`, `--ease-cut`, `--ease-wipe`, `--dur-cut`, `--dur-wipe`, `--dur-hover`, `--dur-theme`. Also `contrastRatio(hexA, hexB): number` and `rgbToHex(cssRgb): string` from `tests/helpers/contrast.ts`.

- [ ] **Step 1: Write the failing contrast helper test**

Create `tests/helpers/contrast.ts` is Step 3. First write the test that drives it.

Add to `tests/tokens.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { contrastRatio, rgbToHex } from './helpers/contrast'

test('contrast helper matches known reference values', () => {
  // Black on white is exactly 21:1
  expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  // A colour against itself is exactly 1:1
  expect(contrastRatio('#DCF24B', '#DCF24B')).toBeCloseTo(1, 5)
  expect(rgbToHex('rgb(220, 242, 75)')).toBe('#DCF24B')
  expect(rgbToHex('rgba(6, 10, 17, 0.9)')).toBe('#060A11')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/tokens.spec.ts -g "contrast helper" --reporter=line`
Expected: FAIL — `Cannot find module './helpers/contrast'`

- [ ] **Step 3: Write the contrast helper**

Create `tests/helpers/contrast.ts`:

```ts
/** Relative luminance per WCAG 2.1, exact sRGB piecewise formula. */
export function relativeLuminance(hex: string): number {
  const n = hex.replace('#', '')
  const channels = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
  const linear = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  )
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** Normalises a computed CSS colour (`rgb(..)` or `rgba(..)`) to uppercase hex. */
export function rgbToHex(cssColour: string): string {
  const parts = cssColour.match(/[\d.]+/g)
  if (!parts || parts.length < 3) {
    throw new Error(`cannot parse colour: ${cssColour}`)
  }
  return (
    '#' +
    parts
      .slice(0, 3)
      .map((v) => Math.round(Number(v)).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx playwright test tests/tokens.spec.ts -g "contrast helper" --reporter=line`
Expected: PASS

- [ ] **Step 5: Write the failing palette tests**

Append to `tests/tokens.spec.ts`:

```ts
const NIGHT = {
  surround: '#060A11', court: '#0F3A63', courtTint: '#0A2440',
  ink: '#EEF3F8', line2: '#9DB0C6', meta: '#6E839B',
  ball: '#DCF24B', ballInk: '#DCF24B', onCourt: '#EEF3F8',
}
const DAY = {
  surround: '#EAEDF1', court: '#1F5A93', courtTint: '#3E7CB8',
  ink: '#0C1A2A', line2: '#3C4E63', meta: '#56677D',
  ball: '#DCF24B', ballInk: '#55670A', onCourt: '#F7F9FB',
}

async function palette(page: import('@playwright/test').Page, theme: 'night' | 'day') {
  await page.goto('/')
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
  return page.evaluate(() => {
    const s = getComputedStyle(document.documentElement)
    const read = (n: string) => s.getPropertyValue(n).trim()
    return {
      surround: read('--surround'), court: read('--court'), courtTint: read('--court-tint'),
      ink: read('--ink'), line2: read('--line-2'), meta: read('--meta'),
      ball: read('--ball'), ballInk: read('--ball-ink'), onCourt: read('--on-court'),
    }
  })
}

test('night palette resolves to the documented values', async ({ page }) => {
  expect(await palette(page, 'night')).toEqual(NIGHT)
})

test('day palette resolves to the documented values', async ({ page }) => {
  expect(await palette(page, 'day')).toEqual(DAY)
})

for (const [name, p] of [['night', NIGHT], ['day', DAY]] as const) {
  test(`${name} palette meets WCAG AA for every text pairing`, async () => {
    const pairs: [string, string, string][] = [
      ['line-2 on surround', p.line2, p.surround],
      ['meta on surround', p.meta, p.surround],
      ['ball-ink on surround', p.ballInk, p.surround],
      ['ink on surround', p.ink, p.surround],
      ['on-court on court', p.onCourt, p.court],
    ]
    for (const [label, fg, bg] of pairs) {
      expect(contrastRatio(fg, bg), `${name}: ${label}`).toBeGreaterThanOrEqual(4.5)
    }
  })
}

test('unsafe pairings are documented as failing, so nobody uses them for text', () => {
  // --ball on the day surround is effectively invisible. Day match must use --ball-ink.
  expect(contrastRatio(DAY.ball, DAY.surround)).toBeLessThan(2)
  // --court-tint is decorative in both themes.
  expect(contrastRatio(NIGHT.onCourt, NIGHT.courtTint)).toBeGreaterThanOrEqual(4.5)
  expect(contrastRatio(DAY.onCourt, DAY.courtTint)).toBeLessThan(4.5)
})
```

- [ ] **Step 6: Run to verify the palette tests fail**

Run: `npx playwright test tests/tokens.spec.ts --reporter=line`
Expected: FAIL — the `--surround` etc. properties resolve to empty strings.

- [ ] **Step 7: Add the token sets to `app/globals.css`**

Insert **above** the existing `:root` block, leaving the current `--fg*`, `--bg`, `--line`, `--line2`, `--accent` declarations untouched (later tasks migrate off them; Task 12 deletes them).

```css
/* ============ Redesign tokens ============ */
:root {
  /* Type */
  --t-hero:    clamp(44px, 9vw, 132px);   --lh-hero: .92;   --ls-hero: -.04em;
  --t-display: clamp(28px, 4vw, 46px);    --lh-display: 1.05; --ls-display: -.025em;
  --t-metric:  clamp(22px, 3.2vw, 38px);
  --t-h3:      20px;   --lh-h3: 1.3;
  --t-h4:      17px;   --lh-h4: 1.3;
  --t-lede:    clamp(19px, 2.2vw, 24px);  --lh-lede: 1.6;
  --t-body:    16px;   --lh-body: 1.7;
  --t-sm:      14.5px; --lh-sm: 1.6;
  --t-label:   12px;   --ls-label: .2em;
  --t-meta:    12.5px;

  /* Spacing */
  --s-1: 4px;  --s-2: 8px;   --s-3: 12px; --s-4: 16px;  --s-5: 24px; --s-6: 32px;
  --s-7: 48px; --s-8: 64px;  --s-9: 96px; --s-10: 128px; --s-11: 176px;

  /* Layout */
  --page-max: 1280px;
  --gutter:   clamp(20px, 4vw, 56px);
  --col-gap:  clamp(16px, 2.5vw, 32px);
  --rail-w:   clamp(112px, 10vw, 168px);

  /* Motion */
  --ease-cut:  cubic-bezier(.2, .9, .25, 1);
  --ease-wipe: cubic-bezier(.65, 0, .35, 1);
  --dur-cut:   380ms;
  --dur-wipe:  700ms;
  --dur-hover: 250ms;
  --dur-theme: 450ms;
}

:root,
[data-theme='night'] {
  color-scheme: dark;
  --surround:    #060A11;
  --court:       #0F3A63;
  --court-tint:  #0A2440;
  --ink:        #EEF3F8;
  --line-2:      #9DB0C6;
  --meta:        #6E839B;
  --ball:        #DCF24B;
  --ball-ink:    #DCF24B;
  --on-court:    #EEF3F8;
  --flood:       rgba(255, 247, 225, .16);
  --rule:        rgba(238, 243, 248, .16);
  --rule-strong: rgba(238, 243, 248, .30);
}

[data-theme='day'] {
  color-scheme: light;
  --surround:    #EAEDF1;
  --court:       #1F5A93;
  --court-tint:  #3E7CB8;
  --ink:        #0C1A2A;
  --line-2:      #3C4E63;
  --meta:        #56677D;
  --ball:        #DCF24B;
  --ball-ink:    #55670A;
  --on-court:    #F7F9FB;
  --flood:       rgba(255, 250, 235, .70);
  --rule:        rgba(12, 26, 42, .14);
  --rule-strong: rgba(12, 26, 42, .28);
}
```

- [ ] **Step 8: Mirror the same block into `design/tokens.css`**

Replace the whole file contents with the Step 7 block plus this note at the top, so the handoff file stops describing the retired design:

```css
/* Source of truth is app/globals.css. This file mirrors it for design reference. */
```

- [ ] **Step 9: Add the Archivo width axis in `app/layout.tsx`**

Read `node_modules/next/dist/docs/` for the current `next/font/google` API before editing. The Archivo import must request the `wdth` axis so the hero can be set expanded:

```ts
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  axes: ['wdth'],
})
```

Leave the IBM Plex Sans and IBM Plex Mono imports unchanged.

- [ ] **Step 10: Run the full suite**

Run: `npm test`
Expected: PASS — the new token tests pass and all pre-existing tests still pass, because the legacy tokens are untouched.

- [ ] **Step 11: Commit**

```bash
git add app/globals.css app/layout.tsx design/tokens.css tests/helpers/contrast.ts tests/tokens.spec.ts
git commit -m "feat: add night/day design tokens and a WCAG contrast guard"
```

---

### Task 2: Court grid and background lines

**Files:**
- Modify: `app/globals.css`
- Create: `components/CourtLines.tsx`, `components/CourtLines.module.css`
- Modify: `app/page.tsx`
- Test: `tests/court.spec.ts`

**Interfaces:**
- Consumes: all tokens from Task 1.
- Produces: global classes `.court` (the grid), `.bleed`, `.singles`, `.deuce`, `.ad` (placements), and `<CourtLines />` — a default-exported server component taking no props, rendering a single fixed-position element with `data-testid="court-lines"`.

- [ ] **Step 1: Write the failing grid test**

Create `tests/court.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('the court grid uses real doubles-court proportions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  // Task 2 defines `.court` as a reusable grid system; no real content
  // consumes it yet (that starts with Hero in Task 3). Probe the rule
  // directly on a throwaway element so this test verifies the grid math
  // itself, independent of who applies the class.
  const cols = await page.evaluate(() => {
    const probe = document.createElement('div')
    probe.className = 'court'
    document.body.appendChild(probe)
    const value = getComputedStyle(probe).gridTemplateColumns
    probe.remove()
    return value
  })
  // getComputedStyle resolves fr tracks to absolute px strings (e.g. "148px");
  // Number() rejects the unit suffix and yields NaN, so use parseFloat.
  const widths = cols.split(' ').map(parseFloat)
  expect(widths).toHaveLength(4)
  // 1fr 3fr 3fr 1fr — the alleys are one third of the service boxes
  expect(widths[1] / widths[0]).toBeCloseTo(3, 1)
  expect(widths[2] / widths[3]).toBeCloseTo(3, 1)
  expect(widths[0]).toBeCloseTo(widths[3], 0)
})

test('court lines render behind content and are decorative', async ({ page }) => {
  await page.goto('/')
  const lines = page.locator('[data-testid="court-lines"]')
  await expect(lines).toHaveCount(1)
  await expect(lines).toHaveAttribute('aria-hidden', 'true')
  const position = await lines.evaluate((el) => getComputedStyle(el).position)
  expect(position).toBe('fixed')
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test tests/court.spec.ts --reporter=line`
Expected: FAIL — the `.court` rule doesn't exist yet, so the probe's `gridTemplateColumns` doesn't resolve to four tracks.

- [ ] **Step 3: Add the grid to `app/globals.css`**

```css
/* ============ Court grid ============ */
.court {
  display: grid;
  grid-template-columns: 1fr 3fr 3fr 1fr;
  column-gap: var(--col-gap);
  max-width: var(--page-max);
  margin: 0 auto;
  padding-inline: var(--gutter);
}

.bleed   { grid-column: 1 / -1; }
.singles { grid-column: 2 / 4; }
.deuce   { grid-column: 1 / 3; }
.ad      { grid-column: 3 / -1; }

@media (max-width: 1023px) {
  .deuce, .ad { grid-column: 2 / 4; }
}

@media (max-width: 767px) {
  .court { grid-template-columns: 1fr; }
  .bleed, .singles, .deuce, .ad { grid-column: 1 / -1; }
}
```

- [ ] **Step 4: Write `components/CourtLines.module.css`**

Five vertical hairlines at the court's line positions, plus the floodlight bloom. Rendered with gradients so there is one DOM node, not six.

```css
.lines {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.lines::before {
  content: '';
  position: absolute;
  inset: 0;
  max-width: var(--page-max);
  margin: 0 auto;
  background-image:
    linear-gradient(to right, var(--rule) 1px, transparent 1px),
    linear-gradient(to right, var(--rule) 1px, transparent 1px),
    linear-gradient(to right, var(--rule-strong) 1px, transparent 1px),
    linear-gradient(to right, var(--rule) 1px, transparent 1px),
    linear-gradient(to right, var(--rule) 1px, transparent 1px);
  background-repeat: no-repeat;
  background-size: 1px 100%;
  background-position: 0% 0, 12.5% 0, 50% 0, 87.5% 0, 100% 0;
}

.lines::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(60% 50% at 22% -6%, var(--flood), transparent 70%),
    radial-gradient(50% 42% at 88% 2%, var(--flood), transparent 72%);
}

/* Three lines below 768px — five is noise at phone widths. */
@media (max-width: 767px) {
  .lines::before {
    background-image:
      linear-gradient(to right, var(--rule) 1px, transparent 1px),
      linear-gradient(to right, var(--rule-strong) 1px, transparent 1px),
      linear-gradient(to right, var(--rule) 1px, transparent 1px);
    background-position: 0% 0, 50% 0, 100% 0;
  }
}
```

- [ ] **Step 5: Write `components/CourtLines.tsx`**

```tsx
import styles from './CourtLines.module.css'

export default function CourtLines() {
  return <div className={styles.lines} data-testid="court-lines" aria-hidden="true" />
}
```

- [ ] **Step 6: Add the first two beats of the load sequence**

The spec's sequence opens with the floodlight and the court lines, both of which live here rather than on `Hero`. Append to `components/CourtLines.module.css`:

```css
@media (prefers-reduced-motion: no-preference) {
  /* Beat 1 — floodlight blooms up, 0ms */
  .lines::after {
    animation: bloom 700ms var(--ease-cut) backwards;
  }

  /* Beat 2 — court lines draw down from the top, 150ms */
  .lines::before {
    animation: drop 600ms var(--ease-cut) 150ms backwards;
    transform-origin: top center;
  }
}

@keyframes bloom {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes drop {
  from { transform: scaleY(0); opacity: 0; }
  to   { transform: scaleY(1); opacity: 1; }
}
```

The five lines share one gradient-painted pseudo-element, so they draw as a single sweep rather than the 60ms per-line stagger the spec describes. That is a deliberate trade: staggering would need five DOM nodes for a difference nobody consciously registers. Note it in the commit message.

- [ ] **Step 7: Verify reduced motion leaves the lines fully drawn**

Add to `tests/court.spec.ts`:

```ts
test('with reduced motion the court lines are drawn immediately', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  const name = await page
    .locator('[data-testid="court-lines"]')
    .evaluate((el) => getComputedStyle(el, '::before').animationName)
  expect(name).toBe('none')
  await context.close()
})
```

Run: `npx playwright test tests/court.spec.ts --reporter=line`
Expected: PASS

- [ ] **Step 8: Mount it and give content a stacking context in `app/page.tsx`**

Render `<CourtLines />` as the first child of the page wrapper, and wrap the existing `<main>` content so it sits above:

```tsx
import CourtLines from '@/components/CourtLines'
```

Add `position: relative; z-index: 1;` to the `.content` rule in `app/globals.css` so content paints over the lines.

- [ ] **Step 9: Run the tests**

Run: `npx playwright test tests/court.spec.ts --reporter=line`
Expected: PASS

- [ ] **Step 10: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add app/globals.css app/page.tsx components/CourtLines.tsx components/CourtLines.module.css tests/court.spec.ts
git commit -m "feat: add the court grid and background court lines"
```

---

### Task 3: Content layer — thesis and metrics

**Files:**
- Modify: `content.ts`
- Test: `tests/sections.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `site.thesis: string`, `site.metrics: Metric[]` where `type Metric = { figure: string; label: string }`, and an edited `site.lede` with the tennis sentence removed. Consumed by Tasks 4, 5 and 7.

- [ ] **Step 1: Write the failing content test**

Add to `tests/sections.spec.ts`:

```ts
test('thesis is a single short line and no longer duplicated in the lede', () => {
  expect(site.thesis.length).toBeGreaterThan(0)
  expect(site.thesis.length).toBeLessThanOrEqual(60)
  expect(site.lede).not.toContain('last point')
})

test('every metric figure is a non-empty short string with a label', () => {
  expect(site.metrics).toHaveLength(4)
  for (const metric of site.metrics) {
    expect(metric.figure.length).toBeGreaterThan(0)
    expect(metric.figure.length).toBeLessThanOrEqual(10)
    expect(metric.label.length).toBeGreaterThan(0)
  }
})
```

Update the existing import at the top of the file to pull `site` if it is not already imported.

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test tests/sections.spec.ts -g "thesis" --reporter=line`
Expected: FAIL — `site.thesis` is undefined.

- [ ] **Step 3: Edit `content.ts`**

Add the `Metric` type beside the other exported types:

```ts
export type Metric = { figure: string; label: string }
```

Inside the `site` object, add `thesis` immediately after `name`, and `metrics` after `availability`. Replace the `lede` value with the same text minus its final sentence:

```ts
  thesis: 'No dwelling on the last point.',
  lede:
    "I'm an engineer who cares as much about how I build as what I ship. By profession I build event-driven backends on Java, Spring Boot and GCP. The rest of my time keeps turning into the same question, answered differently. A rough stretch of AI-assisted coding became a spec-driven workflow, now running across my team. That workflow turned into two side builds of my own: a file upload API and a full site rebuild.",
  metrics: [
    { figure: '300K+', label: 'requests a day' },
    { figure: '99.99%', label: 'delivery reliability' },
    { figure: '3M+', label: 'records migrated live' },
    { figure: '6s → 1s', label: 'API response time' },
  ] satisfies Metric[],
```

- [ ] **Step 4: Run the tests**

Run: `npx playwright test tests/sections.spec.ts --reporter=line`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add content.ts tests/sections.spec.ts
git commit -m "feat: add thesis line and impact metrics to the content layer"
```

---

### Task 4: Hero

**Files:**
- Create: `components/Hero.tsx`, `components/Hero.module.css`
- Modify: `app/page.tsx`, `app/globals.css`
- Test: `tests/hero.spec.ts`

**Interfaces:**
- Consumes: `site.thesis`, `site.name`, `site.blurb` from Task 3; tokens from Task 1; `.court`/`.bleed` from Task 2.
- Produces: `<Hero />` — default-exported server component, no props, rendering `<section id="hero">` with the thesis inside the page's only `<h1>`.

- [ ] **Step 1: Write the failing hero test**

Create `tests/hero.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('hero fills the viewport and states the thesis as the only h1', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const hero = page.locator('section#hero')
  await expect(hero).toHaveCount(1)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toContainText(site.thesis)
  const box = await hero.boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(850)
})

test('hero names Shane and his role above the fold', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('section#hero')
  await expect(hero).toContainText(site.name.join(' '))
  await expect(hero).toContainText('Senior Software Engineer')
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

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test tests/hero.spec.ts --reporter=line`
Expected: FAIL — `section#hero` not found.

- [ ] **Step 3: Write `components/Hero.module.css`**

The load sequence is pure CSS `animation-delay`, so `Hero` ships no JavaScript.

```css
.hero {
  min-height: 100dvh;
  display: grid;
  align-content: space-between;
  padding-block: var(--s-7) var(--s-6);
  position: relative;
  z-index: 1;
}

.name {
  font-family: var(--font-mono);
  font-size: var(--t-meta);
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--meta);
  margin: 0;
}

.thesis {
  font-family: var(--font-display);
  font-variation-settings: 'wdth' 112, 'wght' 800;
  font-size: var(--t-hero);
  line-height: var(--lh-hero);
  letter-spacing: var(--ls-hero);
  text-transform: uppercase;
  color: var(--ink);
  margin: 0;
  text-wrap: balance;
}

.rule {
  width: 96px;
  height: 4px;
  background: var(--ball);
  margin: var(--s-5) 0 var(--s-4);
  transform-origin: left center;
}

.role {
  font-size: var(--t-lede);
  line-height: var(--lh-lede);
  color: var(--line-2);
  margin: 0;
  max-width: 46ch;
}

.role strong { color: var(--ink); font-weight: 600; }

.cue {
  font-family: var(--font-mono);
  font-size: var(--t-meta);
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--meta);
}

/* ---- Load sequence: floodlight is on CourtLines; here the type arrives ---- */
@media (prefers-reduced-motion: no-preference) {
  .name, .thesis, .role, .cue { animation: rise 500ms var(--ease-cut) backwards; }
  .name   { animation-delay: 450ms; }
  .thesis { animation-delay: 530ms; }
  .rule   { animation: draw 400ms var(--ease-cut) 900ms backwards; }
  .role   { animation-delay: 1150ms; }
  .cue    { animation-delay: 1150ms; }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: none; }
}

@keyframes draw {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

- [ ] **Step 4: Write `components/Hero.tsx`**

```tsx
import { site } from '@/content'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section id="hero" className={`court ${styles.hero}`}>
      <p className={`bleed ${styles.name}`}>{site.name.join(' ')}</p>
      <div className="bleed">
        <h1 className={styles.thesis}>{site.thesis}</h1>
        <div className={styles.rule} />
        <p className={styles.role}>
          <strong>Senior Software Engineer</strong> — {site.blurb.replace('Senior Software Engineer building', 'building')}
        </p>
      </div>
      <p className={`bleed ${styles.cue}`}>Scroll</p>
    </section>
  )
}
```

- [ ] **Step 5: Mount the hero in `app/page.tsx`**

Render `<Hero />` as the first child inside `<main>`, above the existing `.lede` paragraph.

- [ ] **Step 6: Run the hero tests**

Run: `npx playwright test tests/hero.spec.ts --reporter=line`
Expected: PASS

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add components/Hero.tsx components/Hero.module.css app/page.tsx tests/hero.spec.ts
git commit -m "feat: add the full-viewport hero with a CSS-only load sequence"
```

---

### Task 5: Impact band and the wipe reveal

**Files:**
- Create: `components/ImpactBand.tsx`, `components/ImpactBand.module.css`
- Modify: `components/ScrollEffects.tsx`, `app/globals.css`, `app/page.tsx`, `app/layout.tsx`
- Test: `tests/impact.spec.ts`

**Interfaces:**
- Consumes: `site.metrics` from Task 3.
- Produces: `<ImpactBand />` — default-exported server component, no props. Extends the observer contract: `ScrollEffects` now observes `.reveal, .wipe` and adds `.is-in` to both.

- [ ] **Step 1: Write the failing impact test**

Create `tests/impact.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('impact band renders every metric with its label', async ({ page }) => {
  await page.goto('/')
  const band = page.locator('[data-testid="impact-band"]')
  await band.scrollIntoViewIfNeeded()
  for (const metric of site.metrics) {
    await expect(band).toContainText(metric.figure)
    await expect(band).toContainText(metric.label)
  }
})

test('impact band wipes in once scrolled into view', async ({ page }) => {
  await page.goto('/')
  const band = page.locator('[data-testid="impact-band"]')
  await band.scrollIntoViewIfNeeded()
  await expect(band).toHaveClass(/is-in/)
})

test('with reduced motion the band is fully revealed without wiping', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  const clip = await page
    .locator('[data-testid="impact-band"]')
    .evaluate((el) => getComputedStyle(el).clipPath)
  expect(['none', 'inset(0px)']).toContain(clip)
  await context.close()
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test tests/impact.spec.ts --reporter=line`
Expected: FAIL — no `impact-band` element.

- [ ] **Step 3: Write `components/ImpactBand.module.css`**

```css
.band {
  background: var(--court);
  color: var(--on-court);
  padding-block: var(--s-6);
  margin-block: var(--s-8);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s-5);
  margin: 0;
  padding: 0;
}

.figure {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: var(--t-metric);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  color: var(--ball);
  display: block;
}

.label {
  font-family: var(--font-mono);
  font-size: var(--t-meta);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--on-court);
  opacity: .8;
  display: block;
  margin-top: var(--s-2);
}

@media (max-width: 767px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
```

Note: `--ball` on `--court` clears AA in both themes (9.3:1 night, and day's `--court` is the darkened `#1F5A93`). This is the one place `--ball` carries text in day match, and it is safe because the background is `--court`, not `--surround`.

- [ ] **Step 4: Add the wipe to `app/globals.css`**

```css
.wipe {
  clip-path: inset(0 100% 0 0);
  transition: clip-path var(--dur-wipe) var(--ease-wipe);
}

.wipe.is-in { clip-path: inset(0 0 0 0); }

@media (prefers-reduced-motion: reduce) {
  .wipe { clip-path: none; transition: none; }
}
```

Also update the existing `.reveal` rule to use the new motion tokens:

```css
.reveal {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity var(--dur-cut) var(--ease-cut), transform var(--dur-cut) var(--ease-cut);
}
```

- [ ] **Step 5: Write `components/ImpactBand.tsx`**

The band does not use `.court`. Four equal metrics do not map onto the `1fr 3fr 3fr 1fr` court columns, so `.grid` carries its own four-column grid (Step 3) and matches the court container's width itself.

Add these three lines to `.grid` in `components/ImpactBand.module.css`:

```css
  max-width: var(--page-max);
  margin-inline: auto;
  padding-inline: var(--gutter);
```

Then create `components/ImpactBand.tsx`:

```tsx
import { site } from '@/content'
import styles from './ImpactBand.module.css'

export default function ImpactBand() {
  return (
    <div className={`${styles.band} wipe`} data-testid="impact-band">
      <dl className={styles.grid}>
        {site.metrics.map((metric) => (
          <div key={metric.label}>
            <dt className={styles.figure}>{metric.figure}</dt>
            <dd className={styles.label}>{metric.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
```

Note the `<dd>` needs `margin-inline-start: 0` to cancel the browser default — add it to `.label` in Step 3's stylesheet.

- [ ] **Step 6: Extend the observer in `components/ScrollEffects.tsx`**

Change the reveal query selector from `.reveal` to `.reveal, .wipe`, leaving the `.is-in` class, the `rootMargin`/`threshold` options, the unobserve-on-enter behaviour and the 2s failsafe timer exactly as they are. The failsafe must also add `.is-in` to `.wipe` elements.

- [ ] **Step 7: Extend the `<noscript>` block in `app/layout.tsx`**

```html
<noscript>
  <style>{`
    .reveal { opacity: 1 !important; transform: none !important; }
    .wipe { clip-path: none !important; }
  `}</style>
</noscript>
```

- [ ] **Step 8: Mount the band in `app/page.tsx`**

Render `<ImpactBand />` immediately after `<Hero />`, before the lede.

- [ ] **Step 9: Run the tests**

Run: `npx playwright test tests/impact.spec.ts --reporter=line`
Expected: PASS

- [ ] **Step 10: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add components/ImpactBand.tsx components/ImpactBand.module.css components/ScrollEffects.tsx app/globals.css app/layout.tsx app/page.tsx tests/impact.spec.ts
git commit -m "feat: add the impact band with a wipe reveal"
```

---

### Task 6: Rail and theme toggle

**Files:**
- Create: `components/Rail.tsx`, `components/Rail.module.css`
- Modify: `components/ThemeToggle.tsx`, `components/ThemeToggle.module.css`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Delete: `components/Sidebar.tsx`, `components/Sidebar.module.css`
- Rename: `tests/sidebar.spec.ts` → `tests/rail.spec.ts`
- Test: `tests/rail.spec.ts`, `tests/theme.spec.ts`

**Interfaces:**
- Consumes: `site.name`, `site.nav`, `site.links`, `site.email`, `site.location` from `content.ts`.
- Produces: `<Rail />` — default-exported server component, no props, rendering `<nav aria-label="Sections">` with one anchor per `site.nav` entry, each carrying `data-nav-tick`. Replaces `<Sidebar />` everywhere.

- [ ] **Step 1: Write the failing rail test**

Rename the file first: `git mv tests/sidebar.spec.ts tests/rail.spec.ts`. Replace its contents:

```ts
import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('rail shows the name, every nav target and the email', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const rail = page.locator('[data-testid="rail"]')
  await expect(rail).toContainText(site.name[0])
  for (const item of site.nav) {
    await expect(rail.locator(`a[href="${item.href}"]`)).toHaveCount(1)
  }
  await expect(rail.locator('a[href^="mailto:"]')).toHaveCount(1)
})

test('rail is a fixed left column on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const box = await page.locator('[data-testid="rail"]').boundingBox()
  expect(box!.x).toBeLessThan(40)
  expect(box!.height).toBeGreaterThan(400)
})

test('rail becomes a bottom bar below 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 800 })
  await page.goto('/')
  const box = await page.locator('[data-testid="rail"]').boundingBox()
  expect(box!.height).toBeLessThan(80)
  expect(box!.y).toBeGreaterThan(700)
  // Contact stays reachable at every width
  await expect(page.locator('[data-testid="rail"] a[href^="mailto:"]')).toHaveCount(1)
})

test('external rail links are safe', async ({ page }) => {
  await page.goto('/')
  for (const link of site.links) {
    if (!link.href.startsWith('http')) continue
    const anchor = page.locator(`a[href="${link.href}"]`).first()
    await expect(anchor).toHaveAttribute('rel', /noreferrer/)
    await expect(anchor).toHaveAttribute('target', '_blank')
  }
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test tests/rail.spec.ts --reporter=line`
Expected: FAIL — no `rail` element.

- [ ] **Step 3: Write `components/Rail.module.css`**

```css
.rail {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--rail-w);
  z-index: 3;
  box-sizing: border-box;
  padding: var(--s-5) var(--s-4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--s-5);
  border-right: 1px solid var(--rule);
  background: var(--surround);
}

.name {
  font-family: var(--font-display);
  font-variation-settings: 'wght' 800;
  font-size: 15px;
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: -.01em;
  color: var(--ink);
}

.nav { display: flex; flex-direction: column; gap: var(--s-3); }

.tick {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  font-family: var(--font-mono);
  font-size: var(--t-meta);
  color: var(--meta);
  transition: color var(--dur-hover) var(--ease-cut);
}

.tick::before {
  content: '';
  width: 14px;
  height: 1px;
  background: var(--rule-strong);
  flex: none;
  transition: width var(--dur-hover) var(--ease-cut), background var(--dur-hover) var(--ease-cut);
}

.tick:hover,
.tick[aria-current='true'] { color: var(--ink); }

.tick[aria-current='true']::before { width: 26px; background: var(--ball); }

.foot { display: flex; flex-direction: column; gap: var(--s-3); }

.email {
  font-family: var(--font-mono);
  font-size: var(--t-meta);
  color: var(--ink);
  word-break: break-all;
}

.links { display: flex; flex-wrap: wrap; gap: var(--s-3); font-size: 13px; }
.link { color: var(--meta); transition: color var(--dur-hover) var(--ease-cut); }
.link:hover { color: var(--ink); }

/* ---- Bottom bar below 1024px ---- */
@media (max-width: 1023px) {
  .rail {
    top: auto;
    right: 0;
    width: auto;
    height: 56px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-inline: var(--gutter);
    border-right: none;
    border-top: 1px solid var(--rule);
  }

  .nav, .name, .links { display: none; }
  .foot { flex-direction: row; align-items: center; gap: var(--s-4); }
  .email { min-height: 44px; display: inline-flex; align-items: center; }
}
```

- [ ] **Step 4: Write `components/Rail.tsx`**

```tsx
import { site } from '@/content'
import ThemeToggle from './ThemeToggle'
import styles from './Rail.module.css'

export default function Rail() {
  return (
    <div className={styles.rail} data-testid="rail">
      <p className={styles.name}>
        {site.name[0]}
        <br />
        {site.name[1]}
      </p>

      <nav className={styles.nav} aria-label="Sections">
        {site.nav.map((item) => (
          <a key={item.href} className={styles.tick} href={item.href} data-nav-tick>
            {item.label}
          </a>
        ))}
      </nav>

      <div className={styles.foot}>
        <a className={styles.email} href={`mailto:${site.email}`}>
          {site.email}
        </a>
        <div className={styles.links}>
          {site.links.map((link) => (
            <a
              key={link.href}
              className={styles.link}
              href={link.href}
              {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {link.label}
            </a>
          ))}
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Reserve space for the rail in `app/globals.css`**

```css
body { padding-bottom: 56px; }

@media (min-width: 1024px) {
  body { padding-bottom: 0; padding-left: var(--rail-w); }
}
```

- [ ] **Step 6: Swap Sidebar for Rail and delete the old component**

In `app/page.tsx` replace `<Sidebar />` with `<Rail />` and drop the import. Then:

```bash
git rm components/Sidebar.tsx components/Sidebar.module.css
```

- [ ] **Step 7: Update `ThemeToggle` for night/day**

Change the two labels to `Night match` and `Day match`, and the stored/applied values from `light`/`dark` to `day`/`night`. Keep the `localStorage` key `srs-theme` and the accessible button label pattern (`Switch to day match`).

- [ ] **Step 8: Update the pre-paint script in `app/layout.tsx`**

Night is the unconditional first-visit default, and legacy stored values migrate:

```js
(function () {
  try {
    var stored = localStorage.getItem('srs-theme')
    if (stored === 'light') stored = 'day'
    if (stored === 'dark') stored = 'night'
    var theme = stored === 'day' || stored === 'night' ? stored : 'night'
    document.documentElement.setAttribute('data-theme', theme)
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'night')
  }
})()
```

- [ ] **Step 9: Update `tests/theme.spec.ts`**

Replace the two OS-preference tests with the new default behaviour, and keep the persistence and pre-paint tests, updating their expected values:

```ts
test('defaults to night match on a first visit, regardless of OS preference', async ({ browser }) => {
  for (const colorScheme of ['dark', 'light'] as const) {
    const context = await browser.newContext({ colorScheme })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
    await context.close()
  }
})

test('a legacy stored theme migrates to the new names', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('srs-theme', 'light'))
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
})
```

- [ ] **Step 10: Run the rail and theme tests**

Run: `npx playwright test tests/rail.spec.ts tests/theme.spec.ts --reporter=line`
Expected: PASS

- [ ] **Step 11: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: replace the sidebar with a persistent rail and night/day toggle"
```

---

### Task 7: Intro and Experience

**Files:**
- Create: `components/Intro.tsx`, `components/Intro.module.css`
- Modify: `components/Experience.tsx`, `components/Experience.module.css`, `components/SectionLabel.tsx`, `components/SectionLabel.module.css`, `app/page.tsx`, `app/globals.css`
- Test: `tests/sections.spec.ts`

**Interfaces:**
- Consumes: `site.lede`, `experience` from `content.ts`; `.court`/`.singles`/`.deuce` from Task 2.
- Produces: `<Intro />` — default-exported server component, no props.

- [ ] **Step 1: Write the failing test**

Add to `tests/sections.spec.ts`:

```ts
test('intro renders the lede in the reading column', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const intro = page.locator('[data-testid="intro"]')
  await expect(intro).toHaveText(site.lede)
})

test('experience entries keep their dates alongside each title', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#experience')
  for (const role of experience) {
    await expect(section).toContainText(role.title)
    await expect(section).toContainText(role.dates)
    for (const bullet of role.bullets) {
      await expect(section).toContainText(bullet)
    }
  }
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test tests/sections.spec.ts -g "intro renders" --reporter=line`
Expected: FAIL — no `intro` element.

- [ ] **Step 3: Restyle `SectionLabel.module.css`**

```css
.label {
  font-family: var(--font-mono);
  font-size: var(--t-label);
  font-weight: 500;
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--ball-ink);
  line-height: 1;
  margin: 0 0 var(--s-5);
}
```

- [ ] **Step 4: Write `components/Intro.module.css` and `components/Intro.tsx`**

```css
.lede {
  font-size: var(--t-lede);
  line-height: var(--lh-lede);
  color: var(--line-2);
  text-wrap: pretty;
  margin: 0;
}
```

```tsx
import { site } from '@/content'
import styles from './Intro.module.css'

export default function Intro() {
  return (
    <section className="court">
      <p className={`singles reveal ${styles.lede}`} data-testid="intro">
        {site.lede}
      </p>
    </section>
  )
}
```

- [ ] **Step 5: Restyle Experience**

Replace `components/Experience.module.css`:

```css
.entry { margin-bottom: var(--s-8); }
.entry:last-child { margin-bottom: 0; }

.dates {
  font-family: var(--font-mono);
  font-size: var(--t-meta);
  line-height: 1.4;
  color: var(--meta);
}

.title {
  font-family: var(--font-display);
  font-variation-settings: 'wght' 700;
  font-size: var(--t-h3);
  line-height: var(--lh-h3);
  color: var(--ink);
  margin: 0;
}

.company {
  font-size: var(--t-sm);
  line-height: 1.5;
  color: var(--line-2);
  margin: var(--s-1) 0 0;
}

.bullets {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  margin: var(--s-4) 0 0;
  padding: 0;
  list-style: none;
  font-size: var(--t-body);
  line-height: var(--lh-body);
  color: var(--line-2);
}

.metric {
  font-family: var(--font-mono);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--ball-ink);
}

@media (max-width: 1023px) {
  .dates { margin-bottom: var(--s-2); display: block; }
}
```

In `components/Experience.tsx`, wrap the section in `.court`, place `.dates` in the left alley (`grid-column: 1 / 2` via a `deuceAlley` class or by rendering dates as a `<div className={styles.dates}>` positioned in column 1) and the title/company/bullets in `.singles`. Keep the existing metric-highlighting logic and the `reveal` class per entry unchanged.

- [ ] **Step 6: Mount `<Intro />` in `app/page.tsx`**

Replace the inline `<p className="lede reveal">{site.lede}</p>` with `<Intro />`. Remove the now-unused `.lede` rule from `app/globals.css`.

- [ ] **Step 7: Run the tests**

Run: `npx playwright test tests/sections.spec.ts --reporter=line`
Expected: PASS

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: restyle intro and experience onto the court grid"
```

---

### Task 8: Projects

**Files:**
- Modify: `components/Projects.tsx`, `components/Projects.module.css`
- Test: `tests/sections.spec.ts`

**Interfaces:**
- Consumes: `projects` from `content.ts`; `.court`/`.deuce`/`.ad` from Task 2.
- Produces: nothing new.

- [ ] **Step 1: Write the failing test**

Add to `tests/sections.spec.ts`:

```ts
test('projects alternate across the court', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const rows = page.locator('section#projects [data-project]')
  await expect(rows).toHaveCount(projects.length)
  const first = await rows.nth(0).boundingBox()
  const second = await rows.nth(1).boundingBox()
  // Odd-indexed projects sit on the ad court, right of the centre line
  expect(second!.x).toBeGreaterThan(first!.x)
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test tests/sections.spec.ts -g "alternate across" --reporter=line`
Expected: FAIL — no `data-project` attribute.

- [ ] **Step 3: Restyle `components/Projects.module.css`**

```css
.row {
  display: block;
  padding: var(--s-5) 0 var(--s-5) var(--s-4);
  border-left: 1px solid var(--rule);
  color: inherit;
  transition: border-color var(--dur-hover) var(--ease-cut),
              transform var(--dur-hover) var(--ease-cut);
}

.row:hover {
  border-color: var(--ball);
  transform: translateX(6px);
}

.header { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s-3); }

.name {
  font-family: var(--font-display);
  font-variation-settings: 'wght' 700;
  font-size: var(--t-h4);
  line-height: var(--lh-h4);
  color: var(--ink);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: var(--t-meta);
  line-height: 1;
}

.status[data-status='in-progress'] { color: var(--ball-ink); }
.status[data-status='completed'] { color: var(--meta); }

.dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }

.status[data-status='in-progress'] .dot { animation: status-pulse 2.4s ease-in-out infinite; }

@keyframes status-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }

.stack {
  font-family: var(--font-mono);
  font-size: var(--t-meta);
  line-height: 1;
  color: var(--meta);
  width: 100%;
}

.bullets {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  margin: var(--s-3) 0 0;
  padding: 0;
  list-style: none;
  font-size: var(--t-sm);
  line-height: var(--lh-sm);
  color: var(--line-2);
}

@media (prefers-reduced-motion: reduce) {
  .status[data-status='in-progress'] .dot { animation: none; }
  .row:hover { transform: none; }
}

@media (max-width: 767px) { .row { min-height: 44px; } }
```

- [ ] **Step 4: Alternate placement in `components/Projects.tsx`**

Wrap the mapped rows in `<div className="court">`, give each row `data-project` and alternate the placement class:

```tsx
const placement = i % 2 === 0 ? 'deuce' : 'ad'
```

Apply it as `className={`${placement} ${styles.row} reveal`}` on both the `<a>` and `<div>` branches, keeping the existing `transitionDelay` stagger and the external-link attributes unchanged.

- [ ] **Step 5: Run the tests**

Run: `npx playwright test tests/sections.spec.ts --reporter=line`
Expected: PASS

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add components/Projects.tsx components/Projects.module.css tests/sections.spec.ts
git commit -m "feat: alternate projects across the court grid"
```

---

### Task 9: Skills

**Files:**
- Modify: `components/Skills.module.css`, `components/Skills.tsx`
- Test: `tests/sections.spec.ts` (existing skills tests must keep passing unchanged)

**Interfaces:**
- Consumes: `skills` (with its existing `lead` count) from `content.ts`.
- Produces: nothing new. The lead/rest DOM structure is unchanged, so the two existing skills tests must pass without edits.

- [ ] **Step 1: Confirm the existing tests pass before touching anything**

Run: `npx playwright test tests/sections.spec.ts -g "skill" --reporter=line`
Expected: PASS (2 tests). These are the regression guard for this task.

- [ ] **Step 2: Repaint `components/Skills.module.css` onto the new tokens**

Only colour, type and spacing tokens change. The lead/rest structure, the trailing separators and the mobile stacking all stay.

```css
.groups { display: flex; flex-direction: column; gap: var(--s-6); }

.groupLabel {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: var(--t-meta);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--meta);
  margin: 0 0 var(--s-3);
}

.lead, .rest { display: flex; flex-wrap: wrap; margin: 0; padding: 0; list-style: none; }

.lead {
  align-items: baseline;
  column-gap: var(--s-4);
  row-gap: var(--s-2);
  font-family: var(--font-display);
  font-variation-settings: 'wght' 700;
  font-size: var(--t-h3);
  line-height: var(--lh-h3);
  letter-spacing: -.01em;
  color: var(--ink);
}

.lead li:not(:last-child) {
  border-right: 1px solid var(--rule-strong);
  padding-right: var(--s-4);
}

.rest {
  align-items: baseline;
  column-gap: var(--s-2);
  row-gap: 2px;
  margin-top: var(--s-3);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.75;
  color: var(--line-2);
}

.rest li:not(:last-child)::after {
  content: '·';
  margin-left: var(--s-2);
  color: var(--rule-strong);
}

@media (max-width: 767px) {
  .lead { flex-direction: column; align-items: flex-start; row-gap: 3px; font-size: var(--t-h4); }
  .lead li:not(:last-child) { border-right: none; padding-right: 0; }
}
```

- [ ] **Step 3: Put the section on the grid in `components/Skills.tsx`**

Add `court` to the `<section>` className and `singles` to the `.groups` wrapper. Change nothing else — the `lead`/`rest` split and `<li>` ordering must stay byte-identical in behaviour.

- [ ] **Step 4: Run the skills regression tests**

Run: `npx playwright test tests/sections.spec.ts -g "skill" --reporter=line`
Expected: PASS (2 tests, unedited)

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/Skills.tsx components/Skills.module.css
git commit -m "feat: repaint skills onto the night-match palette"
```

---

### Task 10: About and Contact

**Files:**
- Modify: `components/About.tsx`, `components/About.module.css`
- Create: `components/Contact.tsx`, `components/Contact.module.css`
- Modify: `app/page.tsx`
- Test: `tests/sections.spec.ts`

**Interfaces:**
- Consumes: `about`, `site.email`, `site.location`, `site.availability` from `content.ts`.
- Produces: `<Contact />` — default-exported server component, no props, rendering `<section id="contact">`.

- [ ] **Step 1: Write the failing test**

Add to `tests/sections.spec.ts`:

```ts
test('contact closes the page with the email at display size', async ({ page }) => {
  await page.goto('/')
  const contact = page.locator('section#contact')
  const email = contact.locator('a[href^="mailto:"]')
  await expect(email).toHaveCount(1)
  const size = await email.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  expect(size).toBeGreaterThanOrEqual(28)
  await expect(contact).toContainText(site.availability)
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test tests/sections.spec.ts -g "contact closes" --reporter=line`
Expected: FAIL — no `section#contact`.

- [ ] **Step 3: Restyle About**

```css
.body {
  font-size: var(--t-body);
  line-height: var(--lh-body);
  color: var(--line-2);
  text-wrap: pretty;
  margin: 0;
}
```

Remove the `.email` rule — contact now lives in its own section. In `components/About.tsx` drop the trailing email link, add `court` to the section and `deuce` to the paragraph wrapper.

- [ ] **Step 4: Write `components/Contact.module.css`**

```css
.contact {
  background: var(--court);
  color: var(--on-court);
  padding-block: var(--s-9);
  margin-top: var(--s-9);
}

.inner { display: flex; flex-direction: column; gap: var(--s-4); }

.email {
  font-family: var(--font-display);
  font-variation-settings: 'wdth' 100, 'wght' 700;
  font-size: var(--t-display);
  line-height: var(--lh-display);
  letter-spacing: var(--ls-display);
  color: var(--on-court);
  border-bottom: 2px solid var(--ball);
  padding-bottom: var(--s-2);
  align-self: flex-start;
  word-break: break-word;
  transition: color var(--dur-hover) var(--ease-cut);
}

.email:hover { color: var(--ball); }

.meta {
  font-family: var(--font-mono);
  font-size: var(--t-meta);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--on-court);
  opacity: .8;
  margin: 0;
}
```

- [ ] **Step 5: Write `components/Contact.tsx`**

```tsx
import { site } from '@/content'
import styles from './Contact.module.css'

export default function Contact() {
  return (
    <section id="contact" className={`${styles.contact} wipe`}>
      <div className="court">
        <div className={`singles ${styles.inner}`}>
          <a className={styles.email} href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <p className={styles.meta}>
            {site.location} — {site.availability}
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Mount it as the last element in `app/page.tsx`**

Render `<Contact />` after `<About />`, inside `<main>`.

- [ ] **Step 7: Run the tests**

Run: `npx playwright test tests/sections.spec.ts --reporter=line`
Expected: PASS

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add the contact close and restyle about"
```

---

### Task 11: Scroll-spy, reduced motion and failsafes

**Files:**
- Modify: `components/ScrollEffects.tsx`
- Test: `tests/reveal.spec.ts`

**Interfaces:**
- Consumes: `[data-nav-tick]` anchors from Task 6; `.reveal`/`.wipe` from Task 5.
- Produces: nothing new.

- [ ] **Step 1: Write the failing scroll-spy test**

Add to `tests/reveal.spec.ts`:

```ts
test('nav ticks track the section in view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.locator('section#projects').scrollIntoViewIfNeeded()
  await expect(page.locator('a[data-nav-tick][href="#projects"]')).toHaveAttribute(
    'aria-current',
    'true',
  )
  await expect(page.locator('a[data-nav-tick][href="#skills"]')).not.toHaveAttribute(
    'aria-current',
    'true',
  )
})

test('reduced motion renders every revealable element visible', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('.reveal')].filter(
      (el) => getComputedStyle(el).opacity !== '1',
    ).length,
  )
  expect(hidden).toBe(0)
  await context.close()
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx playwright test tests/reveal.spec.ts --reporter=line`
Expected: FAIL — scroll-spy still targets the removed sidebar selector.

- [ ] **Step 3: Point scroll-spy at the rail**

In `components/ScrollEffects.tsx`, change the nav lookup from the Sidebar's selector to `a[data-nav-tick]`, matching each anchor's `href` hash against the observed section `id`. Keep setting `aria-current="true"` on the active anchor and removing it from the rest. Keep the existing failsafe timer and its cancellation.

- [ ] **Step 4: Verify the two existing failsafe tests still pass**

Run: `npx playwright test tests/reveal.spec.ts --reporter=line`
Expected: PASS — including both pre-existing failsafe tests, unedited.

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/ScrollEffects.tsx tests/reveal.spec.ts
git commit -m "feat: point scroll-spy at the rail ticks"
```

---

### Task 12: Cleanup, responsive sweep and accessibility

**Files:**
- Modify: `app/globals.css`, `design/tokens.css`
- Delete: `app/page.module.css`
- Test: `tests/responsive.spec.ts`, `tests/a11y.spec.ts`

**Interfaces:**
- Consumes: everything above.
- Produces: nothing new.

- [ ] **Step 1: Write the failing responsive test**

Replace `tests/responsive.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

const WIDTHS = [
  { width: 390, height: 844, label: 'phone' },
  { width: 900, height: 800, label: 'tablet' },
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

  test(`content clears the rail at ${label} (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    const rail = await page.locator('[data-testid="rail"]').boundingBox()
    const heroText = await page.locator('h1').boundingBox()
    const overlaps =
      heroText!.x < rail!.x + rail!.width &&
      heroText!.x + heroText!.width > rail!.x &&
      heroText!.y < rail!.y + rail!.height &&
      heroText!.y + heroText!.height > rail!.y
    expect(overlaps).toBe(false)
  })
}
```

- [ ] **Step 2: Run to verify it fails or passes**

Run: `npx playwright test tests/responsive.spec.ts --reporter=line`
Expected: any failure here is a real layout bug — fix the CSS, do not weaken the test.

- [ ] **Step 3: Delete the dead scaffold**

`app/page.module.css` is `create-next-app` leftover and is imported by nothing. Confirm, then remove:

```bash
grep -rn "page.module" app components || echo "no references"
git rm app/page.module.css
```

- [ ] **Step 4: Remove the legacy token block**

Delete the old `--bg`, `--panel`, `--fg`, `--fg2`, `--fg3`, `--fg4`, `--fg5`, `--line`, `--line2`, `--hover`, `--accent`, `--line-faint` declarations and the old `--text-*`, `--sp-*`, `--sidebar-w`, `--content-*`, `--radius-*`, `--ease-out`, `--dur-reveal*`, `--reveal-offset` tokens from `app/globals.css`, plus the retired `.lede`, `.section`, `.sidebar`, `.page` rules and the old body background texture. Mirror the deletion in `design/tokens.css`.

- [ ] **Step 5: Verify nothing references a removed token**

```bash
grep -rnE "var\(--(fg[2-5]?|bg|panel|line2|hover|accent|line-faint|sp-[0-9]+|text-[a-z0-9-]+|radius-[a-z]+|dur-reveal|reveal-offset|ease-out|sidebar-w|content-max)\)" app components || echo "clean"
```

Expected: `clean`. Fix any hit before continuing.

- [ ] **Step 6: Run axe against both themes**

Confirm `tests/a11y.spec.ts` sets `data-theme` to `night` and `day` rather than `dark`/`light`, then run:

Run: `npx playwright test tests/a11y.spec.ts --reporter=line`
Expected: PASS — zero violations in both themes.

- [ ] **Step 7: Run the full suite and a production build**

```bash
npm test
npm run build
```

Expected: all tests pass; build completes and emits the static export.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: remove the retired token system and dead scaffold"
```

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: tokens and contrast → 1; court grid and lines → 2; content layer → 3; hero and its load sequence → 4; impact band, wipe, `<noscript>` → 5; rail, themes, night default, legacy migration → 6; intro, experience, section labels → 7; projects alternation → 8; skills → 9; about and contact → 10; scroll-spy, reduced motion, failsafes → 11; responsive table, cleanup, axe → 12.

**Known deviations from the spec, deliberate:**

- The spec's load sequence staggers the five court lines by 60ms each. Task 2 paints all five as gradients on one pseudo-element, so they draw as a single 600ms sweep. Staggering would require five DOM nodes to buy a difference nobody consciously registers. The 0ms bloom and 150ms line-draw timings are otherwise honoured.
- The impact band does not sit on the `.court` grid. Four equal metrics do not divide into `1fr 3fr 3fr 1fr`, so the band matches the court container's width and gutters while using its own four-column grid.

**Two issues found and fixed during this review:** the floodlight and court-line animations — the first two beats of the spec's load sequence — had no implementing step, and Task 5 shipped a wrong code block followed by a correction. Both are resolved above.

**Two more issues found and fixed while implementing Task 2's grid test:** first, the original test located `.court` on the live page (`page.locator('.court').first()`), but Task 2 is deliberately additive-only — no content consumes `.court` until Hero lands in Task 3 — so the locator timed out waiting for an element that doesn't exist yet at this checkpoint. Fixed by having the test create a throwaway probe element, apply `.court` to it, read its computed `gridTemplateColumns`, and remove it — this verifies the grid math itself rather than assuming premature consumption. Second, the test parsed track widths with `cols.split(' ').map(Number)`; `getComputedStyle` resolves `fr` tracks to absolute px strings (e.g. `"148px"`), and `Number("148px")` is `NaN` — only `parseFloat` strips the unit. Fixed by switching to `parseFloat`. Both fixes are reflected in Task 2's Step 1 code above and are test-only; no CSS or component code changed as a result.

**Type consistency.** `Metric` is defined once in Task 3 and consumed by name in Task 5. `site.thesis`, `site.lede`, `site.metrics` are referenced identically across Tasks 3, 4, 5 and 7. `data-testid` values (`court-lines`, `rail`, `intro`, `impact-band`) and `data-nav-tick` / `data-project` attributes are each introduced in one task and consumed by name in later ones. Placement classes `.bleed`/`.singles`/`.deuce`/`.ad` are defined in Task 2 and used unchanged thereafter.
