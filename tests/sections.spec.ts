import { test, expect } from '@playwright/test'
import { about, experience, projects, site, skills } from '@/content'

test('all four sections exist with headings', async ({ page }) => {
  await page.goto('/')
  for (const item of site.nav) {
    const id = item.href.slice(1)
    const section = page.locator(`section#${id}`)
    await expect(section).toHaveCount(1)
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(item.label)
  }
})

test('lede renders above the first section', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.lede')).toHaveText(site.lede)
})

test('every role renders with all of its bullets', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#experience')
  await expect(section.getByRole('heading', { level: 3 })).toHaveCount(experience.length)

  for (const role of experience) {
    const entry = section.locator('article', { hasText: role.title }).first()
    await expect(entry).toContainText(role.dates)
    await expect(entry).toContainText(role.company)
    for (const bullet of role.bullets) {
      await expect(entry).toContainText(bullet)
    }
  }
})

test('every project renders and links out safely', async ({ page }) => {
  await page.goto('/')
  const rows = page.locator('section#projects a')
  await expect(rows).toHaveCount(projects.length)

  for (const [i, project] of projects.entries()) {
    const row = rows.nth(i)
    await expect(row).toHaveAttribute('href', project.href)
    await expect(row).toHaveAttribute('target', '_blank')
    await expect(row).toHaveAttribute('rel', /noreferrer/)
    await expect(row).toContainText(project.name)
    await expect(row).toContainText(project.stack)
    await expect(row).toContainText(project.description)
  }
})

test('project links are all external https URLs', async ({ page }) => {
  await page.goto('/')
  for (const project of projects) {
    expect(project.href, `${project.name} must use https`).toMatch(/^https:\/\//)
  }
})

test('every skill renders as a chip', async ({ page }) => {
  await page.goto('/')
  const chips = page.locator('section#skills li')
  await expect(chips).toHaveCount(skills.length)
  for (const [i, skill] of skills.entries()) {
    await expect(chips.nth(i)).toHaveText(skill)
  }
})

test('about renders the paragraph and the email link', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#about')
  await expect(section.locator('p')).toHaveText(about)
  const email = section.locator('a[href^="mailto:"]')
  await expect(email).toHaveText(`${site.email} →`)
  await expect(email).toHaveAttribute('href', `mailto:${site.email}`)
})
