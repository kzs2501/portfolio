import { flushSync } from "react-dom";

export type Theme = "light" | "dark";

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

/**
 * Switch theme, growing the new one out of `origin` as a circle when the
 * browser supports view transitions and the user hasn't asked for less motion.
 */
export function setTheme(next: Theme, origin?: { x: number; y: number }) {
  const apply = () => {
    document.documentElement.dataset.theme = next;
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

  document.startViewTransition(() => flushSync(apply));
}

export const toggleTheme = (origin?: { x: number; y: number }) =>
  setTheme(readTheme() === "dark" ? "light" : "dark", origin);
