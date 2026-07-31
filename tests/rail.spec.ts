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
