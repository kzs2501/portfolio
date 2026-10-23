import type { Metadata } from "next";
import { pagePath, routes } from "@/lib/routes";

/** `generateStaticParams` for a content collection: one page per slug. */
export const toSlugParams = (entries: readonly { slug: string }[]) => entries.map(({ slug }) => ({ slug }));

/**
 * A page's alternates: its canonical URL, and the notes feed. Next merges metadata one
 * key deep, so a page that sets `alternates` replaces the layout's; the feed comes too.
 */
export const alternatesFor = (path: string): Metadata["alternates"] => ({
  canonical: pagePath(path),
  types: { "application/rss+xml": routes.notesFeed() },
});

/** Title, description, canonical URL and Open Graph for an article page. */
export function articleMetadata(
  meta: { title: string; summary: string } | undefined,
  path: string,
  openGraph: { publishedTime?: string } = {},
): Metadata {
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.summary,
    alternates: alternatesFor(path),
    openGraph: { title: meta.title, description: meta.summary, type: "article", url: pagePath(path), ...openGraph },
  };
}
