import { expect, type Page } from "@playwright/test";

/** Every kind of page the site has, for checks that should hold on all of them. */
export const ROUTES = [
  "/",
  "/about",
  "/notes",
  "/work/four-rails-one-checkout",
  "/work/charity-portal",
  "/work/multi-brand-checkout",
  "/notes/debounce-is-not-a-race-guard",
  "/notes/load-sdks-on-mount",
  "/notes/async-intersection-observer-mock",
  "/notes/redirect-races-the-webhook",
  "/notes/a-seat-map-a-screen-reader-can-use",
  "/projects/admit-one",
];

/** Bring each interactive demo on the page into view, and wait until it has loaded. */
export async function loadDemos(page: Page) {
  for (const demo of await page.locator('[aria-label^="Interactive demo"]').all()) {
    await demo.scrollIntoViewIfNeeded();
    await expect(demo.getByText("Loading interactive demo")).toHaveCount(0);
  }
}
