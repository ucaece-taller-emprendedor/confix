import { defineConfig, devices } from '@playwright/test'

// El puerto tiene que coincidir con BETTER_AUTH_URL del .env (por defecto 3000).
const port = Number(process.env.PORT ?? 3000)

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 2 : 0,
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
  },
  // Necesita .env con una base migrada y con el seed de demo (ver README).
  webServer: {
    command: process.env.CI ? `npm run start -- -p ${port}` : `npm run dev -- -p ${port}`,
    url: `http://localhost:${port}`,
    // Nunca reutiliza un servidor ya abierto: podría ser de otra app y el test crearía usuarios ahí.
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
