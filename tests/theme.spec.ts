import { test, expect } from '@playwright/test'

test('defaults to dark when the OS prefers dark', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await ctx.close()
})

test('defaults to light when the OS prefers light', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'light' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await ctx.close()
})

test('toggle switches the theme and persists it across reload', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'light' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  await page.getByRole('button', { name: /theme/i }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  const stored = await page.evaluate(() => localStorage.getItem('srs-theme'))
  expect(stored).toBe('dark')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await ctx.close()
})

test('stored theme is applied before first paint', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'light' })
  const page = await ctx.newPage()
  await page.addInitScript(() => localStorage.setItem('srs-theme', 'dark'))

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
  expect(themeAtDomReady).toBe('dark')
  await ctx.close()
})

test('color-scheme follows the active theme', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' })
  const page = await ctx.newPage()
  await page.goto('/')
  const scheme = await page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  )
  expect(scheme).toBe('dark')
  await ctx.close()
})
