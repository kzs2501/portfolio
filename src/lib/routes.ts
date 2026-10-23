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

export const routes = {
  home: (): Route => "/",
  homeSection: (section: HomeSection) => `/#${section}` as Route,
  about: (): Route => "/about",
  notes: (): Route => "/notes",
  notesFeed: (): Route => "/notes/rss.xml",
  work: (slug: string) => `/work/${slug}` as Route,
  note: (slug: string) => `/notes/${slug}` as Route,
  project: (slug: string) => `/projects/${slug}` as Route,
};
