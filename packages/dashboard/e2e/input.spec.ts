import { test, expect } from '@playwright/test'

// Note: The response input functionality requires active sessions from the
// WebSocket agent. Without the agent running, we cannot test the full input
// flow with real session cards. These tests verify the keyboard shortcut
// behavior on the empty state and ensure the input mode mechanics work.

test.describe('Input — Response input behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Enter key does not open input when no card is focused', async ({ page }) => {
    // With focusedIndex = -1 (no focus), Enter should not open input mode
    await page.keyboard.press('Enter')
    // No textarea should appear since there are no sessions
    const textareas = await page.locator('textarea').count()
    expect(textareas).toBe(0)
  })

  test('Space key does not open voice mode when no card is focused', async ({ page }) => {
    await page.keyboard.press(' ')
    // No voice prompt should appear
    const voicePrompt = page.getByText('Press spacebar and speak to respond')
    await expect(voicePrompt).not.toBeVisible()
  })

  test('keyboard shortcuts still work after pressing Enter on empty state', async ({ page }) => {
    await page.keyboard.press('Enter')
    // Should still be able to toggle help
    await page.keyboard.press('?')
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible()
  })

  test('Escape returns to neutral state', async ({ page }) => {
    // Press various keys then Escape
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Escape')
    // Page should still be functional
    await expect(page.locator('h1')).toHaveText('Mission Control')
  })

  test('view toggle works after keyboard interaction', async ({ page }) => {
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Escape')
    await page.keyboard.press('v')
    const orbitalButton = page.getByRole('button', { name: 'Orbital' })
    await expect(orbitalButton).toHaveClass(/font-bold/)
  })
})
