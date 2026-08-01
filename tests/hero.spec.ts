import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('hero fills the viewport and states the thesis as the only h1', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const hero = page.locator('section#hero')
  await expect(hero).toHaveCount(1)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toContainText(site.thesis)
  const box = await hero.boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(850)
})

test('hero names Shane and his role above the fold', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('section#hero')
  await expect(hero).toContainText(site.name.join(' '))
  await expect(hero).toContainText('Senior Software Engineer')
})

test('with reduced motion the hero is fully visible immediately', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  const opacity = await page.locator('h1').evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')
  await context.close()
})
