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
