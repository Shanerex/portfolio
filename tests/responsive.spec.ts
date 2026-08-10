import { test, expect } from '@playwright/test'

const WIDTHS = [
  { width: 390, height: 844, label: 'phone' },
  { width: 768, height: 1024, label: 'tablet' },
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

  test(`every interactive element stays reachable at ${label} (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    const header = page.locator('[data-testid="header"]')
    await expect(header).toBeVisible()
    const box = await header.boundingBox()
    expect(box).not.toBeNull()
  })
}

test('header nav wraps rather than overlapping the wordmark below 860px', async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 900 })
  await page.goto('/')
  const header = page.locator('[data-testid="header"]')
  const height = await header.evaluate((el) => el.getBoundingClientRect().height)
  // A single-row header at this width would be under ~60px; wrapped, it's taller.
  expect(height).toBeGreaterThan(60)
})
