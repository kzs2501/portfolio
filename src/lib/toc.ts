import GithubSlugger from "github-slugger";

export type TocItem = { id: string; title: string };

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
  let inFence = false;

  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const text = plain(m[2]);
    const id = slugger.slug(text);
    if (m[1].length === 2) items.push({ id, title: smart(text) });
  }
  return items;
}
