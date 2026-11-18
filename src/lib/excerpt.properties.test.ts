/**
 * Properties of an excerpt over any text and terms: what the November bug hunt checked,
 * kept. It never throws, shows a window of the text in order, no longer than asked, and
 * marks only whole words equal to a term.
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { excerptOf } from "./excerpt";

const PIECES = [
  "key",
  "Key",
  "KEY",
  "keys",
  "a.b",
  "(x)",
  "[y]",
  "$",
  "^",
  "*",
  "+",
  "?",
  "\\",
  "é",
  "naïve",
  "日本",
  "🙂",
  " ",
  "-",
  "'",
  "’",
];
const text = fc.oneof(
  fc.string({ maxLength: 300 }),
  fc.string({ maxLength: 300, unit: "grapheme" }),
  fc.array(fc.constantFrom(...PIECES), { maxLength: 40 }).map((parts) => parts.join(" ")),
);
const terms = fc.array(
  fc.oneof(fc.string({ maxLength: 8 }), fc.constantFrom("key", "a.b", "(x)", "[y]", "*", "\\", "é", "🙂", "")),
  { maxLength: 4 },
);

describe("an excerpt of any text", () => {
  it("is a window of the text, no longer than asked, marking only whole words a term names", () => {
    fc.assert(
      fc.property(text, terms, fc.integer({ min: 1, max: 400 }), (source, words, length) => {
        const segments = excerptOf(source, words, length);
        const inner = segments
          .map((segment) => segment.text)
          .join("")
          .replace(/^…/u, "")
          .replace(/…$/u, "");
        expect(source.includes(inner)).toBe(true);
        expect(inner.length).toBeLessThanOrEqual(length + 1);
        for (const segment of segments.filter((piece) => piece.isMatch)) {
          expect(words.some((word) => word !== "" && word.toLowerCase() === segment.text.toLowerCase())).toBe(true);
        }
      }),
      { numRuns: 2_000 },
    );
  });

  it("marks a term with pattern characters or accents when it's a whole word", () => {
    const marked = (source: string, word: string) =>
      excerptOf(source, [word])
        .filter((segment) => segment.isMatch)
        .map((segment) => segment.text);
    expect(marked("Use a.b here", "a.b")).toEqual(["a.b"]);
    expect(marked("A naïve cache", "naïve")).toEqual(["naïve"]);
    expect(marked("Ünïcode wins", "ünïcode")).toEqual(["Ünïcode"]);
  });
});
