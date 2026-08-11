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
  bg: '#f6f4ef', surface: '#fff', ink: '#14141a', inkDim: '#5b574f', inkMute: '#8c877d',
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
