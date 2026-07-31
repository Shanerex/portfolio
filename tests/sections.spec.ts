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

test('every linked project renders and links out safely', async ({ page }) => {
  await page.goto('/')
  const linked = projects.filter((project) => project.href)
  const rows = page.locator('section#projects a')
  await expect(rows).toHaveCount(linked.length)

  for (const [i, project] of linked.entries()) {
    const row = rows.nth(i)
    await expect(row).toHaveAttribute('href', project.href!)
    await expect(row).toHaveAttribute('target', '_blank')
    await expect(row).toHaveAttribute('rel', /noreferrer/)
    await expect(row).toContainText(project.name)
    await expect(row).toContainText(project.stack)
    await expect(row).toContainText(project.status === 'in-progress' ? 'In progress' : 'Completed')
    for (const bullet of project.description) {
      await expect(row).toContainText(bullet)
    }
  }
})

test('every project renders, linked or not', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#projects')
  for (const project of projects) {
    await expect(section).toContainText(project.name)
    await expect(section).toContainText(project.stack)
    await expect(section).toContainText(project.status === 'in-progress' ? 'In progress' : 'Completed')
    for (const bullet of project.description) {
      await expect(section).toContainText(bullet)
    }
  }
})

test('project links are all external https URLs', async ({ page }) => {
  await page.goto('/')
  for (const project of projects) {
    if (!project.href) continue
    expect(project.href, `${project.name} must use https`).toMatch(/^https:\/\//)
  }
})

test('every skill renders in content order under its category', async ({ page }) => {
  await page.goto('/')
  const allItems = skills.flatMap((group) => group.items)
  const items = page.locator('section#skills li')
  await expect(items).toHaveCount(allItems.length)
  for (const [i, skill] of allItems.entries()) {
    await expect(items.nth(i)).toHaveText(skill)
  }

  const section = page.locator('section#skills')
  for (const group of skills) {
    await expect(section).toContainText(group.category)
  }
})

test('each group splits into its lead skills and the rest', async ({ page }) => {
  await page.goto('/')
  for (const [i, group] of skills.entries()) {
    expect(group.lead, `${group.category} lead must be within items`).toBeLessThanOrEqual(
      group.items.length,
    )
    const lists = page.locator('section#skills h3').nth(i).locator('~ ul')
    const lead = lists.nth(0).locator('li')
    await expect(lead).toHaveCount(group.lead)
    await expect(lead.nth(0)).toHaveText(group.items[0])

    const restCount = group.items.length - group.lead
    if (restCount > 0) {
      await expect(lists.nth(1).locator('li')).toHaveCount(restCount)
    }
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

test('thesis is a single short line and no longer duplicated in the lede', () => {
  expect(site.thesis.length).toBeGreaterThan(0)
  expect(site.thesis.length).toBeLessThanOrEqual(60)
  expect(site.lede).not.toContain('last point')
})

test('every metric figure is a non-empty short string with a label', () => {
  expect(site.metrics).toHaveLength(4)
  for (const metric of site.metrics) {
    expect(metric.figure.length).toBeGreaterThan(0)
    expect(metric.figure.length).toBeLessThanOrEqual(10)
    expect(metric.label.length).toBeGreaterThan(0)
  }
})
