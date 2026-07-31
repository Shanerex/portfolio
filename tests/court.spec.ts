import { test, expect } from '@playwright/test'

test('the court grid uses real doubles-court proportions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  // Task 2 defines `.court` as a reusable grid system; no real content
  // consumes it yet (that starts with Hero in Task 3). Probe the rule
  // directly on a throwaway element so this test verifies the grid math
  // itself, independent of who applies the class.
  const cols = await page.evaluate(() => {
    const probe = document.createElement('div')
    probe.className = 'court'
    document.body.appendChild(probe)
    const value = getComputedStyle(probe).gridTemplateColumns
    probe.remove()
    return value
  })
  // getComputedStyle resolves fr tracks to absolute px strings (e.g. "148px");
  // Number() rejects the unit suffix and yields NaN, so use parseFloat.
  const widths = cols.split(' ').map(parseFloat)
  expect(widths).toHaveLength(4)
  // 1fr 3fr 3fr 1fr — the alleys are one third of the service boxes
  expect(widths[1] / widths[0]).toBeCloseTo(3, 1)
  expect(widths[2] / widths[3]).toBeCloseTo(3, 1)
  expect(widths[0]).toBeCloseTo(widths[3], 0)
})

test('court lines render behind content and are decorative', async ({ page }) => {
  await page.goto('/')
  const lines = page.locator('[data-testid="court-lines"]')
  await expect(lines).toHaveCount(1)
  await expect(lines).toHaveAttribute('aria-hidden', 'true')
  const position = await lines.evaluate((el) => getComputedStyle(el).position)
  expect(position).toBe('fixed')
})

test('with reduced motion the court lines are drawn immediately', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  const name = await page
    .locator('[data-testid="court-lines"]')
    .evaluate((el) => getComputedStyle(el, '::before').animationName)
  expect(name).toBe('none')
  await context.close()
})
