# Shane Rex Sasikumar — Portfolio

Personal portfolio site: hero, experience, projects, skills, and about sections
built as a static Next.js export with a night/day theme toggle.

## Stack

- [Next.js](https://nextjs.org) 16 (static export via `output: 'export'`)
- React 19 + TypeScript
- Playwright for tests (including accessibility checks via `@axe-core/playwright`)
- ESLint for linting

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                                  |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Start the Next.js dev server                  |
| `npm run build` | Build the static export into `out/`           |
| `npm run start` | Serve the production build                    |
| `npm run lint`  | Run ESLint                                     |
| `npm test`      | Run the Playwright test suite                  |

## Project structure

```
app/          Next.js app router entry (layout, page, global styles)
components/   UI components (hero, rail, sections, etc.)
content.ts    Site copy and data (experience, projects, metrics, nav)
design/       Design tokens and reference material
tests/        Playwright specs (a11y, theming, responsiveness, sections)
docs/         Implementation plans and design specs
```

## Testing

`npm test` builds the static site and runs the full Playwright suite against
it (see `playwright.config.ts`). Tests cover layout, the court grid, the
navigation rail, theme switching, reduced-motion behavior, and accessibility.
