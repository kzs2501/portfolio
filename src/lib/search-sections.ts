import { readSource } from "./toc";

/**
 * The site's writing, cut into what the ⌘K palette searches: a page's introduction, then
 * each level-2 section, as plain text. Built at build time from the MDX source, with the
 * same heading ids the pages render, so a result can open the section it found.
 */

export interface Section {
  /** The heading's id on the page; null for the introduction, before the first heading. */
  id: string | null;
  title: string | null;
  text: string;
}

export type SearchKind = "Case study" | "Note" | "Project";

/** One entry of `/search-index.json`. */
export interface SearchEntry {
  /** Unique in the index: the page, and the section's id after a "#". */
  id: string;
  href: string;
  page: string;
  kind: SearchKind;
  /** Null for a page's introduction. */
  section: string | null;
  text: string;
}

/** The quotes and ellipses remark-smartypants renders, so excerpts read as the page does. */
const smartText = (text: string) =>
  text
    .replace(/(^|[\s([{])"/gu, "$1“")
    .replace(/"/gu, "”")
    .replace(/(\w)'(\w)/gu, "$1’$2")
    .replace(/(^|[\s([{])'/gu, "$1‘")
    .replace(/'/gu, "’")
    .replace(/\.\.\./gu, "…");

/**
 * What a reader sees of a run of MDX: links and emphasis as their words, inline code as
 * its text, of a component only its caption or title, and of an image its alt text.
 */
export function plainText(mdx: string): string {
  return smartText(
    mdx
      // Of a tag, keep what a reader sees: a component's caption or title, an image's alt.
      .replace(/<\/?[A-Za-z][^>]*>/gu, (tag) =>
        [...tag.matchAll(/\b(?:caption|title|alt)="([^"]*)"/gu)].map(([, value]) => ` ${value ?? ""} `).join(""),
      )
      .replace(/!\[([^\]]*)\]\([^)]*\)/gu, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
      .replace(/`([^`]+)`/gu, "$1")
      .replace(/\*\*([^*]+)\*\*/gu, "$1")
      .replace(/(^|\W)[*_]([^*_\n]+)[*_](?=\W|$)/gu, "$1$2")
      .replace(/^\s*(?:[-*+]|\d+\.)\s+/gmu, "")
      .replace(/^\s*>\s?/gmu, "")
      .replace(/\s+/gu, " ")
      .trim(),
  );
}

/** A page's introduction, then one section per level-2 heading; fenced code is left out. */
export function sectionsOf(source: string): Section[] {
  const sections: { id: string | null; title: string | null; lines: string[] }[] = [
    { id: null, title: null, lines: [] },
  ];
  for (const line of readSource(source)) {
    const current = sections.at(-1);
    if (!current) continue;
    if (line.kind === "heading" && line.level === 2) {
      sections.push({ id: line.id, title: line.title, lines: [] });
    } else if (line.kind === "heading") {
      current.lines.push(line.title);
    } else if (line.kind === "text") {
      current.lines.push(line.text);
    }
  }
  return sections
    .map(({ id, title, lines }) => ({ id, title, text: plainText(lines.join("\n")) }))
    .filter((section) => section.id !== null || section.text !== "");
}
