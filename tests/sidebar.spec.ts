import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('sidebar renders identity and blurb', async ({ page }) => {
  await page.goto('/')
  const aside = page.locator('aside.sidebar')
  const heading = aside.getByRole('heading', { level: 2 })
  for (const part of site.name) {
    await expect(heading).toContainText(part)
  }
  await expect(aside).toContainText(site.blurb)
})

test('sidebar nav links point at every section', async ({ page }) => {
  await page.goto('/')
  const nav = page.locator('aside.sidebar nav')
  await expect(nav.getByRole('link')).toHaveCount(site.nav.length)
  for (const item of site.nav) {
    await expect(nav.locator(`a[href="${item.href}"]`)).toHaveText(item.label)
  }
})

test('sidebar footer shows location, availability and contact links', async ({ page }) => {
  await page.goto('/')
  const aside = page.locator('aside.sidebar')
  await expect(aside).toContainText(site.location)
  await expect(aside).toContainText(site.availability)
  await expect(aside.locator('a[href^="mailto:"]')).toHaveCount(1)
  for (const link of site.links) {
    await expect(aside.locator(`a[href="${link.href}"]`)).toHaveText(link.label)
  }
})

test('CV link opens a PDF in a new tab', async ({ page }) => {
  await page.goto('/')
  const cv = page.locator('aside.sidebar a', { hasText: 'CV' })
  await expect(cv).toHaveAttribute('href', /\.pdf$/)
  await expect(cv).toHaveAttribute('target', '_blank')
  await expect(cv).toHaveAttribute('rel', /noreferrer/)
})

test('external sidebar links are safe', async ({ page }) => {
  await page.goto('/')
  const external = page.locator('aside.sidebar a[href^="https://"]')
  const count = await external.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    await expect(external.nth(i)).toHaveAttribute('rel', /noreferrer/)
  }
})
