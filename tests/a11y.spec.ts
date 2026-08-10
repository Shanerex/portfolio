import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const theme of ['dark', 'light'] as const) {
  test(`no accessibility violations in ${theme} theme`, async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/')
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
    await page.waitForTimeout(2100)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
    await ctx.close()
  })
}

test('landmarks are present and unique', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.locator('header')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
})

test('every interactive element shows a focus ring', async ({ page }) => {
  await page.goto('/')
  // The scroll-to-top button is intentionally removed from the tab order
  // (via the `hidden` attribute) while off-screen near the top of the page —
  // scroll down first so it's visible and focusable like every other control.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  const interactive = page.locator('a[href], button')
  const count = await interactive.count()
  expect(count).toBeGreaterThan(10)

  for (let i = 0; i < count; i++) {
    const el = interactive.nth(i)
    await el.focus()
    const outline = await el.evaluate((node) => {
      const s = getComputedStyle(node)
      return { width: s.outlineWidth, style: s.outlineStyle }
    })
    expect(outline.style).not.toBe('none')
    expect(parseFloat(outline.width)).toBeGreaterThan(0)
  }
})

test('theme toggle exposes an accessible name that describes the action', async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: /mode/i })
  await expect(button).toHaveAttribute('aria-label', /(dark|light) mode/i)
})
