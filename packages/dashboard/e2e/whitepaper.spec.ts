import { test, expect } from '@playwright/test'

test.describe('Whitepaper — Password-gated page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so the password gate is always shown
    await page.goto('/whitepaper')
    await page.evaluate(() => localStorage.removeItem('wp_access'))
    await page.reload()
  })

  test('whitepaper page loads and shows password gate', async ({ page }) => {
    await expect(page.getByText('mission control')).toBeVisible()
    await expect(page.getByText('Investment Thesis')).toBeVisible()
    await expect(page.getByPlaceholder('enter access code')).toBeVisible()
  })

  test('invalid password shows error', async ({ page }) => {
    await page.getByPlaceholder('you@company.com').fill('test@test.com')
    await page.getByPlaceholder('enter access code').fill('wrong')
    await page.getByRole('button', { name: /access thesis/i }).click()
    await expect(page.getByText('incorrect password')).toBeVisible()
  })

  test('correct password grants access', async ({ page }) => {
    await page.getByPlaceholder('you@company.com').fill('test@test.com')
    await page.getByPlaceholder('enter access code').fill('apollo')
    await page.getByRole('button', { name: /access thesis/i }).click()

    // Should now show the whitepaper content
    await expect(page.getByText('Market Sizing & TAM')).toBeVisible({ timeout: 10000 })
  })

  test('password is case-insensitive', async ({ page }) => {
    await page.getByPlaceholder('you@company.com').fill('test@test.com')
    await page.getByPlaceholder('enter access code').fill('Apollo')
    await page.getByRole('button', { name: /access thesis/i }).click()

    await expect(page.getByText('Market Sizing & TAM')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Whitepaper — Content', () => {
  test.beforeEach(async ({ page }) => {
    // Unlock the whitepaper via localStorage
    await page.goto('/whitepaper')
    await page.evaluate(() => {
      localStorage.setItem('wp_access', '1')
      localStorage.setItem('wp_email', 'test@test.com')
    })
    await page.reload()
  })

  test('all 12 sections render', async ({ page }) => {
    const sections = [
      'Market Sizing & TAM',
      'Competitive Landscape',
      'Customer Personas',
      'Industry Trends',
      'SWOT',
      'Pricing Strategy',
      'Go-to-Market',
      'Customer Journey',
      'Financial Model',
      'Risk Assessment',
      'Market Entry',
      'Executive Synthesis',
    ]

    for (const section of sections) {
      await expect(
        page.getByText(section, { exact: false }).first()
      ).toBeVisible({ timeout: 10000 })
    }
  })

  test('contact form at the bottom works', async ({ page }) => {
    // Scroll to the bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    const emailInput = page.getByPlaceholder('you@company.com')
    // The contact form email input is the second one (first is in the gate which is hidden)
    await emailInput.fill('investor@fund.com')

    const sendButton = page.getByRole('button', { name: /send/i })
    await sendButton.click()

    // Should show confirmation
    await expect(page.getByText('Received. We will be in touch.')).toBeVisible()
  })

  test('table of contents sections are scroll-targetable', async ({ page }) => {
    // Each section should have an id attribute for anchoring
    const sectionIds = [
      'market-sizing',
      'competitive-landscape',
      'customer-personas',
      'industry-trends',
      'swot-porters',
      'pricing',
      'gtm',
      'customer-journey',
      'financials',
      'risk',
      'expansion',
      'synthesis',
    ]

    for (const id of sectionIds) {
      const section = page.locator(`#${id}`)
      await expect(section).toBeAttached()
    }
  })
})
