import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Route } from "next";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";
import { work } from "@/content/work";
import { routes } from "@/lib/routes";
import { sectionsOf, type SearchEntry, type SearchKind } from "@/lib/search-sections";
import type { ContentCollection } from "./load-mdx";

interface Page {
  collection: ContentCollection;
  slug: string;
  title: string;
  summary: string;
  kind: SearchKind;
  href: Route;
}

const PAGES: Page[] = [
  ...work.map((entry) => ({
    ...entry,
    collection: "work" as const,
    kind: "Case study" as const,
    href: routes.work(entry.slug),
  })),
  ...projects.map((entry) => ({
    ...entry,
    collection: "projects" as const,
    kind: "Project" as const,
    href: routes.project(entry.slug),
  })),
  ...notes.map((entry) => ({
    ...entry,
    collection: "notes" as const,
    kind: "Note" as const,
    href: routes.note(entry.slug),
  })),
];

/**
 * Every case study, project and note, section by section, for the ⌘K palette's search.
 * Read from the MDX at build time; a page's introduction opens with its summary, which
 * the page shows above it.
 */
export function searchIndex(): SearchEntry[] {
  return PAGES.flatMap(({ collection, slug, title, summary, kind, href }) => {
    const sections = sectionsOf(readFileSync(join(process.cwd(), "src/content", collection, `${slug}.mdx`), "utf8"));
    const introduction = sections.find((section) => section.id === null)?.text ?? "";
    return [
      {
        id: `${collection}/${slug}`,
        href,
        page: title,
        kind,
        section: null,
        text: `${summary} ${introduction}`.trim(),
      },
      ...sections.flatMap(({ id, title: section, text }) =>
        id
          ? [{ id: `${collection}/${slug}#${id}`, href: routes.section(href, id), page: title, kind, section, text }]
          : [],
      ),
    ];
  });
}
