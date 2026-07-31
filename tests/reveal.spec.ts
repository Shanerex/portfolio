import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('above-the-fold content is visible on load', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-testid="intro"]')).toBeVisible()
  await expect(page.locator('[data-testid="intro"]')).toHaveClass(/is-in/)
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
  await expect(page.locator('[data-testid="intro"]')).toBeVisible()
  await expect(page.locator('section#about p')).toBeVisible()
  const opacity = await page
    .locator('[data-testid="intro"]')
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
    await expect(
      page.locator(`nav a[href="${lastNavItem.href}"]`),
    ).toHaveAttribute('aria-current', 'true')
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

test('failsafe timer reveals everything when the observer never fires', async ({
  page,
}) => {
  // Stub IntersectionObserver so it's constructed (JS still runs) but its
  // callback is never invoked — simulating an environment where the
  // observer silently never fires or never intersects.
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

  // Well before the 2s failsafe: nothing should be revealed since the
  // (stubbed) observer never calls back.
  await page.waitForTimeout(500)
  const revealedEarly = await page.locator('.reveal.is-in').count()
  expect(revealedEarly).toBe(0)

  // Past the 2s mark: the timer failsafe must have kicked in and revealed
  // everything, since the observer never did.
  await page.waitForFunction(() => {
    const targets = document.querySelectorAll('.reveal')
    return (
      targets.length > 0 &&
      Array.from(targets).every((el) => el.classList.contains('is-in'))
    )
  })
  const total = await page.locator('.reveal').count()
  const revealedLate = await page.locator('.reveal.is-in').count()
  expect(revealedLate).toBe(total)
})

test('failsafe timer becomes a no-op once the observer has already revealed everything', async ({
  page,
}) => {
  // Instrument window.clearTimeout so we can prove the failsafe timer was
  // cancelled early (before the 2s mark) once the real observer finished
  // revealing every .reveal target on its own — this is the fix for
  // Finding 1: the timer must not be unconditional.
  await page.addInitScript(() => {
    const start = performance.now()
    ;(window as unknown as { __clearTimeoutCalls: number[] }).__clearTimeoutCalls =
      []
    const originalClear = window.clearTimeout.bind(window)
    window.clearTimeout = ((...args: Parameters<typeof window.clearTimeout>) => {
      ;(
        window as unknown as { __clearTimeoutCalls: number[] }
      ).__clearTimeoutCalls.push(performance.now() - start)
      return originalClear(...args)
    }) as typeof window.clearTimeout
  })

  await page.goto('/')

  // Jump-scroll to the bottom so every real .reveal target on the page
  // actually intersects the viewport at some point and gets revealed by
  // the (real, unstubbed) observer well before the 2s failsafe fires.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  // All reveal targets should be revealed by the observer well before the
  // 2s failsafe would fire.
  await page.waitForFunction(
    () => {
      const targets = document.querySelectorAll('.reveal')
      return (
        targets.length > 0 &&
        Array.from(targets).every((el) => el.classList.contains('is-in'))
      )
    },
    { timeout: 1800 },
  )

  // Confirm the failsafe's clearTimeout fired early (well under the 2000ms
  // mark), proving the timer was cancelled rather than left to fire
  // unconditionally.
  const clearCalls = await page.evaluate(
    () => (window as unknown as { __clearTimeoutCalls: number[] }).__clearTimeoutCalls,
  )
  expect(clearCalls.some((t) => t < 1800)).toBe(true)

  // Wait past the 2s mark and confirm nothing broke / re-triggered: still
  // everything revealed, no stray state changes.
  await page.waitForTimeout(2200)
  const total = await page.locator('.reveal').count()
  const revealed = await page.locator('.reveal.is-in').count()
  expect(revealed).toBe(total)
})
