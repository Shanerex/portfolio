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
