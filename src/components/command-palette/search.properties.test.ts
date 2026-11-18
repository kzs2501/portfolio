/**
 * Properties of searching the writing, over any query: what the November bug hunt
 * checked, kept. It never throws and never shows more than five.
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { buildIndex, MAX_HITS, searchWriting } from "./search";

const ENTRIES = Array.from({ length: 30 }, (_, index) => ({
  id: `p/${String(index)}`,
  href: `/notes/n${String(index)}/`,
  page: `Page ${String(index)}`,
  kind: "Note" as const,
  section: index % 3 === 0 ? null : `Section ${String(index)} key idempotency`,
  text: `Text ${String(index)} about keys, idempotency, webhooks and the redirect race. ${"filler ".repeat(index)}`,
}));

describe("searching the writing, for any query", () => {
  it("never throws, and shows at most five", () => {
    const index = buildIndex(ENTRIES);
    fc.assert(
      fc.property(fc.oneof(fc.string({ maxLength: 40 }), fc.string({ maxLength: 40, unit: "grapheme" })), (query) => {
        expect(searchWriting(index, query).length).toBeLessThanOrEqual(MAX_HITS);
      }),
      { numRuns: 2_000 },
    );
  });
});
