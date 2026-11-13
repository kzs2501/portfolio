import { expect, test, type Page } from "@playwright/test";
import { PAPER } from "../src/lib/design-tokens";
import { clipboardReader } from "./clipboard";

const CASE = "/work/four-rails-one-checkout/";

const hasScrollTimelines = (page: Page) => page.evaluate(() => CSS.supports("animation-timeline: scroll()"));

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
        .evaluateAll((metas) => [...new Set(metas.map((meta) => meta.getAttribute("content")))]);
    await expect.poll(colors).toEqual([PAPER.dark]);
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

  test("reading progress fills as you scroll, where scroll timelines exist", async ({ page }) => {
    await page.goto(CASE);
    test.skip(!(await hasScrollTimelines(page)), "this browser has no scroll timelines");
    const scale = () =>
      page.locator(".reading-progress").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    const before = await scale();
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight / 2));
    await expect.poll(scale).toBeGreaterThan(before + 0.2);
  });

  test("reading progress stays hidden where scroll timelines don't exist", async ({ page }) => {
    await page.goto(CASE);
    test.skip(await hasScrollTimelines(page), "this browser has scroll timelines");
    // Graceful fallback: no scroll timelines, no bar — never a frozen or full one.
    await expect(page.locator(".reading-progress")).toBeHidden();
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

test.describe("this page, measured", () => {
  const footer = (page: Page) => page.getByRole("contentinfo");
  /** Opening it is the page's first input, which the browser times whenever the panel started watching. */
  const open = async (page: Page) => {
    await footer(page).getByText("This page, measured").click();
    await expect(footer(page).getByText("How you got here")).toBeVisible();
  };
  /** What a row of the panel says, by its term. */
  const said = (page: Page, term: string) => footer(page).locator("dt", { hasText: term }).locator("+ dd");
  const RATED = /^((under )?\d+ ms|\d+\.\d\d s|\d\.\d\d) (Good|Needs work|Poor)$/u;
  // Only Chromium-based browsers report layout shifts and time soft navigations.
  const LAYOUT_SHIFT = {
    chromium: RATED,
    firefox: "Your browser doesn’t report layout shifts; Chromium-based browsers do.",
    webkit: "Your browser doesn’t report layout shifts; Chromium-based browsers do.",
  };
  const OPENED_IN_THE_APP = {
    chromium: /^Opened in the app, without a full load: the new content painted \d+ ms after your click\.$/u,
    firefox: "Opened in the app, without a full load. Your browser doesn’t time these; Chrome does.",
    webkit: "Opened in the app, without a full load. Your browser doesn’t time these; Chrome does.",
  };

  test("measures a full load in the visitor's own browser, and sends nothing", async ({
    page,
    browserName,
    baseURL,
  }) => {
    // Next's own prefetches read pages (GET, HEAD); anything else, or to anywhere else, would be sending.
    const sent: string[] = [];
    page.on("request", (request) => {
      const isReading = ["GET", "HEAD"].includes(request.method());
      if (!isReading || !request.url().startsWith(`${baseURL ?? ""}/`)) {
        sent.push(`${request.method()} ${request.url()}`);
      }
    });
    await page.goto("/");
    await open(page);
    await expect(said(page, "How you got here")).toHaveText("A full load.");
    await expect(footer(page).getByText("This page’s load")).toBeVisible();
    await expect(said(page, "Largest paint (LCP)")).toHaveText(RATED);
    await expect(said(page, "First byte (TTFB)")).toHaveText(RATED);
    await expect(said(page, "Layout shift (CLS)")).toHaveText(LAYOUT_SHIFT[browserName]);
    await expect(said(page, "Slowest response (INP)")).toHaveText(RATED);
    await expect(said(page, "Downloaded")).toHaveText(/^\d+ (B|KB|MB) in \d+ requests, \d+ (B|KB|MB) of it script/u);
    expect(sent).toEqual([]);
  });

  test("fills in when opened before the page was interactive", async ({ page }) => {
    // Hold the scripts back, so the click lands before React has hydrated the page, as on a slow phone.
    const { promise: held, resolve: release } = Promise.withResolvers<undefined>();
    await page.route("**/_next/static/chunks/*.js", async (route) => {
      await held;
      await route.continue();
    });
    await page.goto("/", { waitUntil: "commit" });
    await footer(page).getByText("This page, measured").click();
    await expect(footer(page).locator("details")).toHaveAttribute("open", "");
    release(undefined);
    await expect(said(page, "How you got here")).toHaveText("A full load.");
  });

  test("says a reload was one", async ({ page }) => {
    await page.goto("/about/");
    await page.reload();
    await open(page);
    await expect(said(page, "How you got here")).toHaveText("Reloaded.");
  });

  test("times a page opened from a link inside the site, where the browser can", async ({ page, browserName }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about\/$/u);
    await open(page);
    await expect(said(page, "How you got here")).toHaveText(OPENED_IN_THE_APP[browserName]);
    // The load times are the first page's, and say so.
    await expect(footer(page).getByText("The page you loaded first (/)")).toBeVisible();
  });
});
