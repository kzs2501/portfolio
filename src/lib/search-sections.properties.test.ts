/**
 * Properties of the writing cut into sections, over any MDX-ish source: what the November
 * bug hunt checked, kept. Nothing throws, and every section's id is one the page's
 * contents give, so a result always opens a heading that's there.
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { plainText, sectionsOf } from "./search-sections";
import { extractToc } from "./toc";

const LINES = [
  "## Title",
  "### Sub",
  "```ts",
  "```",
  "~~~",
  '<Figure caption="Cap">',
  "</Figure>",
  '<img alt="Alt" />',
  "[a](/b/)",
  "**bold**",
  "_it_",
  "> quote",
  "- item",
  "1. item",
  "`code`",
  "a < b > c",
  '<Demo title="T" />',
];
const source = fc
  .array(fc.oneof(fc.string({ maxLength: 40 }), fc.constantFrom(...LINES)), { maxLength: 30 })
  .map((lines) => lines.join("\n"));

describe("the writing as sections, from any source", () => {
  it("never throws, and gives each section the id its page's contents give", () => {
    fc.assert(
      fc.property(source, (mdx) => {
        plainText(mdx);
        const ids = sectionsOf(mdx).flatMap((section) => (section.id ? [section.id] : []));
        expect(ids).toEqual(extractToc(mdx).map((item) => item.id));
      }),
      { numRuns: 2_000 },
    );
  });

  it("keeps a comparison, a keyboard key and an arrow in prose", () => {
    expect(plainText("If a < b and c > d, then x.")).toBe("If a < b and c > d, then x.");
    expect(plainText("Press <kbd>Esc</kbd> to close.")).toBe("Press Esc to close.");
    expect(plainText("Open it → then close it.")).toBe("Open it → then close it.");
  });
});
