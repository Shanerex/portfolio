import { test, expect } from '@playwright/test'

test('defaults to dark on a first visit, regardless of OS preference', async ({ browser }) => {
  for (const colorScheme of ['dark', 'light'] as const) {
    const context = await browser.newContext({ colorScheme })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await context.close()
  }
})

test('stored theme is applied before first paint', async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.addInitScript(() => localStorage.setItem('srs-theme', 'light'))

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
  expect(themeAtDomReady).toBe('light')
  await ctx.close()
})

test('color-scheme follows the active theme', async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.addInitScript(() => localStorage.setItem('srs-theme', 'light'))
  await page.goto('/')
  const scheme = await page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  )
  expect(scheme).toBe('light')
  await ctx.close()
})

test('body background and text color follow the active theme', async ({ page }) => {
  await page.goto('/')
  for (const theme of ['dark', 'light'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
    await page.waitForTimeout(400)
    const [bodyBg, bodyColor, tokenBg, tokenInk] = await page.evaluate(() => {
      const bodyStyle = getComputedStyle(document.body)
      const rootStyle = getComputedStyle(document.documentElement)
      return [
        bodyStyle.backgroundColor,
        bodyStyle.color,
        rootStyle.getPropertyValue('--bg').trim(),
        rootStyle.getPropertyValue('--ink').trim(),
      ]
    })
    const hexToRgb = (hex: string) => {
      const n = hex.replace('#', '')
      const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16))
      return `rgb(${r}, ${g}, ${b})`
    }
    expect(bodyBg, `${theme}: body background`).toBe(hexToRgb(tokenBg))
    expect(bodyColor, `${theme}: body color`).toBe(hexToRgb(tokenInk))
  }
})

test('toggle switches the theme and persists it across reload', async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.getByRole('button', { name: /mode/i }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  const stored = await page.evaluate(() => localStorage.getItem('srs-theme'))
  expect(stored).toBe('light')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await ctx.close()
})
