import { test, expect } from '@playwright/test'

test('page has the correct title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Shane Rex Sasikumar — Senior Software Engineer')
})

test('static export emits a single page', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
})
