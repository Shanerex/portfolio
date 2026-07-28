import { test, expect } from '@playwright/test'

const WIDTHS = [1440, 1024, 768, 390]

test('no horizontal overflow at any breakpoint', async ({ page }) => {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflows, `horizontal overflow at ${width}px`).toBe(false)
  }
})

test('collapses to one column below 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await page.goto('/')
  const cols = await page
    .locator('.page')
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns)
  expect(cols.split(' ').length).toBe(1)

  const position = await page
    .locator('aside.sidebar')
    .evaluate((el) => getComputedStyle(el).position)
  expect(position).not.toBe('sticky')
})

test('stays two columns at 1024px and above', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto('/')
  const cols = await page
    .locator('.page')
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns)
  expect(cols.startsWith('340px')).toBe(true)
})

test('tap targets are at least 44px on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const interactive = page.locator('a[href], button')
  const count = await interactive.count()
  for (let i = 0; i < count; i++) {
    const box = await interactive.nth(i).boundingBox()
    if (!box) continue
    expect(
      Math.max(box.width, box.height),
      `element ${i} is smaller than 44px in both dimensions`,
    ).toBeGreaterThanOrEqual(44)
  }
})

test('theme toggle does not overlap content on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const toggle = await page.getByRole('button').boundingBox()
  const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
  expect(toggle).not.toBeNull()
  expect(heading).not.toBeNull()
  const overlaps =
    toggle!.x < heading!.x + heading!.width &&
    toggle!.x + toggle!.width > heading!.x &&
    toggle!.y < heading!.y + heading!.height &&
    toggle!.y + toggle!.height > heading!.y
  expect(overlaps).toBe(false)
})
