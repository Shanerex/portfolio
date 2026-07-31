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
  expect(fonts.body).toContain('IBM Plex Sans')
  expect(fonts.mono).toContain('IBM Plex Mono')
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

const NIGHT = {
  surround: '#060a11', court: '#0f3a63', courtTint: '#0a2440',
  ink: '#eef3f8', line2: '#9db0c6', meta: '#6e839b',
  ball: '#dcf24b', ballInk: '#dcf24b', onCourt: '#eef3f8',
}
const DAY = {
  surround: '#eaedf1', court: '#1f5a93', courtTint: '#3e7cb8',
  ink: '#0c1a2a', line2: '#3c4e63', meta: '#56677d',
  ball: '#dcf24b', ballInk: '#55670a', onCourt: '#f7f9fb',
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

test('body background and text color follow the active theme, not the legacy light default', async ({ page }) => {
  await page.goto('/')
  for (const theme of ['night', 'day'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
    // body's background/color transition over --dur-theme (450ms); wait it out so we
    // assert the settled value, not a mid-transition frame.
    await page.waitForTimeout(500)
    const [bodyBg, bodyColor, tokenBg, tokenInk] = await page.evaluate(() => {
      const bodyStyle = getComputedStyle(document.body)
      const rootStyle = getComputedStyle(document.documentElement)
      return [
        bodyStyle.backgroundColor,
        bodyStyle.color,
        rootStyle.getPropertyValue('--surround').trim(),
        rootStyle.getPropertyValue('--ink').trim(),
      ]
    })
    // Convert the token hex values the same way the browser reports computed color
    const hexToRgb = (hex: string) => {
      const n = hex.replace('#', '')
      const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16))
      return `rgb(${r}, ${g}, ${b})`
    }
    expect(bodyBg, `${theme}: body background`).toBe(hexToRgb(tokenBg))
    expect(bodyColor, `${theme}: body color`).toBe(hexToRgb(tokenInk))
  }
})
