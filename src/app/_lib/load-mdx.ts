import type { MDXContent, MDXModule } from "mdx/types";

export type ContentCollection = "work" | "notes" | "projects";

/**
 * The compiled MDX body of a content entry. Dynamic imports built from a template are
 * untyped, so this is the one place that states what they return.
 */
export async function loadMdxBody(collection: ContentCollection, slug: string): Promise<MDXContent> {
  const loaded: unknown =
    collection === "work"
      ? await import(`@/content/work/${slug}.mdx`)
      : collection === "notes"
        ? await import(`@/content/notes/${slug}.mdx`)
        : await import(`@/content/projects/${slug}.mdx`);
  return (loaded as MDXModule).default;
}
