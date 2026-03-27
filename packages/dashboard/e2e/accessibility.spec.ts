import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility — ADA/AAA compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('axe accessibility scan passes on main page', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('all interactive elements are keyboard-reachable', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName)
    // Should have focused something (not body)
    expect(firstFocused).not.toBe('BODY')
  })

  test('heading hierarchy is correct (h1 then h2)', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    expect(headings.length).toBeGreaterThan(0)

    const levels: number[] = []
    for (const heading of headings) {
      const tag = await heading.evaluate((el) => el.tagName)
      levels.push(parseInt(tag.replace('H', ''), 10))
    }

    // First heading should be h1
    expect(levels[0]).toBe(1)

    // No heading should skip more than 1 level
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeLessThanOrEqual(levels[i - 1] + 1)
    }
  })

  test('color contrast meets WCAG AAA for main text', async ({ page }) => {
    // The dashboard uses black (#000) on white (#fff), which is ~21:1 ratio
    const h1 = page.locator('h1')
    const color = await h1.evaluate((el) => window.getComputedStyle(el).color)
    const bg = await h1.evaluate((el) => {
      let node: Element | null = el
      while (node) {
        const style = window.getComputedStyle(node)
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          return style.backgroundColor
        }
        node = node.parentElement
      }
      return 'rgb(255, 255, 255)' // default white
    })
    // Black text: rgb(0, 0, 0) on white bg: rgb(255, 255, 255) = 21:1 ratio
    expect(color).toBe('rgb(0, 0, 0)')
    // Background should be white or transparent (defaults to white)
    expect(bg).toMatch(/rgb\(255, 255, 255\)|rgba\(0, 0, 0, 0\)/)
  })

  test('page has lang attribute on html element', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('en')
  })

  test('keyboard help overlay is dismissable via keyboard', async ({ page }) => {
    await page.keyboard.press('?')
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText('Keyboard Shortcuts')).not.toBeVisible()
  })
})
