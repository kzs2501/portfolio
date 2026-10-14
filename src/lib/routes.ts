/**
 * Every page's URL, in one place. With `typedRoutes` on, Next checks literal hrefs at
 * build time; dynamic ones are built here, so their casts live in exactly one file.
 */
import type { Route } from "next";

export type HomeSection = "work" | "projects" | "notes";

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
