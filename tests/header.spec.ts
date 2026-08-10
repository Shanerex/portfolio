import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('header is sticky and shows the wordmark, every nav route and the résumé pill', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const header = page.locator('[data-testid="header"]')
  await expect(header).toContainText('shane')
  const position = await header.evaluate((el) => getComputedStyle(el).position)
  expect(position).toBe('sticky')

  for (const item of site.nav) {
    const link = header.locator(`a[href="${item.href}"]`)
    await expect(link).toHaveCount(1)
    await expect(link).toContainText(item.path)
  }

  await expect(header.locator(`a[href="${site.resumeHref}"]`)).toHaveCount(1)
})

test('nav wraps to a second row on narrow widths instead of overflowing', async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 900 })
  await page.goto('/')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('header text stays readable against its fixed-dark background in both page themes', async ({ page }) => {
  await page.goto('/')
  for (const theme of ['dark', 'light'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
    const wordmark = page.locator('[data-testid="header"] a').first()
    const color = await wordmark.evaluate((el) => getComputedStyle(el).color)
    // In both themes the header forces its own light ink — never the page's
    // theme-swapping --ink, which would go near-black in light mode.
    expect(color).toBe('rgb(237, 234, 226)')
  }
})
