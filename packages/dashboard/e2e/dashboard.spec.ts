import { test, expect } from '@playwright/test'

test.describe('Dashboard — Core functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads and shows "Mission Control" header', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toHaveText('Mission Control')
  })

  test('shows "No active sessions" when agent is disconnected', async ({ page }) => {
    // Without the WebSocket agent running, the dashboard should show an empty state
    await expect(page.getByText('No active sessions')).toBeVisible()
  })

  test('shows connection status text when no agent', async ({ page }) => {
    // Should show either "Connecting to agent..." or "Disconnected" message
    const statusText = page.getByText(/connecting to agent|disconnected/i)
    await expect(statusText).toBeVisible()
  })

  test('grid view is the default view', async ({ page }) => {
    // The Grid button should be bold/active by default
    const gridButton = page.getByRole('button', { name: 'Grid' })
    await expect(gridButton).toHaveClass(/font-bold/)
  })

  test('pressing "v" toggles to orbital view and back', async ({ page }) => {
    const gridButton = page.getByRole('button', { name: 'Grid' })
    const orbitalButton = page.getByRole('button', { name: 'Orbital' })

    // Initially grid is active
    await expect(gridButton).toHaveClass(/font-bold/)

    // Press v to toggle to orbital
    await page.keyboard.press('v')
    await expect(orbitalButton).toHaveClass(/font-bold/)

    // Press v again to toggle back to grid
    await page.keyboard.press('v')
    await expect(gridButton).toHaveClass(/font-bold/)
  })

  test('pressing "?" opens keyboard help overlay', async ({ page }) => {
    await page.keyboard.press('?')
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible()
  })

  test('pressing "?" again closes keyboard help overlay', async ({ page }) => {
    await page.keyboard.press('?')
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible()

    await page.keyboard.press('?')
    await expect(page.getByText('Keyboard Shortcuts')).not.toBeVisible()
  })

  test('pressing Escape closes keyboard help overlay', async ({ page }) => {
    await page.keyboard.press('?')
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByText('Keyboard Shortcuts')).not.toBeVisible()
  })

  test('help overlay contains correct shortcut descriptions', async ({ page }) => {
    await page.keyboard.press('?')

    const overlay = page.locator('.fixed.inset-0.z-50')
    await expect(overlay.getByText('Navigate between sessions')).toBeVisible()
    await expect(overlay.getByText('Jump to session')).toBeVisible()
    await expect(overlay.getByText('Toggle Grid / Orbital view')).toBeVisible()
    await expect(overlay.getByText('Close / unfocus')).toBeVisible()
    await expect(overlay.getByText('Reconnect')).toBeVisible()
    await expect(overlay.getByText('This help')).toBeVisible()
  })

  test('clicking Grid/Orbital buttons switches views', async ({ page }) => {
    const orbitalButton = page.getByRole('button', { name: 'Orbital' })
    const gridButton = page.getByRole('button', { name: 'Grid' })

    await orbitalButton.click()
    await expect(orbitalButton).toHaveClass(/font-bold/)

    await gridButton.click()
    await expect(gridButton).toHaveClass(/font-bold/)
  })
})
