import { test, expect } from '@playwright/test'

test('above-the-fold content is visible on load', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.lede')).toBeVisible()
  await expect(page.locator('.lede')).toHaveClass(/is-in/)
})

test('content further down reveals when scrolled to', async ({ page }) => {
  await page.goto('/')
  const about = page.locator('section#about p')
  await about.scrollIntoViewIfNeeded()
  await expect(about).toHaveClass(/is-in/)
})

test('all content is visible without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('.lede')).toBeVisible()
  await expect(page.locator('section#about p')).toBeVisible()
  const opacity = await page
    .locator('.lede')
    .evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')
  await ctx.close()
})

test('reduced motion shows content immediately', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto('/')
  const opacity = await page
    .locator('section#about p')
    .evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')
  await ctx.close()
})

test('scroll-spy marks the section in view', async ({ page }) => {
  await page.goto('/')
  await page.locator('section#projects').scrollIntoViewIfNeeded()
  await expect(page.locator('nav a[href="#projects"]')).toHaveAttribute(
    'aria-current',
    'true',
  )
  await expect(page.locator('nav a[href="#experience"]')).not.toHaveAttribute(
    'aria-current',
    'true',
  )
})

test('nav anchors scroll to their sections', async ({ page }) => {
  await page.goto('/')
  await page.locator('nav a[href="#skills"]').click()
  await page.waitForFunction(() => {
    const el = document.querySelector('section#skills')
    if (!el) return false
    const top = el.getBoundingClientRect().top
    return top < 200 && top > -200
  })
})
