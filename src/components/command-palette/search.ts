import type { Route } from "next";
import MiniSearch from "minisearch";
import { excerptOf, type Segment } from "@/lib/excerpt";
import type { SearchEntry, SearchKind } from "@/lib/search-sections";

/**
 * Search the writing from the ⌘K palette (`/search-index.json`, built with the site).
 * MiniSearch ranks by relevance, finds words from their start ("idemp") and through a
 * typo ("idempotncy"), and says which words matched, for the excerpt to mark. It lives
 * in the palette's own chunk, so a visitor who never opens the palette never loads it.
 */

export type WritingIndex = MiniSearch<SearchEntry>;

export interface WritingHit {
  id: string;
  href: Route;
  page: string;
  kind: SearchKind;
  section: string | null;
  excerpt: Segment[];
}

/** Shorter queries match too much of everything to be worth showing. */
export const MIN_QUERY_LENGTH = 2;
export const MAX_HITS = 5;

export function buildIndex(entries: readonly SearchEntry[]): WritingIndex {
  const index = new MiniSearch<SearchEntry>({
    fields: ["section", "page", "text"],
    storeFields: ["href", "page", "kind", "section", "text"],
    searchOptions: {
      // A word in a section's title says more than one in its text.
      boost: { section: 3, page: 2 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: "AND",
    },
  });
  index.addAll(entries);
  return index;
}

const isEntry = (value: unknown): value is SearchEntry =>
  typeof value === "object" &&
  value !== null &&
  typeof Reflect.get(value, "id") === "string" &&
  typeof Reflect.get(value, "href") === "string" &&
  typeof Reflect.get(value, "text") === "string";

let loading: Promise<WritingIndex> | null = null;

/** The index, fetched and built once; a failure can be tried again on the next open. */
export function loadSearch(): Promise<WritingIndex> {
  loading ??= fetch("/search-index.json")
    .then(async (response) => {
      if (!response.ok) throw new Error(`The search index answered ${String(response.status)}`);
      const entries: unknown = await response.json();
      if (!Array.isArray(entries) || !entries.every(isEntry))
        throw new Error("The search index isn’t a list of entries");
      return buildIndex(entries);
    })
    .catch((error: unknown) => {
      loading = null;
      throw error;
    });
  return loading;
}

export function searchWriting(index: WritingIndex, query: string): WritingHit[] {
  if (query.trim().length < MIN_QUERY_LENGTH) return [];
  return index
    .search(query)
    .slice(0, MAX_HITS)
    .map((result) => {
      // Stored fields come back untyped; they're the entry's own.
      const entry = result as unknown as SearchEntry;
      return {
        id: entry.id,
        // Built by `routes.section` with the site.
        href: entry.href as Route,
        page: entry.page,
        kind: entry.kind,
        section: entry.section,
        excerpt: excerptOf(entry.text, result.terms),
      };
    });
}
