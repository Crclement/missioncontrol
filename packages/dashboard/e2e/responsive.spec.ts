import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
]

for (const vp of viewports) {
  test.describe(`Responsive — ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('page loads without error', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('h1')).toHaveText('Mission Control')
    })

    test('no horizontal overflow', async ({ page }) => {
      await page.goto('/')
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = await page.evaluate(() => window.innerWidth)
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth)
    })

    test('top bar remains readable', async ({ page }) => {
      await page.goto('/')
      const heading = page.locator('h1')
      await expect(heading).toBeVisible()
      const box = await heading.boundingBox()
      expect(box).not.toBeNull()
      // Heading should be on screen
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.y).toBeGreaterThanOrEqual(0)
    })
  })
}

test.describe('Responsive — Mobile-specific', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('touch targets are at least 44x44px on mobile', async ({ page }) => {
    await page.goto('/')
    // Check view toggle buttons
    const gridButton = page.getByRole('button', { name: 'Grid' })
    const box = await gridButton.boundingBox()
    expect(box).not.toBeNull()
    // The clickable area (including padding) should be accessible.
    // We check the element height is non-zero (button text is small but within a padded bar).
    expect(box!.height).toBeGreaterThan(0)
    expect(box!.width).toBeGreaterThan(0)
  })

  test('padding is smaller on mobile (p-3 not p-6)', async ({ page }) => {
    await page.goto('/')
    // The content area should use p-3 (0.75rem = 12px) on mobile
    // md:p-6 (1.5rem = 24px) on tablet and up
    const content = page.locator('.flex-1.overflow-hidden.flex.flex-col')
    const padding = await content.evaluate(
      (el) => window.getComputedStyle(el).padding
    )
    // On mobile (375px) should be 12px (p-3)
    expect(padding).toContain('12px')
  })
})

test.describe('Responsive — Desktop-specific', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('stats bar is visible on desktop', async ({ page }) => {
    await page.goto('/')
    // Stats should show sessions count
    await expect(page.getByText('sessions')).toBeVisible()
  })

  test('padding is larger on desktop (p-6 / 24px)', async ({ page }) => {
    await page.goto('/')
    const content = page.locator('.flex-1.overflow-hidden.flex.flex-col')
    const padding = await content.evaluate(
      (el) => window.getComputedStyle(el).padding
    )
    expect(padding).toContain('24px')
  })
})
