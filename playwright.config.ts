import { defineConfig } from "@playwright/test";

// Runs against the production build in demo mode (no Clerk keys). Build first: `npm run build`.
// Uses the system Microsoft Edge so no browser download is needed.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [["list"]],
  outputDir: "test-results",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: "http://localhost:3500",
    channel: "msedge",
    video: "off",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npx next start -p 3500",
    url: "http://localhost:3500/api/health",
    reuseExistingServer: true,
    timeout: 120_000,
    env: { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "", CLERK_SECRET_KEY: "" },
  },
});
