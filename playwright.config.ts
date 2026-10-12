import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // WebKit and Firefox processes can hang when many run at once on one machine, so the
  // cross-browser run is capped. A global timeout turns any hang into a fast failure.
  workers: process.env.ALL_BROWSERS ? 3 : undefined,
  globalTimeout: process.env.ALL_BROWSERS ? 10 * 60_000 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:4173", trace: "retain-on-failure" },
  // Tests run against the real static export — the exact files that ship.
  webServer: {
    command: "npx --yes serve@14 out -l 4173",
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  // CI runs Chromium for speed. Locally, ALL_BROWSERS=1 adds WebKit (Safari's engine)
  // and Firefox — view transitions and scroll-driven CSS differ most across engines.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    ...(process.env.ALL_BROWSERS
      ? [
          { name: "webkit", use: { ...devices["Desktop Safari"] } },
          { name: "firefox", use: { ...devices["Desktop Firefox"] } },
        ]
      : []),
  ],
});
