import { test, expect } from "@playwright/test"

test.describe("Build & Route Health", () => {
  test("dashboard page loads without 404s", async ({ page }) => {
    const errors: string[] = []
    page.on("response", (response) => {
      if (response.status() === 404) {
        errors.push(`404: ${response.url()}`)
      }
    })

    await page.goto("/")
    await page.waitForLoadState("networkidle")

    expect(errors).toEqual([])
    await expect(page.locator("text=Mission Control")).toBeVisible()
  })

  test("whitepaper page loads without 404s", async ({ page }) => {
    const errors: string[] = []
    page.on("response", (response) => {
      if (response.status() === 404) {
        errors.push(`404: ${response.url()}`)
      }
    })

    await page.goto("/whitepaper")
    await page.waitForLoadState("networkidle")

    expect(errors).toEqual([])
  })

  test("no console errors on dashboard load", async ({ page }) => {
    const consoleErrors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Filter out expected WebSocket connection errors (agent may not be running)
    const unexpected = consoleErrors.filter(
      (e) => !e.includes("WebSocket") && !e.includes("ws://")
    )
    expect(unexpected).toEqual([])
  })
})
