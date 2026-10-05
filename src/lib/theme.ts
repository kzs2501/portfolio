import { flushSync } from "react-dom";

export type Theme = "light" | "dark";

/** The paper colour of each theme, for the browser chrome (theme-color). */
export const THEME_COLORS: Record<Theme, string> = { light: "#fcfaf6", dark: "#120f0c" };

export const readTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

export const subscribeTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
};

const storedTheme = (): Theme | null => {
  try {
    const t = localStorage.getItem("theme");
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
};

/**
 * Point every theme-color meta at one theme. Next renders two (one per OS scheme);
 * once the user picks a theme explicitly, both must follow that choice, or the
 * phone's status bar keeps showing the OS colour against the chosen page colour.
 */
export function syncThemeColor(theme: Theme) {
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute("content", THEME_COLORS[theme]));
}

/**
 * While the visitor hasn't picked a theme, follow the OS live — someone whose
 * laptop switches to dark at sunset shouldn't need to reload.
 */
export function followSystemTheme() {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = (e: MediaQueryListEvent) => {
    if (storedTheme()) return;
    document.documentElement.dataset.theme = e.matches ? "dark" : "light";
  };
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * Switch theme, growing the new one out of `origin` as a circle when the
 * browser supports view transitions and the user hasn't asked for less motion.
 */
export function setTheme(next: Theme, origin?: { x: number; y: number }) {
  const apply = () => {
    document.documentElement.dataset.theme = next;
    syncThemeColor(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode or blocked storage: the choice just won't persist.
    }
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduceMotion) {
    apply();
    return;
  }

  const x = origin?.x ?? innerWidth / 2;
  const y = origin?.y ?? innerHeight / 2;
  // Radius = distance to the farthest corner, so the circle always covers it.
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const style = document.documentElement.style;
  style.setProperty("--vt-x", `${x}px`);
  style.setProperty("--vt-y", `${y}px`);
  style.setProperty("--vt-r", `${r}px`);

  // Mark this as a theme transition so only it gets the circular reveal.
  const root = document.documentElement;
  root.classList.add("theme-transition");
  const transition = document.startViewTransition(() => flushSync(apply));
  transition.finished.finally(() => root.classList.remove("theme-transition"));
}

export const toggleTheme = (origin?: { x: number; y: number }) =>
  setTheme(readTheme() === "dark" ? "light" : "dark", origin);
