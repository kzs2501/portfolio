import { expect, test, type Locator, type Page } from "@playwright/test";
import { notes } from "../src/content/notes";
import { projects } from "../src/content/projects";
import { work } from "../src/content/work";
import { pagePath } from "../src/lib/routes";
import { ROUTES, waitForHydration } from "./site";

/** Press Step until the demo reaches its end (Step disables itself there). */
async function stepToEnd(demo: Locator) {
  const step = demo.getByRole("button", { name: "Step" });
  for (let i = 0; i < 50 && (await step.isEnabled()); i++) await step.click();
}

test("a case study ships no demo code until its demo is approached", async ({ page }) => {
  const scripts = new Set<string>();
  page.on("request", (r) => {
    if (r.resourceType() === "script") scripts.add(r.url());
  });
  await page.goto("/work/charity-portal/");
  const demo = page.locator('[aria-label="Interactive demo: Single-flight token refresh"]');
  // Loaded, but the demo isn't: it's far below the fold, still a placeholder.
  await page.waitForLoadState("load");
  await expect(demo).toContainText("Loading interactive demo");
  const before = new Set(scripts);

  await demo.scrollIntoViewIfNeeded();
  await expect(demo.getByRole("button", { name: "Play" })).toBeVisible();
  const fetched = [...scripts].filter((url) => !before.has(url));
  expect(fetched, "scrolling to the demo should fetch its chunk, and only then").not.toEqual([]);
});

test("⌘K palette: open, filter, navigate by keyboard", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  await page.keyboard.press("ControlOrMeta+k");
  const input = page.getByRole("combobox", { name: "Search commands" });
  await expect(input).toBeFocused();
  await input.fill("portal");
  await expect(page.getByRole("option").first()).toHaveText(/charity portal/i);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/charity-portal\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/charity portal/i);
});

/** Open the palette from the keyboard and type a search. */
async function searchFor(page: Page, query: string) {
  await waitForHydration(page);
  await page.keyboard.press("ControlOrMeta+k");
  await page.getByRole("combobox", { name: "Search commands" }).fill(query);
}

test("⌘K palette: finds the writing from part of a word and through a typo, and opens the section", async ({
  page,
}) => {
  await page.goto("/");
  await searchFor(page, "idemp");
  const writing = page.getByRole("group", { name: "In the writing" });
  const section = writing.getByRole("option", { name: /^The same idea on the way in: idempotency keys/u });
  await expect(section).toBeVisible();

  await page.getByRole("combobox", { name: "Search commands" }).fill("idempotncy");
  await expect(section).toHaveAttribute("aria-selected", "true");
  await expect(section.locator("mark").first()).toHaveText(/^idempotency$/iu);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/notes\/redirect-races-the-webhook\/#the-same-idea-on-the-way-in-idempotency-keys$/u);
  // Focus lands on the section, not the top of the page.
  const heading = page.getByRole("heading", { level: 2, name: "The same idea on the way in: idempotency keys" });
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport();
});

test("⌘K palette: opens a section of the page you're on", async ({ page }) => {
  await page.goto("/notes/debounce-is-not-a-race-guard/");
  await searchFor(page, "live setter");
  await expect(page.getByRole("group", { name: "In the writing" }).getByRole("option").first()).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#why-the-obvious-check-doesnt-work$/u);
  const heading = page.getByRole("heading", { level: 2, name: "Why the obvious check doesn’t work" });
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport();
});

test("⌘K palette: the index of the writing loads only once the palette is approached", async ({ page }) => {
  const fetched: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/search-index.json")) fetched.push(request.url());
  });
  await page.goto("/");
  await waitForHydration(page);
  expect(fetched).toEqual([]);
  const indexRequest = page.waitForRequest((request) => request.url().endsWith("/search-index.json"));
  await page.getByRole("button", { name: "Open command palette" }).hover();
  await indexRequest;
});

test("every result in the index of the writing opens a section that's there", async ({ request }) => {
  const entries = (await (await request.get("/search-index.json")).json()) as { href: string }[];
  // A page's introduction links to the page, its sections to their headings on it.
  const byPage = Map.groupBy(entries, ({ href }) => pagePath(href.split("#")[0] ?? ""));
  expect(byPage.size).toBe(work.length + projects.length + notes.length);
  for (const [path, onPage] of byPage) {
    const html = await (await request.get(path)).text();
    const ids = onPage.flatMap(({ href }) => href.split("#").slice(1));
    expect(
      ids.filter((id) => !html.includes(`id="${id}"`)),
      path,
    ).toEqual([]);
  }
});

test("⌘K palette: Escape closes it, and focus goes back to what opened it", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open command palette" });
  // From the keyboard, where focus returning matters. (Safari doesn't focus a button on
  // a mouse click, so there'd be nothing to return to.)
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Search commands" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("theme toggle switches and persists across reloads", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Dark theme" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("stage registry: switching rail rebuilds the flow and keeps your place", async ({ page }) => {
  await page.goto("/work/four-rails-one-checkout");
  const demo = page.locator('[aria-label="Interactive demo: Stage registry"]');
  await demo.scrollIntoViewIfNeeded();
  await demo.getByRole("button", { name: "Continue →" }).click();
  await demo.getByRole("button", { name: "Continue →" }).click(); // now on "Card or wallet"
  await demo.getByRole("radio", { name: "Stock" }).click();
  await expect(demo.getByRole("list", { name: "Checkout stages" })).toContainText("Letter of authorization");
  await expect(demo.getByRole("list", { name: "Checkout stages" })).not.toContainText("Card or wallet");
  await expect(demo.locator('[aria-current="step"]')).toContainText("Brokerage");
});

test("single-flight demo: one refresh call, all five succeed", async ({ page }) => {
  await page.goto("/work/charity-portal");
  const demo = page.locator('[aria-label="Interactive demo: Single-flight token refresh"]');
  await demo.scrollIntoViewIfNeeded();
  await stepToEnd(demo);
  await expect(demo).toContainText("5 / 5");
  await expect(demo).toContainText("All good");
  await demo.getByRole("radio", { name: "Naive" }).click();
  await stepToEnd(demo);
  await expect(demo).toContainText("Logged out");
});

test("race demo: no guard shows stale results, guard fixes it", async ({ page }) => {
  await page.goto("/notes/debounce-is-not-a-race-guard");
  const demo = page.locator('[aria-label="Interactive demo: Debounce vs. the race"]');
  await demo.scrollIntoViewIfNeeded();
  await stepToEnd(demo);
  await expect(demo.getByRole("alert")).toContainText("Stale");
  await demo.getByRole("radio", { name: "With guard" }).click();
  await stepToEnd(demo);
  await expect(demo.getByRole("alert")).toHaveCount(0);
  await expect(demo).toContainText("BTC-INR");
});

test("brand demo: modules follow the brand config", async ({ page }) => {
  await page.goto("/work/multi-brand-checkout");
  const demo = page.locator('[aria-label="Interactive demo: One checkout, many brands"]');
  await demo.scrollIntoViewIfNeeded();
  await expect(demo).toContainText("Trade-in credit");
  await demo.getByRole("radio", { name: "Halden" }).click();
  await expect(demo).not.toContainText("Trade-in credit");
  await expect(demo).toContainText("Continue to payment");
});

test("reduced motion: demos still fully usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work/charity-portal");
  const demo = page.locator('[aria-label="Interactive demo: Single-flight token refresh"]');
  await demo.scrollIntoViewIfNeeded();
  await stepToEnd(demo);
  await expect(demo).toContainText("5 / 5");
});

test("every page's link-preview card is a PNG at its own address, with no redirect", async ({ page, request }) => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  for (const route of ROUTES) {
    await page.goto(route);
    for (const tag of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
      // The tags carry the live site's address; fetch the same path from this server.
      const { pathname } = new URL((await page.locator(tag).getAttribute("content")) ?? "");
      const response = await request.get(pathname, { maxRedirects: 0 });
      expect(response.status(), `${route} ${tag}`).toBe(200);
      expect(response.headers()["content-type"], `${route} ${tag}`).toBe("image/png");
      expect((await response.body()).subarray(0, 8).equals(png), `${route} ${tag}`).toBe(true);
    }
  }
});
