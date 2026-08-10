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

test('each group splits into exactly its lead count of solid chips and the rest as outlined', async ({ page }) => {
  await page.goto('/')
  const groups = page.locator('section#skills > div:last-child > div')
  for (const [i, group] of skills.entries()) {
    const chips = groups.nth(i).locator('[data-testid="skill-chip"]')
    await expect(chips).toHaveCount(group.items.length)

    const leadCount = group.lead
    const quietCount = group.items.length - group.lead

    // Lead chips are the first `group.lead` in document order and render solid
    // (non-transparent background); the rest render outlined (transparent bg).
    for (let j = 0; j < group.items.length; j++) {
      const chip = chips.nth(j)
      const bg = await chip.evaluate((el) => getComputedStyle(el).backgroundColor)
      const isSolid = bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'
      if (j < leadCount) {
        expect(isSolid, `${group.category} item ${j} should be a lead (solid) chip`).toBe(true)
      } else {
        expect(isSolid, `${group.category} item ${j} should be a quiet (outlined) chip`).toBe(false)
      }
    }
    void quietCount // keep the intent explicit even though it's implied by the loop above
  }
})
