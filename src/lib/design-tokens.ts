/**
 * Hex twins of the oklch colour tokens in `src/app/globals.css`, for the places CSS
 * can't reach: link-preview images, the theme-color meta, and the theme script that
 * runs before the stylesheet. Change a token there, change it here: `src/app/tokens.test.ts`
 * fails until they match.
 */
export const PAPER = { light: "#fafbfd", dark: "#0d0f14" } as const;
export const INK = "#1a1d23";
export const INK_SOFT = "#4c5057";
export const INK_MUTED = "#66696f";
export const ACCENT = "#2347c5";
export const RULE = "#d4d8dd";

/** Where the visitor's light/dark choice is remembered. */
export const THEME_STORAGE_KEY = "theme";
