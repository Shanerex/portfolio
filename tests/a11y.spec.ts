import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const scheme of ['light', 'dark'] as const) {
  test(`no accessibility violations in ${scheme} theme`, async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: scheme })
    const page = await ctx.newPage()
    await page.goto('/')
    // Reveal everything first — axe should not judge mid-animation opacity.
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
  await expect(page.locator('aside')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
})

test('every interactive element shows a focus ring', async ({ page }) => {
  await page.goto('/')
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

test('theme toggle exposes an accessible name that describes the action', async ({
  page,
}) => {
  await page.goto('/')
  const button = page.getByRole('button')
  await expect(button).toHaveAttribute('aria-label', /switch to (day|night) match/i)
})
