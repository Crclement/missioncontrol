import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3005',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx next dev --port 3005',
    port: 3005,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
