import { defineConfig, devices } from "@playwright/test";
import path from "path";

const rootDir = path.resolve(__dirname, "../..");
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3001";
const backendURL = process.env.E2E_BACKEND_URL ?? "http://localhost:3000";

/**
 * Admin E2E. Expects:
 * - `npm run seed:e2e -w laundry-backend` (once / when fixtures drift)
 * - JWT_ACCESS_SECRET shared by backend + admin `.env.local`
 * - webServer below starts backend + admin unless already running
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "npm run dev -w laundry-backend",
      cwd: rootDir,
      url: `${backendURL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev -w laundry-admin-dashboard",
      cwd: rootDir,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
