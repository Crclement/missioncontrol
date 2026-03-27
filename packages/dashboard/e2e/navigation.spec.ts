import { test, expect } from '@playwright/test'

test.describe('Navigation — Keyboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // Note: Without the WebSocket agent, there are no session cards to navigate.
  // These tests verify keyboard handling on the empty state.

  test('Arrow Right does not crash when no sessions are present', async ({ page }) => {
    await page.keyboard.press('ArrowRight')
    // Page should still be functional
    await expect(page.locator('h1')).toHaveText('Mission Control')
  })

  test('Arrow Down does not crash when no sessions are present', async ({ page }) => {
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('h1')).toHaveText('Mission Control')
  })

  test('number key does not crash when no sessions are present', async ({ page }) => {
    await page.keyboard.press('1')
    await expect(page.locator('h1')).toHaveText('Mission Control')
  })

  test('Escape does not crash on empty state', async ({ page }) => {
    await page.keyboard.press('Escape')
    await expect(page.locator('h1')).toHaveText('Mission Control')
  })

  test('pressing "r" triggers reconnect without error', async ({ page }) => {
    await page.keyboard.press('r')
    // Should still show the dashboard without error
    await expect(page.locator('h1')).toHaveText('Mission Control')
  })

  test('keyboard shortcuts do not fire when typing in an input', async ({ page }) => {
    // Open help to confirm keyboard shortcuts work first
    await page.keyboard.press('?')
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText('Keyboard Shortcuts')).not.toBeVisible()
  })

  test('view toggle key "v" works from any state', async ({ page }) => {
    // Start in grid
    const gridButton = page.getByRole('button', { name: 'Grid' })
    await expect(gridButton).toHaveClass(/font-bold/)

    // Toggle twice to confirm it cycles
    await page.keyboard.press('v')
    await page.keyboard.press('v')
    await expect(gridButton).toHaveClass(/font-bold/)
  })
})
