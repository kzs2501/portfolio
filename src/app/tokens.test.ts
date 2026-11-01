/**
 * The colour tokens, measured from globals.css itself:
 * - every colour that's read against another, in both themes, by WCAG 2.2's ratio (what
 *   an audit checks) and APCA's Lc (stricter in the dark);
 * - every colour inside sRGB, so each browser shows it as written;
 * - the dark theme written the same way twice (an explicit choice, and the OS's);
 * - the hex twins in `design-tokens.ts` and the colours in `icon.svg` the same as the tokens.
 * A token change that breaks any of these fails here, before any screenshot does.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { apcaContrast, isInSrgbGamut, oklchToSrgb, toHex, wcagRatio, type Oklch } from "@/lib/contrast";
import { ACCENT, INK, INK_MUTED, INK_SOFT, PAPER, RULE } from "@/lib/design-tokens";

const css = readFileSync("src/app/globals.css", "utf8");
const icon = readFileSync("src/app/icon.svg", "utf8");

function tokensIn(from: string, to: string): Map<string, Oklch> {
  const block = css.slice(css.indexOf(from), css.indexOf(to));
  const tokens = new Map<string, Oklch>();
  for (const [, name = "", l = "", c = "", h = ""] of block.matchAll(
    /--([\w-]+): oklch\(([\d.]+) ([\d.]+) ([\d.]+)\);/g,
  )) {
    tokens.set(name, [Number(l), Number(c), Number(h)]);
  }
  return tokens;
}

const light = tokensIn(":root {", ':root[data-theme="dark"]');
const dark = tokensIn(':root[data-theme="dark"]', "@media (prefers-color-scheme: dark)");
const darkByDefault = tokensIn("@media (prefers-color-scheme: dark)", "@theme inline");

const hexOf = (tokens: Map<string, Oklch>, name: string) => toHex(oklchToSrgb(tokens.get(name) ?? [0, 0, 0]));

/** How strict a pair is, by what the foreground is. */
const NEEDS = {
  /** Running text: paragraphs, summaries, code. */
  body: { wcag: 4.5, apca: 75 },
  /** Small secondary text (dates, labels), links, status words, and text on a filled button. */
  text: { wcag: 4.5, apca: 60 },
} as const;

const PAIRS: [foreground: string, background: string, need: keyof typeof NEEDS][] = [
  ["ink", "paper", "body"],
  ["ink", "surface", "body"],
  ["ink", "surface-2", "body"],
  ["ink", "accent-soft", "body"],
  ["ink-2", "paper", "body"],
  ["ink-2", "surface", "body"],
  ["ink-3", "paper", "text"],
  ["ink-3", "surface", "text"],
  ["accent", "paper", "text"],
  ["accent", "surface", "text"],
  ["paper", "accent", "text"],
  ["ok", "paper", "text"],
  ["ok", "surface", "text"],
  ["warn", "paper", "text"],
  ["warn", "surface", "text"],
];

describe.each([
  ["light", light],
  ["dark", dark],
] as const)("the %s theme", (_, tokens) => {
  it("defines every token it's checked for", () => {
    const missing = PAIRS.flatMap(([foreground, background]) => [foreground, background]).filter(
      (name) => !tokens.has(name),
    );
    expect(missing).toEqual([]);
  });

  it.each(PAIRS)("%s on %s is readable as %s", (foreground, background, need) => {
    const text = oklchToSrgb(tokens.get(foreground) ?? [0, 0, 0]);
    const ground = oklchToSrgb(tokens.get(background) ?? [0, 0, 0]);
    expect(wcagRatio(text, ground)).toBeGreaterThanOrEqual(NEEDS[need].wcag);
    expect(apcaContrast(text, ground)).toBeGreaterThanOrEqual(NEEDS[need].apca);
  });

  it("keeps every colour inside sRGB", () => {
    const outside = [...tokens].filter(([, color]) => !isInSrgbGamut(color)).map(([name]) => name);
    expect(outside).toEqual([]);
  });
});

describe("copies of the tokens", () => {
  it("writes the dark theme the same for an explicit choice and the OS's", () => {
    expect(darkByDefault.size).toBeGreaterThan(0);
    expect(darkByDefault).toEqual(dark);
  });

  it("has hex twins that match", () => {
    expect({ PAPER, INK, INK_SOFT, INK_MUTED, ACCENT, RULE }).toEqual({
      PAPER: { light: hexOf(light, "paper"), dark: hexOf(dark, "paper") },
      INK: hexOf(light, "ink"),
      INK_SOFT: hexOf(light, "ink-2"),
      INK_MUTED: hexOf(light, "ink-3"),
      ACCENT: hexOf(light, "accent"),
      RULE: hexOf(light, "rule"),
    });
  });

  it("draws the icon in the accent and paper, in both themes", () => {
    const colours = [...icon.matchAll(/#[0-9a-f]{6}/gi)].map(([hex]) => hex.toLowerCase());
    expect(colours).toEqual([
      hexOf(light, "accent"),
      hexOf(light, "paper"),
      hexOf(dark, "accent"),
      hexOf(dark, "paper"),
    ]);
  });
});
