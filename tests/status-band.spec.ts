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
