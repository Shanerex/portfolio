import { test, expect } from '@playwright/test'
import { projects } from '@/content'

test('every project renders with its index, status and stack', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#projects')
  for (const [i, project] of projects.entries()) {
    await expect(section).toContainText(String(i + 1).padStart(2, '0'))
    await expect(section).toContainText(project.name)
    await expect(section).toContainText(project.stack)
    await expect(section).toContainText(
      project.status === 'in-progress' ? 'In progress' : 'Completed',
    )
    for (const line of project.description) {
      await expect(section).toContainText(line)
    }
  }
})

test('every linked project links out safely', async ({ page }) => {
  await page.goto('/')
  const linked = projects.filter((p) => p.href)
  for (const project of linked) {
    const link = page.locator(`section#projects a[href="${project.href}"]`)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noreferrer/)
    await expect(link).toContainText('View repo')
  }
})

test('project links are all https', () => {
  for (const project of projects) {
    if (!project.href) continue
    expect(project.href, `${project.name} must use https`).toMatch(/^https:\/\//)
  }
})
