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

/**
 * Build the table of contents from MDX source at build time. Uses the same slugger
 * as rehype-slug, fed with every heading level in document order, so duplicate
 * titles get the same "-1" suffixes and the ids always match the rendered page.
 * Only level-2 headings are listed; fenced code is skipped.
 */
export function extractToc(source: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let isInFence = false;

  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      isInFence = !isInFence;
      continue;
    }
    if (isInFence) continue;
    const [, hashes, rawTitle] = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line) ?? [];
    if (!hashes || !rawTitle) continue;
    const text = plain(rawTitle);
    const id = slugger.slug(text); // every heading takes a slug, so later ids match the page
    if (hashes.length === 2) items.push({ id, title: smart(text) });
  }
  return items;
}
