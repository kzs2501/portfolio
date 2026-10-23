import { expect, type Page } from "@playwright/test";
import { notes } from "../src/content/notes";
import { projects } from "../src/content/projects";
import { work } from "../src/content/work";
import { routes } from "../src/lib/routes";

/**
 * Every page the site has, from the content itself: a new note or case study is
 * checked the day it's added, without anyone remembering to list it here.
 */
export const ROUTES = [
  routes.home(),
  routes.about(),
  routes.notes(),
  ...work.map((entry) => routes.work(entry.slug)),
  ...notes.map((entry) => routes.note(entry.slug)),
  ...projects.map((entry) => routes.project(entry.slug)),
];

/** An address with no page, for the site's 404. */
export const NOT_FOUND = "/no-such-page/";

/**
 * Bring each interactive demo on the page into view, and wait until it has loaded. A
 * demo that failed to load fails here: otherwise its error message would be all that
 * got scanned, and pass.
 */
export async function loadDemos(page: Page) {
  for (const demo of await page.locator('[aria-label^="Interactive demo"]').all()) {
    await demo.scrollIntoViewIfNeeded();
    await expect(demo.getByText("Loading interactive demo")).toHaveCount(0);
    await expect(demo.getByText("This demo couldn’t load")).toHaveCount(0);
  }
}
