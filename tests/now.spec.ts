import { test, expect } from '@playwright/test'
import { now } from '@/content'

test('now renders every entry with its tag', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#now')
  await expect(section).toHaveCount(1)
  for (const entry of now) {
    await expect(section).toContainText(entry.tag)
    await expect(section).toContainText(entry.text)
  }
})

test('now sits after skills and before contact', async ({ page }) => {
  await page.goto('/')
  const ids = await page.locator('main section[id]').evaluateAll((els) =>
    els.map((el) => el.id),
  )
  expect(ids.indexOf('now')).toBeGreaterThan(ids.indexOf('skills'))
  expect(ids.indexOf('now')).toBeLessThan(ids.indexOf('contact'))
})
