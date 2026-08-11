import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('above-the-fold content is visible on load', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-testid="terminal-card"]')).toBeVisible()
  await expect(page.locator('[data-testid="terminal-card"]')).toHaveClass(/is-in/)
})

test('content further down reveals when scrolled to', async ({ page }) => {
  await page.goto('/')
  const now = page.locator('section#now')
  await now.scrollIntoViewIfNeeded()
  await expect(now).toHaveClass(/is-in/)
})

test('all content is visible without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.locator('[data-testid="terminal-card"]')).toBeVisible()
  const opacity = await page
    .locator('[data-testid="terminal-card"]')
    .evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')
  await ctx.close()
})

test('reduced motion shows content immediately', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto('/')
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('.reveal')].filter(
      (el) => getComputedStyle(el).opacity !== '1',
    ).length,
  )
  expect(hidden).toBe(0)
  await ctx.close()
})

test('scroll-spy marks the section in view', async ({ page }) => {
  await page.goto('/')
  await page.locator('section#projects').scrollIntoViewIfNeeded()
  await expect(page.locator('nav a[href="#projects"]')).toHaveAttribute('aria-current', 'true')
  await expect(page.locator('nav a[href="#skills"]')).not.toHaveAttribute('aria-current', 'true')
})

const lastNavItem = site.nav[site.nav.length - 1]

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet-breakpoint', width: 768, height: 1024 },
]) {
  test(`scroll-spy activates the final nav item at the bottom of the page (${viewport.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator(`nav a[href="${lastNavItem.href}"]`)).toHaveAttribute(
      'aria-current',
      'true',
    )
  })
}

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

test('failsafe timer reveals everything when the observer never fires', async ({ page }) => {
  await page.addInitScript(() => {
    class NoopObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
    // @ts-expect-error - intentionally replacing the global for this test
    window.IntersectionObserver = NoopObserver
  })

  await page.goto('/')

  await page.waitForTimeout(500)
  const revealedEarly = await page.locator('.reveal.is-in').count()
  expect(revealedEarly).toBe(0)

  await page.waitForFunction(() => {
    const targets = document.querySelectorAll('.reveal')
    return targets.length > 0 && Array.from(targets).every((el) => el.classList.contains('is-in'))
  })
  const total = await page.locator('.reveal').count()
  const revealedLate = await page.locator('.reveal.is-in').count()
  expect(revealedLate).toBe(total)
})

test('failsafe timer becomes a no-op once the observer has already revealed everything', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const start = performance.now()
    ;(window as unknown as { __clearTimeoutCalls: number[] }).__clearTimeoutCalls = []
    const originalClear = window.clearTimeout.bind(window)
    window.clearTimeout = ((...args: Parameters<typeof window.clearTimeout>) => {
      ;(window as unknown as { __clearTimeoutCalls: number[] }).__clearTimeoutCalls.push(
        performance.now() - start,
      )
      return originalClear(...args)
    }) as typeof window.clearTimeout
  })

  await page.goto('/')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  await page.waitForFunction(
    () => {
      const targets = document.querySelectorAll('.reveal')
      return (
        targets.length > 0 && Array.from(targets).every((el) => el.classList.contains('is-in'))
      )
    },
    { timeout: 1800 },
  )

  const clearCalls = await page.evaluate(
    () => (window as unknown as { __clearTimeoutCalls: number[] }).__clearTimeoutCalls,
  )
  expect(clearCalls.some((t) => t < 1800)).toBe(true)

  await page.waitForTimeout(2200)
  const total = await page.locator('.reveal').count()
  const revealed = await page.locator('.reveal.is-in').count()
  expect(revealed).toBe(total)
})
