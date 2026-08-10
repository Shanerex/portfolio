import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('hero states the name as the only h1, with the thesis and blurb nearby', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const hero = page.locator('section#hero')
  await expect(hero).toHaveCount(1)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toContainText(site.name[0])
  await expect(page.locator('h1')).toContainText(site.name[1])
  await expect(hero).toContainText(site.thesis)
  await expect(hero).toContainText(site.blurb)
  await expect(hero).toContainText(site.lede)
})

test('hero shows the headshot and the health-check terminal card', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('section#hero')
  const photo = hero.locator('img[src="/headshot.jpg"]')
  await expect(photo).toHaveCount(1)
  await expect(photo).toHaveAttribute('alt', /.+/)

  const card = page.locator('[data-testid="terminal-card"]')
  await expect(card).toContainText('health-check.sh')
  await expect(card).toContainText('99.99%')
})

test('CTA row links to email, LinkedIn and GitHub safely', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('section#hero')
  await expect(hero.locator(`a[href="mailto:${site.email}"]`)).toHaveCount(1)

  for (const href of [site.linkedin, site.github]) {
    const link = hero.locator(`a[href="${href}"]`)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noreferrer/)
  }

  await expect(hero).toContainText(site.availability)
  await expect(hero).toContainText(site.location)
})

test('with reduced motion the hero is fully visible immediately', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  const opacity = await page.locator('h1').evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')
  await context.close()
})
