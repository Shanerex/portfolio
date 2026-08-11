import { test, expect } from '@playwright/test'
import { journey } from '@/content'

test('journey renders every entry oldest to newest with its dates and bullets/note', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#journey')
  await expect(section).toHaveCount(1)

  for (const entry of journey) {
    await expect(section).toContainText(entry.title)
    await expect(section).toContainText(entry.dateLabel)
    if (entry.kind === 'work') {
      for (const bullet of entry.bullets) {
        await expect(section).toContainText(bullet)
      }
    } else {
      await expect(section).toContainText(entry.note)
    }
  }
})

test('the current role is marked, and only the current role', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#journey')
  const currentEntries = journey.filter((e) => e.kind === 'work' && e.current)
  expect(currentEntries).toHaveLength(1)
  await expect(section).toContainText('current')
})

test('entries appear in document order oldest to newest', async ({ page }) => {
  await page.goto('/')
  const titles = await page.locator('section#journey h3').allTextContents()
  expect(titles).toEqual(journey.map((e) => e.title))
})
