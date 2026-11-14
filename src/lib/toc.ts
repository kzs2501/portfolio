import GithubSlugger from "github-slugger";

export interface TocItem {
  id: string;
  title: string;
}

/** Strip inline markdown from a heading so the slug matches the rendered text. */
const plain = (md: string) =>
  md
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[*_]([^*_]+)[*_]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();

/** The curly quotes remark-smartypants will render, for display in the contents. */
const smart = (s: string) => s.replace(/(\w)'(\w)/g, "$1’$2").replace(/'/g, "’");

/** A line of MDX source, read as the page will render it. */
export type SourceLine =
  | { kind: "heading"; level: number; id: string; title: string }
  | { kind: "fence" }
  | { kind: "code"; text: string }
  | { kind: "text"; text: string };

/**
 * Every line of MDX source, with each heading's id. Uses the same slugger as
 * rehype-slug, fed with every heading level in document order, so duplicate titles
 * get the same "-1" suffixes and the ids always match the rendered page. Lines inside
 * fenced code are code, never headings. Shared by the contents and the site's search.
 */
export function readSource(source: string): SourceLine[] {
  const slugger = new GithubSlugger();
  let isInFence = false;
  return source.split("\n").map((line): SourceLine => {
    if (/^\s*(```|~~~)/.test(line)) {
      isInFence = !isInFence;
      return { kind: "fence" };
    }
    if (isInFence) return { kind: "code", text: line };
    const [, hashes, rawTitle] = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line) ?? [];
    if (!hashes || !rawTitle) return { kind: "text", text: line };
    const text = plain(rawTitle);
    // Every heading takes a slug, so later ids match the page.
    return { kind: "heading", level: hashes.length, id: slugger.slug(text), title: smart(text) };
  });
}

/** The table of contents, built from MDX source at build time: the level-2 headings. */
export function extractToc(source: string): TocItem[] {
  return readSource(source).flatMap((line) =>
    line.kind === "heading" && line.level === 2 ? [{ id: line.id, title: line.title }] : [],
  );
}
