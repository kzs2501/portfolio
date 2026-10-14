import type { Metadata } from "next";

/** `generateStaticParams` for a content collection: one page per slug. */
export const toSlugParams = (entries: readonly { slug: string }[]) => entries.map(({ slug }) => ({ slug }));

/** Title, description and Open Graph for an article page. */
export function articleMetadata(
  meta: { title: string; summary: string } | undefined,
  openGraph: { publishedTime?: string } = {},
): Metadata {
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.summary,
    openGraph: { title: meta.title, description: meta.summary, type: "article", ...openGraph },
  };
}
