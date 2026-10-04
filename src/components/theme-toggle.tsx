"use client";

import { useSyncExternalStore } from "react";
import { readTheme, subscribeTheme, toggleTheme } from "@/lib/theme";

export function ThemeToggle() {
  // The server knows nothing about the theme; the head script resolves it
  // before paint, and this reads it after hydration without a mismatch.
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => null);

  return (
    <button
      type="button"
      onClick={(e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        toggleTheme({ x: left + width / 2, y: top + height / 2 });
      }}
      aria-label="Dark theme"
      aria-pressed={theme === null ? undefined : theme === "dark"}
      className="grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {/* Both icons render; CSS shows the right one, so nothing flashes. */}
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] dark:hidden" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="hidden size-[18px] dark:block" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
