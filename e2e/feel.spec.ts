import { expect, test } from "@playwright/test";
import { clipboardReader } from "./clipboard";

const CASE = "/work/four-rails-one-checkout/";

test.describe("identity & chrome", () => {
  test("serves the K monogram favicon and no default favicon", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="icon"][href*="icon.svg"]')).toHaveCount(1);
    const icon = await request.get("/icon.svg");
    expect(icon.status()).toBe(200);
    expect(await icon.text()).toContain("<svg");
    expect((await request.get("/favicon.ico")).status()).toBe(404);
  });

  test("theme-color follows an explicit theme choice", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Dark theme" });
    // aria-pressed only appears once hydrated, i.e. once the click handler exists.
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    // The theme applies inside a view transition's update callback, a frame later.
    const colors = () =>
      page
        .locator('meta[name="theme-color"]')
        .evaluateAll((ms) => [...new Set(ms.map((m) => m.getAttribute("content")))]);
    await expect.poll(colors).toEqual(["#120f0c"]);
  });

  test("nav marks the current section", async ({ page }) => {
    const current = () => page.getByRole("navigation", { name: "Primary" }).locator('[aria-current="page"]');
    for (const [path, label] of [
      ["/", "Work"],
      [CASE, "Work"],
      ["/notes/", "Notes"],
      ["/about/", "About"],
    ] as const) {
      await page.goto(path);
      await expect(current()).toHaveText(label);
      await expect(current()).toHaveCount(1);
    }
  });
});

test.describe("navigation & flow", () => {
  test("a case study opens at the top, even from a scrolled homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    const row = page.locator('a[href*="/work/charity-portal"]');
    await row.scrollIntoViewIfNeeded();
    await row.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/charity portal/i);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.getByRole("link", { name: "← All work" }).click();
    await expect(page).toHaveURL(/\/#work$/);
    expect(errors).toEqual([]);
  });

  test("reading progress fills as you scroll (or stays hidden where unsupported)", async ({ page }) => {
    await page.goto(CASE);
    const isSupported = await page.evaluate(() => CSS.supports("animation-timeline: scroll()"));
    if (!isSupported) {
      // Graceful fallback: no scroll timelines, no bar — never a frozen or full one.
      await expect(page.locator(".reading-progress")).toBeHidden();
      return;
    }
    const scale = () =>
      page.locator(".reading-progress").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    const before = await scale();
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight / 2));
    await expect.poll(scale).toBeGreaterThan(before + 0.2);
  });
});

test.describe("skimmability", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("every contents link points at a real heading", async ({ page }) => {
    await page.goto(CASE);
    const hrefs = await page
      .locator("aside [data-toc-id]")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(4);
    for (const href of hrefs) {
      expect(href).toMatch(/^#/);
      await expect(page.locator(href ?? "#missing")).toHaveCount(1);
    }
  });

  test("contents marks the section in view, including after a big jump up", async ({ page }) => {
    await page.goto(CASE);
    const active = page.locator('aside [aria-current="location"]');
    await page.locator('aside a[href="#quality"]').click();
    await expect(active).toHaveText("Quality");
    await page.evaluate(() => document.getElementById("the-problem")?.scrollIntoView({ behavior: "instant" }));
    await expect(active).toHaveText("The problem");
    await expect(active).toHaveCount(1);
  });

  test("a heading anchor copies a link to its section", async ({ page, context, browserName }) => {
    const readClipboard = await clipboardReader(page, context, browserName);
    await page.goto(CASE);
    await page.getByRole("link", { name: "Link to section: Tradeoffs" }).click();
    await expect(page).toHaveURL(/#tradeoffs$/);
    await expect.poll(readClipboard).toMatch(/\/work\/four-rails-one-checkout\/#tradeoffs$/);
  });

  test("headings read cleanly to screen readers (anchor sits beside, not inside)", async ({ page }) => {
    await page.goto(CASE);
    await expect(page.getByRole("heading", { level: 2, name: "Tradeoffs", exact: true })).toHaveCount(1);
  });
});

test.describe("personal touches", () => {
  test("copy email shows feedback and copies the address", async ({ page, context, browserName }) => {
    const readClipboard = await clipboardReader(page, context, browserName);
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("button", { name: "Copy email address" }).click();
    await expect(footer.getByRole("button", { name: "Email address copied" })).toHaveText("Copied");
    await expect.poll(readClipboard).toBe("kshitizsonakiya2001@gmail.com");
  });

  test.describe("from New York", () => {
    test.use({ timezoneId: "America/New_York" });
    test("local time shows IST and the gap to the visitor", async ({ page }) => {
      await page.goto("/");
      const footer = page.getByRole("contentinfo");
      await expect(footer).toContainText(/India · \d{1,2}:\d{2}\s(am|pm)/);
      await expect(footer).toContainText("UTC+5:30");
      await expect(footer).toContainText(/\d+h 30m ahead of you/);
    });
  });
});
