import { test, expect } from '@playwright/test'

test('progress bar width tracks scroll position', async ({ page }) => {
  await page.goto('/')
  const bar = page.locator('[data-testid="scroll-progress"]')
  const before = await bar.evaluate((el) => parseFloat(getComputedStyle(el).width))
  expect(before).toBeLessThan(5)

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(200)
  const after = await bar.evaluate((el) => parseFloat(getComputedStyle(el).width))
  const viewport = page.viewportSize()!
  expect(after).toBeGreaterThan(viewport.width * 0.9)
})

test('scroll-to-top button appears past 480px and returns to the top on click', async ({ page }) => {
  await page.goto('/')
  const button = page.locator('[data-testid="scroll-top"]')
  await expect(button).toBeHidden()

  await page.evaluate(() => window.scrollTo(0, 600))
  await page.waitForTimeout(200)
  await expect(button).toBeVisible()

  await button.click()
  await page.waitForFunction(() => window.scrollY < 10)
})
