# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Shane Rex Sasikumar's single-page portfolio as a statically exported Next.js site that faithfully reproduces the handed-off design, deployed to Vercel.

**Architecture:** Next.js App Router with `output: 'export'` produces plain HTML/CSS. Every component is a server component except two isolated client components — `ThemeToggle` and `ScrollEffects`. All copy lives in a typed `content.ts` that Shane edits without touching markup. Styling is the handed-off `tokens.css` as a global stylesheet plus one CSS Module per component. Verification is Playwright end-to-end against the built static output, because that is what actually ships.

**Tech Stack:** Next.js (App Router, TypeScript), `next/font/google`, CSS Modules, Playwright, `serve` (static file server for tests).

## Global Constraints

These apply to every task. Do not restate, do not violate.

- **Design authority:** `design/README.md` is the authority on every colour, size, spacing, and transition value. When this plan and that README disagree, the README wins — stop and flag it.
- **Token file:** `design/tokens.css` is used essentially as-is. Exactly two edits are permitted, both specified in Task 2: the `color-scheme` fix and the font-family indirection. No other changes.
- **No imagery of any kind.** No photos, icons, logos, illustrations, or SVG decoration. The only non-text elements are 1px hairlines and one 8px circle in the theme toggle.
- **No accent colour. No shadows. No gradients.** Hierarchy comes from type scale and hairlines only.
- **Radii:** `99px` (pills) only.
- **Fonts:** Archivo 600; IBM Plex Sans 400; IBM Plex Mono 400 and 500. Nothing else. Self-hosted via `next/font/google`, never a runtime request to Google.
- **Colour role discipline:** `--fg5` is for ≥ 12px mono meta only (dates, stack tags, location). Never body copy.
- **Motion:** hovers change colour, border-colour, or `padding-left` only. No transforms, no scale, no shadows.
- **Theme storage key:** `srs-theme` in `localStorage`. Attribute is `data-theme="light" | "dark"` on `<html>`.
- **Reveal must never trap content.** Any change to reveal logic keeps both failsafes from Task 6 intact.
- **Tests never hardcode content.** Any assertion about copy, counts, or URLs imports from `content.ts` and derives from it. Shane edits content routinely; a suite that goes red when he adds a project is a suite he will learn to ignore. Structural facts (the page title, the four section ids, layout values) may be asserted directly — those are not content.
- **Commit after every task.** Small, focused commits.

## File Structure

| File | Responsibility |
|---|---|
| `next.config.ts` | Static export configuration. Nothing else |
| `app/layout.tsx` | `<html>` shell, font variables, metadata, pre-paint theme script, `<noscript>` reveal override |
| `app/page.tsx` | Composes the sidebar and the five content blocks. No logic |
| `app/globals.css` | `design/tokens.css` plus the page grid and responsive rules |
| `content.ts` | Every string, typed. The only file Shane edits |
| `components/Sidebar.tsx` + `.module.css` | Identity, nav, contact footer |
| `components/ThemeToggle.tsx` + `.module.css` | Client. The only interactive control |
| `components/ScrollEffects.tsx` | Client. One mount point for reveal + scroll-spy. Renders nothing |
| `components/Experience.tsx` + `.module.css` | Role entries |
| `components/Projects.tsx` + `.module.css` | Project rows |
| `components/Skills.tsx` + `.module.css` | Skill chips |
| `components/About.tsx` + `.module.css` | About paragraph + email link |
| `components/SectionLabel.tsx` | Shared `<h2>` for the four section headings |
| `tests/*.spec.ts` | Playwright specs, one file per concern |
| `playwright.config.ts` | Builds the site and serves `out/` for tests |

---

### Task 1: Scaffold, static export, and test harness

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx` (all via scaffold)
- Create: `playwright.config.ts`
- Create: `tests/smoke.spec.ts`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nothing
- Produces: a working `npm run build` emitting `out/index.html`; `npm test` running Playwright against that output.

- [ ] **Step 1: Scaffold the app in place**

The repo root already contains `design/`, `docs/`, and `README.md`. Scaffold into a temp dir and move files up, so nothing existing is clobbered.

```bash
cd /Users/shanerexsasikumar/Documents/Projects/portfolio
npx create-next-app@latest .tmp-scaffold \
  --typescript --app --eslint --no-tailwind --no-src-dir \
  --import-alias "@/*" --use-npm --yes
```

Then move the scaffold up and remove its git repo and boilerplate:

```bash
cd /Users/shanerexsasikumar/Documents/Projects/portfolio
rm -rf .tmp-scaffold/.git .tmp-scaffold/README.md .tmp-scaffold/public/*
cp -R .tmp-scaffold/. .
rm -rf .tmp-scaffold
```

- [ ] **Step 2: Configure static export**

Replace `next.config.ts` entirely:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
}

export default nextConfig
```

- [ ] **Step 3: Install the test harness**

```bash
npm install --save-dev @playwright/test serve
npx playwright install chromium
```

- [ ] **Step 4: Write `playwright.config.ts`**

Tests run against the built static output, not the dev server — that is what ships.

```ts
import { defineConfig, devices } from '@playwright/test'

const PORT = 3210
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `npm run build && npx serve out -l ${PORT} --no-clipboard`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

- [ ] **Step 5: Add the test script to `package.json`**

Add to the `"scripts"` block:

```json
"test": "playwright test"
```

Later tasks import `content.ts` into specs via the `@/content` alias. Playwright reads `tsconfig.json` `paths`, which `create-next-app --import-alias "@/*"` already configured, so this resolves without extra setup. Confirm `tsconfig.json` contains `"paths": { "@/*": ["./*"] }` — if it does not, add it now.

- [ ] **Step 6: Write the failing smoke test**

Create `tests/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('page has the correct title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Shane Rex Sasikumar — Senior Software Engineer')
})

test('static export emits a single page', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
})
```

- [ ] **Step 7: Run tests to verify the title test fails**

Run: `npm test`
Expected: `page has the correct title` FAILS — the scaffold's title is "Create Next App". The second test passes.

- [ ] **Step 8: Set the real metadata**

In `app/layout.tsx`, replace the exported `metadata`:

```ts
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shane Rex Sasikumar — Senior Software Engineer',
  description:
    'Senior Software Engineer building event-driven backends on Java, Spring Boot and GCP.',
}
```

No Open Graph or Twitter card fields — link previews are out of scope per the spec.

- [ ] **Step 9: Run tests to verify they pass**

Run: `npm test`
Expected: both tests PASS.

- [ ] **Step 10: Confirm `.gitignore` covers build output**

Ensure `.gitignore` contains `node_modules`, `.next`, `out`, `test-results`, `playwright-report`. The scaffold provides the first two; add the rest if missing.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with static export and Playwright harness"
```

---

### Task 2: Design tokens, fonts, and page shell

**Files:**
- Create: `app/globals.css` (replacing the scaffold's)
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Create: `tests/tokens.spec.ts`

**Interfaces:**
- Consumes: Task 1's layout and build.
- Produces: CSS custom properties `--font-display`, `--font-body`, `--font-mono` resolving to self-hosted families; a two-column grid shell with `<aside class="sidebar">` and `<main class="content">` that later tasks fill.

- [ ] **Step 1: Copy the token file**

```bash
cp design/tokens.css app/globals.css
```

- [ ] **Step 2: Apply the two permitted token edits**

**Edit A — font indirection.** `next/font` generates its own variable names, so the token file must point at them rather than naming families directly. In `app/globals.css`, replace the three font declarations in `:root`:

```css
  --font-display: var(--font-archivo), system-ui, sans-serif;      /* headings, 600 */
  --font-body: var(--font-plex-sans), system-ui, sans-serif;       /* body, 400 */
  --font-mono: var(--font-plex-mono), ui-monospace, monospace;     /* labels, meta, chips */
```

**Edit B — `color-scheme` follows the theme.** Delete the static `html { color-scheme: light dark; }` line and add the property to each theme block instead, so native scrollbars and form controls match the active theme:

```css
:root,
[data-theme='light'] {
  color-scheme: light;
  /* ...existing light tokens unchanged... */
}

[data-theme='dark'] {
  color-scheme: dark;
  /* ...existing dark tokens unchanged... */
}
```

- [ ] **Step 3: Append the page grid**

Add to the end of `app/globals.css`:

```css
/* ---------- Page grid ---------- */
.page {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  align-items: start;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100dvh;
  padding: var(--sidebar-pad);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid var(--line);
}

.content {
  padding: var(--content-pad);
  max-width: var(--content-max);
}

/* ---------- Focus ---------- */
:focus-visible {
  outline: 2px solid var(--fg4);
  outline-offset: 3px;
}
```

- [ ] **Step 4: Wire the fonts in `app/layout.tsx`**

```tsx
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-archivo',
  display: 'swap',
})

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-plex-sans',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
```

Keep the `metadata` export from Task 1.

- [ ] **Step 5: Replace `app/page.tsx` with the shell**

```tsx
export default function Home() {
  return (
    <div className="page">
      <aside className="sidebar" />
      <main className="content" />
    </div>
  )
}
```

- [ ] **Step 6: Write the failing test**

Create `tests/tokens.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

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
  expect(fonts.display).toContain('Archivo')
  expect(fonts.body).toContain('IBM_Plex_Sans')
  expect(fonts.mono).toContain('IBM_Plex_Mono')
})

test('no font is requested from Google at runtime', async ({ page }) => {
  const googleRequests: string[] = []
  page.on('request', (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) googleRequests.push(r.url())
  })
  await page.goto('/')
  expect(googleRequests).toEqual([])
})

test('page uses the two-column grid at desktop width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const cols = await page
    .locator('.page')
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns)
  expect(cols.startsWith('340px')).toBe(true)
})
```

- [ ] **Step 7: Run tests to verify they fail, then pass**

Run: `npm test`
Expected: all three PASS once Steps 1–5 are complete. If `font tokens resolve` fails, the variable names in `globals.css` do not match those in `layout.tsx` — reconcile them.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add design tokens, self-hosted fonts and page grid"
```

---

### Task 3: Typed content layer and sidebar

**Files:**
- Create: `content.ts`
- Create: `components/Sidebar.tsx`, `components/Sidebar.module.css`
- Modify: `app/page.tsx`
- Create: `tests/sidebar.spec.ts`

**Interfaces:**
- Consumes: the `.sidebar` grid slot from Task 2.
- Produces: `content.ts` exporting `site`, `experience`, `projects`, `skills`, `about` with the exact types below. Every later task imports from here.

```ts
export type Link = { label: string; href: string }
export type ExperienceEntry = {
  title: string
  dates: string
  company: string
  bullets: string[]
}
export type Project = {
  name: string
  stack: string
  status?: 'in-progress' | 'completed'
  description: string
  href: string
}
```

- [ ] **Step 1: Create `content.ts`**

Copy recovered from the design canvas. Shane replaces these values later; the shape stays fixed.

```ts
export type Link = { label: string; href: string }

export type ExperienceEntry = {
  title: string
  dates: string
  company: string
  bullets: string[]
}

export type Project = {
  name: string
  stack: string
  status?: 'in-progress' | 'completed'
  description: string
  href: string
}

export const site = {
  name: ['Shane Rex', 'Sasikumar'] as const,
  blurb:
    'Senior Software Engineer building event-driven backends on Java, Spring Boot and GCP.',
  lede:
    "Three years building backend systems at Bounteous x Accolite: a Pub/Sub pipeline moving 300,000+ requests a day, a credit engine that's carried 3M+ transactions without losing one. I own what I ship past the deploy, through the incident that finds the edge case nobody spec'd.",
  location: 'Bengaluru, India',
  availability: 'Open to new roles',
  email: 'shanerexsasikumar@gmail.com',
  nav: [
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills', href: '#skills' },
    { label: 'About', href: '#about' },
  ] satisfies Link[],
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shane-rex-sasikumar' },
    { label: 'GitHub', href: 'https://github.com/Shanerex' },
    // TODO(shane): no cv.pdf exists yet anywhere in career/ or Projects/ — export one into public/.
    { label: 'CV', href: '/cv.pdf' },
  ] satisfies Link[],
}

export const experience: ExperienceEntry[] = [
  {
    title: 'Senior Software Engineer',
    dates: '2025 — Present',
    company: 'Bounteous x Accolite',
    bullets: [
      'Architected a GCP Pub/Sub pipeline ingesting 20+ webhook event types, handling 300,000+ requests a day at 99.99% delivery.',
      'Cut order history API response times from 6-8s to under 1s with a Dataflow/Beam pipeline feeding a pre-aggregated store.',
      'Migrated 400,000+ customer records to a new platform on Spring Boot, Cloud Run and Redis, with zero downtime and no data loss.',
      'Reconciled 35,000 incorrect debits and restored 20,000 missing credits after a production data-integrity incident, zero customer escalations.',
      'Introduced Spec Driven Development team-wide, cutting development time 30-50% against estimates.',
    ],
  },
  {
    title: 'Software Analyst',
    dates: '2023 — 2025',
    company: 'Bounteous x Accolite',
    bullets: [
      'Built a credit management system from scratch on Spring Boot and Cloud SQL, migrating 3M+ historical transactions with zero downtime.',
      'Fixed a concurrency race handing out duplicate customer numbers at registration by wrapping generation in a Firestore transaction.',
      'Automated inventory ingestion with Apache NiFi, cutting 100+ hours of manual work a month.',
      'Raised JUnit 5 coverage from 75% to 88% with parameterized tests and mocking, cutting CI regression failures.',
      'Built GCP Cloud Monitoring dashboards and multi-threshold alerting across Cloud Run services, improving MTTR.',
    ],
  },
]

export const projects: Project[] = [
  {
    name: 'alef-jasper-rebuild',
    stack: 'Next.js · Spring AI',
    status: 'in-progress',
    description:
      'Full-stack rebuild for a GCC rebar-detailing consultancy, still in progress. Marketing pages, portfolio filtering and an admin portal already ship; the AI RFQ concierge comes next.',
    href: 'https://github.com/Shanerex/alef-jasper-rebuild',
  },
  {
    name: 'CryptoUIJC',
    stack: 'Kotlin · Jetpack Compose',
    status: 'completed',
    description:
      'Android crypto trading app UI: portfolio, live prices, trade and transaction screens, built entirely in Jetpack Compose.',
    href: 'https://github.com/Shanerex/CryptoUIJC',
  },
  {
    name: 'resume-refresh',
    stack: 'Claude Code · Python',
    status: 'completed',
    description:
      "A Claude Code plugin that roasts a resume for real weaknesses and rewrites what's actually wrong, then pushes the same content to LinkedIn and Naukri every month.",
    href: 'https://github.com/Shanerex/resume-refresh',
  },
]

export const skills: string[] = [
  'Java',
  'Spring Boot',
  'GCP Pub/Sub',
  'GCP Dataflow',
  'Apache Beam',
  'BigQuery',
  'Cloud Run',
  'Cloud Tasks',
  'Cloud SQL',
  'SQL Server',
  'Redis',
  'Firestore',
  'PostgreSQL',
  'Apache NiFi',
  'Cloud Monitoring',
  'Event-Driven Architecture',
  'Hibernate',
  'JPA',
  'Cloud Build',
  'Google Cloud Storage',
  'Cloud Scheduler',
  'Docker',
  'MySQL',
  'Distributed Systems',
  'Microservices',
  'System Design',
  'REST API Design',
  'Multithreading & Concurrency',
  'JUnit 5',
  'Git',
  'Apache Maven',
]

export const about =
  "B.E. Computer Science, Thiagarajar College of Engineering, 9.42 CGPA. Off the clock I play tennis (a few tournament wins in school and college), plus cricket and badminton, and watch more of both than I play. Weekends usually go to a film with a story worth following, in any language."
```

- [ ] **Step 2: Write the failing test**

Create `tests/sidebar.spec.ts`:

As in Task 5, assertions derive from `content.ts` so editing content never turns the suite red.

```ts
import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('sidebar renders identity and blurb', async ({ page }) => {
  await page.goto('/')
  const aside = page.locator('aside.sidebar')
  const heading = aside.getByRole('heading', { level: 1 })
  for (const part of site.name) {
    await expect(heading).toContainText(part)
  }
  await expect(aside).toContainText(site.blurb)
})

test('sidebar nav links point at every section', async ({ page }) => {
  await page.goto('/')
  const nav = page.locator('aside.sidebar nav')
  await expect(nav.getByRole('link')).toHaveCount(site.nav.length)
  for (const item of site.nav) {
    await expect(nav.locator(`a[href="${item.href}"]`)).toHaveText(item.label)
  }
})

test('sidebar footer shows location, availability and contact links', async ({ page }) => {
  await page.goto('/')
  const aside = page.locator('aside.sidebar')
  await expect(aside).toContainText(site.location)
  await expect(aside).toContainText(site.availability)
  await expect(aside.locator('a[href^="mailto:"]')).toHaveCount(1)
  for (const link of site.links) {
    await expect(aside.locator(`a[href="${link.href}"]`)).toHaveText(link.label)
  }
})

test('CV link opens a PDF in a new tab', async ({ page }) => {
  await page.goto('/')
  const cv = page.locator('aside.sidebar a', { hasText: 'CV' })
  await expect(cv).toHaveAttribute('href', /\.pdf$/)
  await expect(cv).toHaveAttribute('target', '_blank')
  await expect(cv).toHaveAttribute('rel', /noreferrer/)
})

test('external sidebar links are safe', async ({ page }) => {
  await page.goto('/')
  const external = page.locator('aside.sidebar a[href^="https://"]')
  const count = await external.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    await expect(external.nth(i)).toHaveAttribute('rel', /noreferrer/)
  }
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- tests/sidebar.spec.ts`
Expected: FAIL — no `aside.sidebar` content exists yet.

- [ ] **Step 4: Create `components/Sidebar.module.css`**

```css
.name {
  font-size: var(--text-h1);
  line-height: var(--lh-h1);
  letter-spacing: var(--ls-h1);
  color: var(--fg);
}

.blurb {
  font-size: var(--text-sm);
  line-height: var(--lh-sm);
  color: var(--fg3);
  margin: var(--sp-4) 0 0;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin-top: var(--sp-11);
  font-size: var(--text-nav);
}

.navLink {
  display: flex;
  gap: var(--sp-3);
  align-items: center;
  color: var(--fg4);
  transition: color var(--dur-hover) ease;
}

.navLink::before {
  content: '';
  width: 16px;
  height: 1px;
  background: var(--line2);
  flex: none;
  transition: background var(--dur-hover) ease;
}

.navLink:hover,
.navLink[aria-current='true'] {
  color: var(--fg);
}

.navLink[aria-current='true']::before {
  background: var(--fg4);
}

.meta {
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: var(--lh-meta);
  color: var(--fg5);
  margin: 0;
}

.contact {
  display: flex;
  gap: var(--sp-5);
  margin-top: var(--sp-6);
  font-size: 13.5px;
}

.email {
  color: var(--fg);
  border-bottom: 1px solid var(--line2);
  padding-bottom: 3px;
  transition: border-color var(--dur-hover) ease;
}

.email:hover {
  border-color: var(--fg);
}

.link {
  color: var(--fg4);
  transition: color var(--dur-hover) ease;
}

.link:hover {
  color: var(--fg);
}
```

- [ ] **Step 5: Create `components/Sidebar.tsx`**

```tsx
import { site } from '@/content'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const [firstName, lastName] = site.name

  return (
    <aside className="sidebar">
      <div>
        <h1 className={styles.name}>
          {firstName}
          <br />
          {lastName}
        </h1>
        <p className={styles.blurb}>{site.blurb}</p>

        <nav className={styles.nav} aria-label="Sections">
          {site.nav.map((item) => (
            <a key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div>
        <p className={styles.meta}>
          {site.location}
          <br />
          {site.availability}
        </p>
        <div className={styles.contact}>
          <a className={styles.email} href={`mailto:${site.email}`}>
            Email
          </a>
          {site.links.map((link) => (
            <a
              key={link.label}
              className={styles.link}
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 6: Wire it into `app/page.tsx`**

```tsx
import Sidebar from '@/components/Sidebar'

export default function Home() {
  return (
    <div className="page">
      <Sidebar />
      <main className="content" />
    </div>
  )
}
```

Remove the `.sidebar` styling conflict: `Sidebar.tsx` uses the global `.sidebar` class from `globals.css` for layout and its module for typography. That split is intentional — layout belongs to the grid, typography to the component.

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test -- tests/sidebar.spec.ts`
Expected: all five PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add typed content layer and sidebar"
```

---

### Task 4: Theme toggle with no flash of wrong theme

**Files:**
- Create: `components/ThemeToggle.tsx`, `components/ThemeToggle.module.css`
- Modify: `app/layout.tsx`
- Modify: `components/Sidebar.tsx`
- Create: `tests/theme.spec.ts`

**Interfaces:**
- Consumes: `site` from `content.ts`; the `--panel`, `--line2`, `--fg3`, `--fg4` tokens.
- Produces: `data-theme` on `<html>` maintained by both the pre-paint script and the toggle, persisted under `srs-theme`.

- [ ] **Step 1: Write the failing test**

Create `tests/theme.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('defaults to dark when the OS prefers dark', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await ctx.close()
})

test('defaults to light when the OS prefers light', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'light' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await ctx.close()
})

test('toggle switches the theme and persists it across reload', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'light' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  await page.getByRole('button', { name: /theme/i }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  const stored = await page.evaluate(() => localStorage.getItem('srs-theme'))
  expect(stored).toBe('dark')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await ctx.close()
})

test('stored theme is applied before first paint', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'light' })
  const page = await ctx.newPage()
  await page.addInitScript(() => localStorage.setItem('srs-theme', 'dark'))

  // Sample the attribute at the earliest possible moment in document lifetime.
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
  expect(themeAtDomReady).toBe('dark')
  await ctx.close()
})

test('color-scheme follows the active theme', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' })
  const page = await ctx.newPage()
  await page.goto('/')
  const scheme = await page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  )
  expect(scheme).toBe('dark')
  await ctx.close()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/theme.spec.ts`
Expected: FAIL — there is no toggle, and `data-theme` is hardcoded to `light`.

- [ ] **Step 3: Add the pre-paint script to `app/layout.tsx`**

Add above the component, and note the two changes to `<html>`: drop the hardcoded `data-theme`, add `suppressHydrationWarning` because the script mutates the attribute before React hydrates.

```tsx
const themeScript = `
(function(){
  try {
    var k = 'srs-theme';
    var stored = localStorage.getItem(k);
    var t = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`
```

```tsx
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
```

The `catch` branch matters: Safari private browsing throws on `localStorage` access. Without it, the page renders unstyled-dark on a thrown exception.

- [ ] **Step 4: Create `components/ThemeToggle.module.css`**

```css
.toggle {
  position: absolute;
  top: 22px;
  right: 26px;
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 8px 13px;
  border: 1px solid var(--line2);
  border-radius: var(--radius-pill);
  background: var(--panel);
  color: var(--fg3);
  font-family: var(--font-mono);
  font-size: var(--text-meta);
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.25s ease, color 0.25s ease;
}

.toggle:hover {
  border-color: var(--fg4);
  color: var(--fg);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--fg4);
  background: transparent;
}

[data-theme='dark'] .dot {
  background: var(--fg4);
}
```

- [ ] **Step 5: Create `components/ThemeToggle.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import styles from './ThemeToggle.module.css'

type Theme = 'light' | 'dark'
const KEY = 'srs-theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')

  // The pre-paint script is the source of truth on first render; read from it
  // rather than recomputing, so the button label never disagrees with the page.
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    setTheme(current === 'dark' ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Private browsing — the theme still applies for this page view.
    }
  }

  const label = theme === 'dark' ? 'Dark' : 'Light'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </button>
  )
}
```

- [ ] **Step 6: Mount the toggle in the sidebar**

In `components/Sidebar.tsx`, import it and render it as the first child of `<aside>`:

```tsx
import ThemeToggle from './ThemeToggle'
```

```tsx
    <aside className="sidebar">
      <ThemeToggle />
      <div>
```

The toggle is `position: absolute`, so add `position: relative` to `.sidebar` in `app/globals.css`.

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test -- tests/theme.spec.ts`
Expected: all five PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add theme toggle with pre-paint application"
```

---

### Task 5: Content sections

**Files:**
- Create: `components/SectionLabel.tsx`, `components/SectionLabel.module.css`
- Create: `components/Experience.tsx`, `components/Experience.module.css`
- Create: `components/Projects.tsx`, `components/Projects.module.css`
- Create: `components/Skills.tsx`, `components/Skills.module.css`
- Create: `components/About.tsx`, `components/About.module.css`
- Modify: `app/page.tsx`, `app/globals.css`
- Create: `tests/sections.spec.ts`

**Interfaces:**
- Consumes: `experience`, `projects`, `skills`, `about`, `site.lede`, `site.email` from `content.ts`.
- Produces: four `<section>` elements with ids `experience`, `projects`, `skills`, `about`, each containing an `<h2>`. Task 6's scroll-spy depends on these exact ids.

- [ ] **Step 1: Write the failing test**

Create `tests/sections.spec.ts`:

**Every assertion is derived from `content.ts`, never hardcoded.** Shane edits content regularly; a test asserting `toHaveCount(3)` would go red the moment he adds a fourth project, which would train him to ignore a red suite. These tests verify that *whatever is in `content.ts` renders correctly* — they stay green as content changes and still fail if rendering breaks.

```ts
import { test, expect } from '@playwright/test'
import { about, experience, projects, site, skills } from '@/content'

test('all four sections exist with headings', async ({ page }) => {
  await page.goto('/')
  for (const item of site.nav) {
    const id = item.href.slice(1)
    const section = page.locator(`section#${id}`)
    await expect(section).toHaveCount(1)
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(item.label)
  }
})

test('lede renders above the first section', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.lede')).toHaveText(site.lede)
})

test('every role renders with all of its bullets', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#experience')
  await expect(section.getByRole('heading', { level: 3 })).toHaveCount(experience.length)

  for (const role of experience) {
    const entry = section.locator('article', { hasText: role.title }).first()
    await expect(entry).toContainText(role.dates)
    await expect(entry).toContainText(role.company)
    for (const bullet of role.bullets) {
      await expect(entry).toContainText(bullet)
    }
  }
})

test('every project renders and links out safely', async ({ page }) => {
  await page.goto('/')
  const rows = page.locator('section#projects a')
  await expect(rows).toHaveCount(projects.length)

  for (const [i, project] of projects.entries()) {
    const row = rows.nth(i)
    await expect(row).toHaveAttribute('href', project.href)
    await expect(row).toHaveAttribute('target', '_blank')
    await expect(row).toHaveAttribute('rel', /noreferrer/)
    await expect(row).toContainText(project.name)
    await expect(row).toContainText(project.stack)
    await expect(row).toContainText(project.description)
    if (project.status === 'in-progress') {
      await expect(row).toContainText('In progress')
    }
  }
})

test('project links are all external https URLs', async ({ page }) => {
  await page.goto('/')
  for (const project of projects) {
    expect(project.href, `${project.name} must use https`).toMatch(/^https:\/\//)
  }
})

test('every skill renders as a chip', async ({ page }) => {
  await page.goto('/')
  const chips = page.locator('section#skills li')
  await expect(chips).toHaveCount(skills.length)
  for (const [i, skill] of skills.entries()) {
    await expect(chips.nth(i)).toHaveText(skill)
  }
})

test('about renders the paragraph and the email link', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#about')
  await expect(section.locator('p')).toHaveText(about)
  const email = section.locator('a[href^="mailto:"]')
  await expect(email).toHaveText(`${site.email} →`)
  await expect(email).toHaveAttribute('href', `mailto:${site.email}`)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/sections.spec.ts`
Expected: FAIL — `<main>` is empty.

- [ ] **Step 3: Add section rhythm to `app/globals.css`**

```css
/* ---------- Section rhythm ---------- */
.section {
  margin-top: var(--sp-13);
  padding-top: var(--sp-12);
  border-top: 1px solid var(--line);
}

.section:first-of-type {
  margin-top: 0;
  border-top: none;
}
```

- [ ] **Step 4: Create `components/SectionLabel.tsx` and its module**

`SectionLabel.module.css`:

```css
.label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  font-weight: 500;
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--fg4);
  line-height: 1;
  margin: 0 0 var(--sp-9);
}
```

`SectionLabel.tsx`:

```tsx
import styles from './SectionLabel.module.css'

export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className={styles.label}>{children}</h2>
}
```

- [ ] **Step 5: Create `components/Experience.tsx` and its module**

`Experience.module.css`:

```css
.entry {
  margin-bottom: var(--sp-10);
}

.entry:last-child {
  margin-bottom: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--sp-6);
}

.title {
  font-size: var(--text-h3);
  line-height: var(--lh-h3);
  color: var(--fg);
}

.dates {
  font-family: var(--font-mono);
  font-size: var(--text-meta);
  line-height: 1;
  color: var(--fg5);
  flex: none;
}

.company {
  font-size: var(--text-sm2);
  line-height: 1.5;
  color: var(--fg3);
  margin: var(--sp-1) 0 0;
}

.bullets {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: var(--sp-4) 0 0;
  padding: 0;
  list-style: none;
  font-size: var(--text-body);
  line-height: var(--lh-body);
  color: var(--fg2);
}
```

`Experience.tsx`:

```tsx
import { experience } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './Experience.module.css'

export default function Experience() {
  return (
    <section id="experience" className="section">
      <SectionLabel>Experience</SectionLabel>
      {experience.map((role) => (
        <article key={`${role.title}-${role.dates}`} className={`${styles.entry} reveal`}>
          <div className={styles.header}>
            <h3 className={styles.title}>{role.title}</h3>
            <span className={styles.dates}>{role.dates}</span>
          </div>
          <p className={styles.company}>{role.company}</p>
          <ul className={styles.bullets}>
            {role.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  )
}
```

Bullets carry no glyph — separation is the 9px gap, hence `list-style: none`.

- [ ] **Step 6: Create `components/Projects.tsx` and its module**

`Projects.module.css`:

```css
.row {
  display: block;
  padding: var(--sp-6) 0;
  border-bottom: 1px solid var(--line);
  color: inherit;
  transition: padding-left var(--dur-hover) ease;
}

.row:hover {
  padding-left: var(--sp-2);
  color: inherit;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--sp-5);
}

.nameGroup {
  display: flex;
  align-items: baseline;
  gap: var(--sp-3);
  min-width: 0;
}

.name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-h4);
  line-height: var(--lh-h4);
  color: var(--fg);
}

.status {
  display: inline-block;
  flex: none;
  padding: 3px 9px;
  border: 1px solid var(--line2);
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: 10.5px;
  line-height: 1;
  color: var(--fg5);
}

.stack {
  font-family: var(--font-mono);
  font-size: var(--text-tag);
  line-height: 1;
  color: var(--fg5);
  flex: none;
}

.description {
  font-size: var(--text-sm2);
  line-height: var(--lh-sm2);
  color: var(--fg3);
  margin: 7px 0 0;
}
```

`Projects.tsx`:

```tsx
import { projects } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './Projects.module.css'

export default function Projects() {
  return (
    <section id="projects" className="section">
      <SectionLabel>Projects</SectionLabel>
      {projects.map((project, i) => (
        <a
          key={project.name}
          className={`${styles.row} reveal`}
          style={{ transitionDelay: `${Math.min(i, 3) * 0.06}s` }}
          href={project.href}
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.header}>
            <span className={styles.nameGroup}>
              {project.status === 'in-progress' && (
                <span className={styles.status}>In progress</span>
              )}
              <span className={styles.name}>{project.name}</span>
            </span>
            <span className={styles.stack}>{project.stack}</span>
          </div>
          <p className={styles.description}>{project.description}</p>
        </a>
      ))}
    </section>
  )
}
```

Only `status: 'in-progress'` renders a pill. `'completed'` is the unmarked default — most projects are finished, so flagging the exception reads cleaner than labeling every row. The pill reuses the skill-chip pattern (bordered, pill radius, mono) rather than introducing a new visual element.

Hover nudges the row right by 8px with no colour change — the `color: inherit` on `:hover` overrides the global `a:hover` rule from `tokens.css`.

- [ ] **Step 7: Create `components/Skills.tsx` and its module**

`Skills.module.css`:

```css
.list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.chip {
  padding: 7px 12px;
  border: 1px solid var(--line2);
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: var(--text-chip);
  line-height: 1;
  color: var(--fg2);
}
```

`Skills.tsx`:

```tsx
import { skills } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './Skills.module.css'

export default function Skills() {
  return (
    <section id="skills" className="section">
      <SectionLabel>Skills</SectionLabel>
      <ul className={`${styles.list} reveal`}>
        {skills.map((skill) => (
          <li key={skill} className={styles.chip}>
            {skill}
          </li>
        ))}
      </ul>
    </section>
  )
}
```

The Skills label uses `margin-bottom: 22px` rather than 28px per the handoff — override in `Skills.module.css` if `SectionLabel`'s default does not match; add `.list { margin-top: -6px }` only if the design review shows a discrepancy.

- [ ] **Step 8: Create `components/About.tsx` and its module**

`About.module.css`:

```css
.body {
  font-size: var(--text-body-lg);
  line-height: var(--lh-body-lg);
  color: var(--fg2);
  text-wrap: pretty;
  margin: 0;
}

.email {
  display: inline-block;
  margin-top: var(--sp-8);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1;
  color: var(--fg);
  border-bottom: 1px solid var(--line2);
  padding-bottom: 4px;
  transition: border-color var(--dur-hover) ease;
}

.email:hover {
  border-color: var(--fg);
  color: var(--fg);
}
```

`About.tsx`:

```tsx
import { about, site } from '@/content'
import SectionLabel from './SectionLabel'
import styles from './About.module.css'

export default function About() {
  return (
    <section id="about" className="section">
      <SectionLabel>About</SectionLabel>
      <p className={`${styles.body} reveal`}>{about}</p>
      <a className={`${styles.email} reveal`} href={`mailto:${site.email}`}>
        {site.email} →
      </a>
    </section>
  )
}
```

- [ ] **Step 9: Compose them in `app/page.tsx`**

```tsx
import Sidebar from '@/components/Sidebar'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import About from '@/components/About'
import { site } from '@/content'

export default function Home() {
  return (
    <div className="page">
      <Sidebar />
      <main className="content">
        <p className="lede reveal">{site.lede}</p>
        <Experience />
        <Projects />
        <Skills />
        <About />
      </main>
    </div>
  )
}
```

Add the lede style to `app/globals.css`:

```css
.lede {
  font-size: var(--text-lede);
  line-height: var(--lh-lede);
  color: var(--fg2);
  text-wrap: pretty;
  margin: 0 0 var(--sp-14);
  --reveal-offset: 14px;
  transition-duration: var(--dur-reveal-lede);
}
```

- [ ] **Step 10: Run tests to verify they pass**

Run: `npm test -- tests/sections.spec.ts`
Expected: all six PASS.

Note: these tests will pass even though `.reveal` elements are at `opacity: 0`, because Playwright's `toContainText` does not require visibility. Task 6 makes them actually visible.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add experience, projects, skills and about sections"
```

---

### Task 6: Scroll reveal, failsafes, and scroll-spy

**Files:**
- Create: `components/ScrollEffects.tsx`
- Modify: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `tests/reveal.spec.ts`

**Interfaces:**
- Consumes: `.reveal` class on elements from Task 5; `section[id]` elements; `nav a[href="#id"]` from Task 3.
- Produces: `.is-in` added to revealed elements; `aria-current="true"` on the active nav link.

**This task carries the two failsafes. Content starting at `opacity: 0` means any failure here shows a recruiter a blank page.**

- [ ] **Step 1: Write the failing test**

Create `tests/reveal.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('above-the-fold content is visible on load', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.lede')).toBeVisible()
  await expect(page.locator('.lede')).toHaveClass(/is-in/)
})

test('content further down reveals when scrolled to', async ({ page }) => {
  await page.goto('/')
  const about = page.locator('section#about p')
  await about.scrollIntoViewIfNeeded()
  await expect(about).toHaveClass(/is-in/)
})

test('all content is visible without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('.lede')).toBeVisible()
  await expect(page.locator('section#about p')).toBeVisible()
  const opacity = await page
    .locator('.lede')
    .evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')
  await ctx.close()
})

test('reduced motion shows content immediately', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto('/')
  const opacity = await page
    .locator('section#about p')
    .evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')
  await ctx.close()
})

test('scroll-spy marks the section in view', async ({ page }) => {
  await page.goto('/')
  await page.locator('section#projects').scrollIntoViewIfNeeded()
  await expect(page.locator('nav a[href="#projects"]')).toHaveAttribute(
    'aria-current',
    'true',
  )
  await expect(page.locator('nav a[href="#experience"]')).not.toHaveAttribute(
    'aria-current',
    'true',
  )
})

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/reveal.spec.ts`
Expected: FAIL — nothing adds `.is-in`, and there is no `<noscript>` override.

- [ ] **Step 3: Enable smooth scrolling and the reveal delay steps**

Add to `app/globals.css`:

```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 4: Add the `<noscript>` failsafe to `app/layout.tsx`**

Inside `<head>`, after the theme script:

```tsx
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
```

This is failsafe #1: it covers JavaScript disabled entirely. The 2-second timer in Step 5 is itself JavaScript and cannot cover this case.

- [ ] **Step 5: Create `components/ScrollEffects.tsx`**

```tsx
'use client'

import { useEffect } from 'react'

const REVEAL_FAILSAFE_MS = 2000

export default function ScrollEffects() {
  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal'),
    )

    const revealAll = () => revealTargets.forEach((el) => el.classList.add('is-in'))

    // Failsafe #2: if the observer never fires, show everything anyway.
    // Content must never be stuck invisible.
    const failsafe = window.setTimeout(revealAll, REVEAL_FAILSAFE_MS)

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
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    revealTargets.forEach((el) => revealObserver.observe(el))

    // Scroll-spy. Classes are toggled on the DOM directly rather than lifted
    // into React state, so Sidebar stays a server component.
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('main section[id]'),
    )
    const navLinks = new Map<string, HTMLAnchorElement>()
    document
      .querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')
      .forEach((a) => navLinks.set(a.getAttribute('href')!.slice(1), a))

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
        // Pick the first section in document order that is currently in view.
        const active = sections.find((s) => visible.has(s.id))
        if (active) setActive(active.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    sections.forEach((s) => spyObserver.observe(s))

    return () => {
      window.clearTimeout(failsafe)
      revealObserver.disconnect()
      spyObserver.disconnect()
    }
  }, [])

  return null
}
```

- [ ] **Step 6: Mount it in `app/page.tsx`**

```tsx
import ScrollEffects from '@/components/ScrollEffects'
```

Render it as the last child of the `.page` div:

```tsx
      <ScrollEffects />
```

- [ ] **Step 7: Default the first nav item to active**

In `components/Sidebar.tsx`, mark the first nav item current so the design's active state is correct before any scrolling:

```tsx
            <a
              key={item.href}
              href={item.href}
              className={styles.navLink}
              aria-current={i === 0 ? 'true' : undefined}
            >
```

Change the map signature to `site.nav.map((item, i) => (`.

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test -- tests/reveal.spec.ts`
Expected: all six PASS.

If `above-the-fold content is visible on load` is flaky, the observer has not fired by assertion time — Playwright's `toHaveClass` auto-retries, so a genuine failure here means the observer is not observing, not a timing artifact.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add scroll reveal with failsafes and nav scroll-spy"
```

---

### Task 7: Accessibility pass

**Files:**
- Modify: `app/globals.css` (if gaps found)
- Modify: component files (if gaps found)
- Create: `tests/a11y.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: the complete page from Tasks 3–6.
- Produces: no axe-detectable violations; visible focus rings on every interactive element.

- [ ] **Step 1: Install the accessibility scanner**

```bash
npm install --save-dev @axe-core/playwright
```

- [ ] **Step 2: Write the failing test**

Create `tests/a11y.spec.ts`:

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const scheme of ['light', 'dark'] as const) {
  test(`no accessibility violations in ${scheme} theme`, async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: scheme })
    const page = await ctx.newPage()
    await page.goto('/')
    // Reveal everything first — axe should not judge mid-animation opacity.
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
  await expect(page.locator('aside')).toHaveCount(1)
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

test('theme toggle exposes an accessible name that describes the action', async ({
  page,
}) => {
  await page.goto('/')
  const button = page.getByRole('button')
  await expect(button).toHaveAttribute('aria-label', /switch to (light|dark) theme/i)
})
```

- [ ] **Step 3: Run tests and fix whatever they surface**

Run: `npm test -- tests/a11y.spec.ts`

Fix any violation reported. Likely candidates and their fixes:

- **Colour contrast on `--fg5`** — it is only AA-compliant at ≥ 12px mono. If axe flags an element, that element is using `--fg5` where it should use `--fg4` or larger type. Fix the element, not the token.
- **Link name** — the project rows wrap a `<span>` name and `<span>` stack; if axe reports a missing discernible name, add `aria-label={project.name}` to the anchor.
- **Nav landmark** — if two `<nav>` elements exist, give each an `aria-label`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/a11y.spec.ts`
Expected: all four PASS with zero violations in both themes.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: ensure focus rings, landmarks and zero axe violations"
```

---

### Task 8: Responsive breakpoints

**Files:**
- Modify: `app/globals.css`
- Modify: `components/Sidebar.module.css`, `components/Experience.module.css`, `components/Projects.module.css`
- Create: `tests/responsive.spec.ts`

**Interfaces:**
- Consumes: the complete desktop layout.
- Produces: single-column layout below 1024px; tap targets ≥ 44px below 768px.

- [ ] **Step 1: Write the failing test**

Create `tests/responsive.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

const WIDTHS = [1440, 1024, 768, 390]

test('no horizontal overflow at any breakpoint', async ({ page }) => {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflows, `horizontal overflow at ${width}px`).toBe(false)
  }
})

test('collapses to one column below 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await page.goto('/')
  const cols = await page
    .locator('.page')
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns)
  expect(cols.split(' ').length).toBe(1)

  const position = await page
    .locator('aside.sidebar')
    .evaluate((el) => getComputedStyle(el).position)
  expect(position).not.toBe('sticky')
})

test('stays two columns at 1024px and above', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto('/')
  const cols = await page
    .locator('.page')
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns)
  expect(cols.startsWith('340px')).toBe(true)
})

test('tap targets are at least 44px on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const interactive = page.locator('a[href], button')
  const count = await interactive.count()
  for (let i = 0; i < count; i++) {
    const box = await interactive.nth(i).boundingBox()
    if (!box) continue
    expect(
      Math.max(box.width, box.height),
      `element ${i} is smaller than 44px in both dimensions`,
    ).toBeGreaterThanOrEqual(44)
  }
})

test('theme toggle does not overlap content on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const toggle = await page.getByRole('button').boundingBox()
  const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
  expect(toggle).not.toBeNull()
  expect(heading).not.toBeNull()
  const overlaps =
    toggle!.x < heading!.x + heading!.width &&
    toggle!.x + toggle!.width > heading!.x &&
    toggle!.y < heading!.y + heading!.height &&
    toggle!.y + toggle!.height > heading!.y
  expect(overlaps).toBe(false)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/responsive.spec.ts`
Expected: FAIL at 768px and 390px — the layout is still two columns.

- [ ] **Step 3: Add the breakpoints to `app/globals.css`**

```css
/* ---------- Tablet: 768–1023px ---------- */
@media (max-width: 1023px) {
  .page {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    height: auto;
    padding: 48px 40px 0;
    max-width: var(--content-max);
    margin: 0 auto;
    border-right: none;
    border-bottom: 1px solid var(--line);
    display: block;
  }

  .content {
    padding: 48px 40px 72px;
    max-width: var(--content-max);
    margin: 0 auto;
  }
}

/* ---------- Mobile: < 768px ---------- */
@media (max-width: 767px) {
  .sidebar {
    padding: 32px 20px 0;
  }

  .content {
    padding: 32px 20px 64px;
  }

  .lede {
    font-size: 18px;
    line-height: 1.6;
  }
}
```

- [ ] **Step 4: Add the sidebar's tablet and mobile rules to `Sidebar.module.css`**

```css
@media (max-width: 1023px) {
  .nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--sp-7);
    margin-top: var(--sp-8);
  }

  .navLink::before {
    display: none;
  }

  .contact {
    margin-bottom: var(--sp-8);
  }
}

@media (max-width: 767px) {
  .name {
    font-size: 26px;
  }

  /* 44px minimum tap targets */
  .navLink,
  .email,
  .link {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
}
```

- [ ] **Step 5: Add the mobile wrap rules to `Experience.module.css` and `Projects.module.css`**

`Experience.module.css`:

```css
@media (max-width: 767px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-1);
  }

  .dates {
    font-size: var(--text-tag);
  }
}
```

`Projects.module.css`:

```css
@media (max-width: 767px) {
  .header {
    flex-wrap: wrap;
    gap: 6px;
  }

  .stack {
    flex: 0 0 100%;
  }

  .row {
    min-height: 44px;
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- tests/responsive.spec.ts`
Expected: all five PASS.

If `tap targets are at least 44px` fails on a specific element, add `min-height: 44px; display: inline-flex; align-items: center` to that element's mobile rule rather than loosening the assertion.

- [ ] **Step 7: Capture reference screenshots for manual design review**

```bash
npx playwright screenshot --viewport-size=1440,900 http://localhost:3210 review-1440-light.png
```

Compare against `design/templates/Portfolio Directions.dc.html` options 4b and 5a. Note any spacing or type discrepancies and fix them against the values in `design/README.md`.

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: every spec PASSES.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add tablet and mobile breakpoints"
```

---

### Task 9: Deploy to Vercel

**Files:**
- Create: `README.md` (project readme; the handoff lives at `design/README.md`)
- Modify: `content.ts` (real URLs)
- Create: `public/cv.pdf` (supplied by Shane)

**Interfaces:**
- Consumes: a fully passing test suite.
- Produces: a live site at a `*.vercel.app` subdomain.

**This task requires assets from Shane. Do not invent URLs — if they are unavailable, complete Steps 1–2 and stop.**

- [ ] **Step 1: Replace the placeholder URLs in `content.ts`**

Swap the `TODO(shane)` values for the real LinkedIn URL, GitHub username, and three repo URLs. Delete both `TODO(shane)` comments once done.

- [ ] **Step 2: Add the CV**

Place the supplied PDF at `public/cv.pdf`. Confirm it resolves:

```bash
npm run build && ls -la out/cv.pdf
```

- [ ] **Step 3: Write the project README**

The design handoff already lives at `design/README.md`. Create a new root `README.md` covering: what the site is, the stack, `npm run dev` / `npm run build` / `npm test`, and where the design authority lives (`design/`).

It must include an **Updating content** section, since this is the only routine maintenance the site needs:

> All copy lives in `content.ts`. Nothing else needs touching.
>
> - **New experience bullet** — append a string to that role's `bullets` array.
> - **New role** — prepend an object to `experience` (newest first).
> - **New project** — append an object to `projects` with `name`, `stack`, `description`, `href`.
> - **New skill** — append a string to `skills`.
>
> Commit and push. Vercel rebuilds and deploys automatically in under a minute. You can edit `content.ts` directly in GitHub's web UI and commit from the browser — no local clone needed.
>
> The types catch mistakes at build time, and a build that fails to compile is not deployed, so a typo cannot take the live site down. Run `npm test` locally first if you want to be sure; the tests read from `content.ts`, so they validate your new entries rather than breaking on them.

- [ ] **Step 4: Run the full suite one final time**

Run: `npm test`
Expected: every spec PASSES. Do not deploy on a red suite.

- [ ] **Step 5: Commit and push**

```bash
git add -A
git commit -m "chore: add real links, CV and project README"
```

Create the GitHub repo and push (Shane confirms the repo name):

```bash
gh repo create <name> --public --source=. --remote=origin --push
```

- [ ] **Step 6: Deploy**

Import the repo at vercel.com/new. Vercel detects Next.js and needs no configuration — `output: 'export'` is handled automatically. Confirm:

- The production URL loads.
- The theme toggle works and survives a reload.
- The CV link opens the PDF.
- All three project links reach the right repos.

- [ ] **Step 7: Verify the deployed site**

Run against the live URL:

```bash
npx playwright test --config=playwright.config.ts
```

with `baseURL` temporarily pointed at the Vercel URL, or spot-check manually at 1440 and 390px in both themes.

- [ ] **Step 8: Commit any final fixes**

```bash
git add -A
git commit -m "fix: post-deploy corrections"
git push
```

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| Next.js App Router, TypeScript, static export | 1 |
| Vercel hosting | 9 |
| `next/font` self-hosted, no runtime Google request | 2 |
| `tokens.css` as global + CSS Modules | 2, 3, 5 |
| `color-scheme` per-theme fix | 2 |
| `content.ts` typed schema Shane edits | 3 |
| Sidebar, four sections, no fifth | 3, 5 |
| Project rows → GitHub, `target="_blank" rel="noreferrer"` | 5 |
| CV opens PDF in new tab | 3, 9 |
| Theme: `srs-theme`, OS default, pre-paint, no flash | 4 |
| Scroll reveal with observer + stagger | 6 |
| 2s observer failsafe | 6 |
| `<noscript>` failsafe | 6 |
| `prefers-reduced-motion` | 2 (tokens), 6 (test) |
| Scroll-spy without lifting state | 6 |
| Smooth-scroll nav | 6 |
| Focus rings on every interactive element | 2 (rule), 7 (test) |
| Semantic landmarks | 3, 5, 7 |
| `--fg5` discipline | Global Constraints, 7 |
| Breakpoints 1440/1024/768/390 | 8 |
| ≥ 44px tap targets | 8 |
| `<title>` + description, no OG | 1 |
| No imagery, accent, shadows, gradients | Global Constraints |

No gaps.

**Placeholder scan:** The only `TODO` markers are the two `TODO(shane)` comments in `content.ts` for URLs Shane must supply — deliberate, and removed in Task 9 Step 1. No "TBD", no "add appropriate error handling", no "similar to Task N".

**Type consistency:** `Link`, `ExperienceEntry`, and `Project` are defined once in Task 3 and used unchanged in Task 5. `site`, `experience`, `projects`, `skills`, `about` keep the same names throughout. The `.reveal` / `.is-in` class pair is consistent between Task 2 (tokens), Task 5 (applied), and Task 6 (toggled). The `srs-theme` key matches across Task 4's script, component, and tests.
