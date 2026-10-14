/**
 * Hex twins of the oklch colour tokens in `src/app/globals.css`, for the places CSS
 * can't reach: link-preview images, the theme-color meta, and the theme script that
 * runs before the stylesheet. Change a token there, change it here.
 */
export const PAPER = { light: "#fcfaf6", dark: "#120f0c" } as const;
export const INK = "#1f1915";
export const INK_SOFT = "#524c47";
export const INK_MUTED = "#68625e";
export const ACCENT = "#af2c1f";
export const RULE = "#d6d0c9";

/** Where the visitor's light/dark choice is remembered. */
export const THEME_STORAGE_KEY = "theme";
