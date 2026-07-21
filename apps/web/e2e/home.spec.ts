import { expect, test } from '@playwright/test'

test('loads the Sibhive home page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Sibhive' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Create your hive' })).toBeVisible()
})

test('stays within the viewport at desktop and mobile widths', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 375, height: 812 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )

    expect(hasHorizontalOverflow).toBe(false)
  }
})

test('provides keyboard focus for every visible link', async ({ page }) => {
  await page.goto('/')

  const links = page.getByRole('link')
  const linkCount = await links.count()

  for (let index = 0; index < linkCount; index += 1) {
    await page.keyboard.press('Tab')
    await expect(links.nth(index)).toBeFocused()
  }
})
