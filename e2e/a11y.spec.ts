import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { loadDemos, NOT_FOUND, ROUTES, waitForHydration } from "./site";

const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
const violationsOf = async (page: Page) =>
  (await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze()).violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );

for (const scheme of ["light", "dark"] as const) {
  test(`no axe violations: the 404 page (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const response = await page.goto(NOT_FOUND);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await violationsOf(page)).toEqual([]);
  });

  test(`no axe violations: the ⌘K palette, open (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await waitForHydration(page);
    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
    // Every group has its heading for a name.
    for (const group of await page.getByRole("dialog").getByRole("group").all()) {
      await expect(group).toHaveAccessibleName(/\w/);
    }
    expect(await violationsOf(page)).toEqual([]);
  });

  test(`no axe violations: the ⌘K palette, searching the writing (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await waitForHydration(page);
    await page.keyboard.press("ControlOrMeta+k");
    await page.getByRole("combobox", { name: "Search commands" }).fill("stripe");
    // Titles and the writing, with marked words, together.
    await expect(page.getByRole("group", { name: "In the writing" }).locator("mark").first()).toBeVisible();
    await expect(page.getByRole("group", { name: "Case studies" })).toBeVisible();
    expect(await violationsOf(page)).toEqual([]);
  });

  test(`no axe violations: the footer's measurements, open (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.getByText("This page, measured").click();
    await expect(footer.getByText("How you got here")).toBeVisible();
    expect(await violationsOf(page)).toEqual([]);
  });

  for (const route of ROUTES) {
    test(`no axe violations: ${route} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      // The page itself, not the 404 page standing in for a route the build lost.
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
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
