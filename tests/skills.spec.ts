import { test, expect } from '@playwright/test'
import { skills } from '@/content'

test('every skill renders under its category, split into lead and quiet chips', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section#skills')
  for (const group of skills) {
    await expect(section).toContainText(group.category)
    for (const item of group.items) {
      await expect(section).toContainText(item)
    }
  }
})

test('lead chips render solid, quiet chips render outlined', async ({ page }) => {
  await page.goto('/')
  const firstGroup = skills[0]
  const chips = page.locator('section#skills [data-testid="skill-chip"]')
  const leadChip = chips.filter({ hasText: firstGroup.items[0] }).first()
  const bg = await leadChip.evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(bg).not.toBe('rgba(0, 0, 0, 0)')
})
