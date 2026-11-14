/**
 * The few lines of a section a search result shows: a window of its text around the
 * first word the search matched, cut at word boundaries, with every matched word marked.
 */

export interface Segment {
  text: string;
  isMatch: boolean;
}

const escape = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

/** Whole words equal to any of the terms, whatever their case. */
function wordsOf(terms: readonly string[]) {
  const alternatives = terms.filter((term) => term.trim() !== "").map(escape);
  if (alternatives.length === 0) return null;
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives.join("|")})(?![\\p{L}\\p{N}])`, "giu");
}

/** How much of the text before the first match the window shows, for context. */
const LEAD = 40;

export function excerptOf(text: string, terms: readonly string[], length = 160): Segment[] {
  const words = wordsOf(terms);
  const matches = words ? [...text.matchAll(words)] : [];
  const first = matches[0]?.index ?? 0;

  let start = Math.max(0, first - LEAD);
  // Start at a word, not inside one.
  if (start > 0) start = text.indexOf(" ", start) + 1 || start;
  if (start > first) start = first;
  let end = Math.min(text.length, start + length);
  if (end < text.length) {
    const lastSpace = text.lastIndexOf(" ", end);
    if (lastSpace > first) end = lastSpace;
  }

  const segments: Segment[] = [];
  let at = start;
  for (const match of matches) {
    const from = match.index;
    const to = from + match[0].length;
    if (from < start || to > end) continue;
    if (from > at) segments.push({ text: text.slice(at, from), isMatch: false });
    segments.push({ text: text.slice(from, to), isMatch: true });
    at = to;
  }
  if (at < end) segments.push({ text: text.slice(at, end), isMatch: false });

  if (start > 0) segments.unshift({ text: "…", isMatch: false });
  if (end < text.length) segments.push({ text: "…", isMatch: false });
  return segments;
}
