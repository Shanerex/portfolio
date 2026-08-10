import { test, expect } from '@playwright/test'
import { site } from '@/content'

test('contact closes the page with a headline and three CTAs', async ({ page }) => {
  await page.goto('/')
  const contact = page.locator('section#contact')
  await expect(contact).toHaveCount(1)
  await expect(contact.getByRole('heading', { level: 2 })).toContainText(
    "Let's build something that stays up.",
  )

  const email = contact.locator(`a[href="mailto:${site.email}"]`)
  await expect(email).toHaveCount(1)

  await expect(contact.locator(`a[href="${site.resumeHref}"]`)).toHaveCount(1)

  for (const href of [site.linkedin, site.github]) {
    const link = contact.locator(`a[href="${href}"]`)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noreferrer/)
  }

  await expect(contact).toContainText(site.location)
  await expect(contact).toContainText(site.availability)
  await expect(contact).toContainText(String(new Date().getFullYear()))
})

test('contact is the last section on the page', async ({ page }) => {
  await page.goto('/')
  const ids = await page.locator('main section[id]').evaluateAll((els) => els.map((el) => el.id))
  expect(ids[ids.length - 1]).toBe('contact')
})
