import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env["CI"]);
/** ALL_BROWSERS=1 adds WebKit (Safari's engine) and Firefox to the default Chromium run. */
const isAllBrowsers = Boolean(process.env["ALL_BROWSERS"]);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // Launching a browser per core can stall a laptop — WebKit and Firefox most of all — so
  // local runs are capped, and a global timeout turns any hang into a fast failure.
  ...(isCI ? {} : { workers: isAllBrowsers ? 3 : 4 }),
  globalTimeout: 10 * 60_000,
  retries: isCI ? 1 : 0,
  reporter: isCI ? "github" : "list",
  // CI traces the retry of a failed test (Playwright's advice: cheap, and it's the run
  // that shows a flake); locally, keep the trace of whatever failed.
  use: { baseURL: "http://localhost:4173", trace: isCI ? "on-first-retry" : "retain-on-failure" },
  // Tests run against the real static export — the exact files that ship. Never reuse a
  // running server: one left over from before a rebuild would serve stale files.
  webServer: {
    // The pinned dev dependency: no download, and the same version every run.
    command: "npx serve out -l 4173",
    port: 4173,
    reuseExistingServer: false,
  },
  // CI runs Chromium for speed; view transitions and scroll-driven CSS differ most
  // across engines, so run all three locally before a release.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    ...(isAllBrowsers
      ? [
          { name: "webkit", use: { ...devices["Desktop Safari"] } },
          { name: "firefox", use: { ...devices["Desktop Firefox"] } },
        ]
      : []),
  ],
});
