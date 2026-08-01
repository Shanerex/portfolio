import { test, expect } from '@playwright/test'

test('defaults to night match on a first visit, regardless of OS preference', async ({ browser }) => {
  for (const colorScheme of ['dark', 'light'] as const) {
    const context = await browser.newContext({ colorScheme })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
    await context.close()
  }
})

test('a legacy stored theme migrates to the new names', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('srs-theme', 'light'))
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
})

test('toggle switches the theme and persists it across reload', async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')

  await page.getByRole('button', { name: /match/i }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')

  const stored = await page.evaluate(() => localStorage.getItem('srs-theme'))
  expect(stored).toBe('day')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
  await ctx.close()
})

test('stored theme is applied before first paint', async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.addInitScript(() => localStorage.setItem('srs-theme', 'day'))

  // Sample the attribute at the earliest possible moment in document lifetime.
  await page.goto('/', { waitUntil: 'commit' })
  const themeAtDomReady = await page.evaluate(() => {
    return new Promise<string | null>((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () =>
          resolve(document.documentElement.getAttribute('data-theme')),
        )
      } else {
        resolve(document.documentElement.getAttribute('data-theme'))
      }
    })
  })
  expect(themeAtDomReady).toBe('day')
  await ctx.close()
})

test('color-scheme follows the active theme', async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.addInitScript(() => localStorage.setItem('srs-theme', 'day'))
  await page.goto('/')
  const scheme = await page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  )
  expect(scheme).toBe('light')
  await ctx.close()
})
