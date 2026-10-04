import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/about",
  "/notes",
  "/work/four-rails-one-checkout",
  "/work/charity-portal",
  "/work/multi-brand-checkout",
  "/notes/debounce-is-not-a-race-guard",
  "/notes/load-sdks-on-mount",
  "/notes/async-intersection-observer-mock",
];

for (const scheme of ["light", "dark"] as const) {
  for (const route of routes) {
    test(`no axe violations: ${route} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(route);
      // Bring any demo on the page into view so it loads and gets scanned too.
      const demo = page.locator('[aria-label^="Interactive demo"]');
      if (await demo.count()) {
        await demo.first().scrollIntoViewIfNeeded();
        await expect(demo.first().getByText("Loading interactive demo")).toHaveCount(0);
      }
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }
}

test("no horizontal scroll at 375px on any route", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of routes) {
    await page.goto(route);
    const demo = page.locator('[aria-label^="Interactive demo"]');
    if (await demo.count()) await demo.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow, `${route} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
  }
});

test("skip link moves focus to the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});
