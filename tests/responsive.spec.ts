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
