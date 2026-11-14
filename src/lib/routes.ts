/**
 * Every page's URL, in one place. With `typedRoutes` on, Next checks literal hrefs at
 * build time; dynamic ones are built here, so their casts live in exactly one file.
 */
import type { Route } from "next";

export type HomeSection = "work" | "projects" | "notes";

/**
 * A page's path as the site serves it. `trailingSlash` is on (each page is a folder's
 * index.html), so `/about` answers with a redirect to `/about/`: links for crawlers and
 * feed readers — the sitemap, the feed, canonical URLs — use the address itself.
 */
export const pagePath = (path: string) => (path.endsWith("/") ? path : `${path}/`);

/**
 * A link to one of this site's pages, rather than to another site, to a file it publishes
 * (the résumé, the feed) or to a place on the page it's on.
 */
export function isSitePage(href: string) {
  const path = href.split("#")[0] ?? "";
  return path.startsWith("/") && !path.startsWith("//") && !/\.\w+$/u.test(path);
}

export const routes = {
  home: (): Route => "/",
  homeSection: (section: HomeSection) => `/#${section}` as Route,
  about: (): Route => "/about",
  notes: (): Route => "/notes",
  notesFeed: (): Route => "/notes/rss.xml",
  work: (slug: string) => `/work/${slug}` as Route,
  note: (slug: string) => `/notes/${slug}` as Route,
  project: (slug: string) => `/projects/${slug}` as Route,
  /** A link to one of the site's pages written in the content; `content-links.test.ts` checks each is real. */
  inContent: (href: string) => href as Route,
  /** A section of a page, by its heading's id. */
  section: (page: Route, id: string) => `${pagePath(page)}#${id}` as Route,
};
