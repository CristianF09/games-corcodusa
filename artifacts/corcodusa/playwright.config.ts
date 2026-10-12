import { defineConfig, devices } from "@playwright/test";

// Browser tests for every game. The API is mocked inside the tests (see e2e/helpers.ts),
// so these run without the backend or a database.
const PORT = 5173;

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `https://localhost:${PORT}`,
    ignoreHTTPSErrors: true, // Vite serves a self-signed certificate in dev
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: `https://localhost:${PORT}`,
    ignoreHTTPSErrors: true,
    reuseExistingServer: true,
    timeout: 120_000,
    env: { PORT: String(PORT) },
  },
});
