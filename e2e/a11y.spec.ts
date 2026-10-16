import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { loadDemos, ROUTES } from "./site";

for (const scheme of ["light", "dark"] as const) {
  for (const route of ROUTES) {
    test(`no axe violations: ${route} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(route);
      // Demos load lazily: bring them in so they get scanned too.
      await loadDemos(page);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual(
        [],
      );
    });
  }
}

test("no horizontal scroll at 375px on any route", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ROUTES) {
    await page.goto(route);
    // Measure once the demos have loaded and laid themselves out, not after a guessed delay.
    await loadDemos(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow, `${route} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
  }
});

test("skip link moves focus to the main content", async ({ page, browserName }) => {
  await page.goto("/");
  // Safari doesn't Tab to links by default; its users press Option-Tab.
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});
