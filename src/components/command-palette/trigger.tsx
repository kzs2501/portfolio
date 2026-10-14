"use client";

import { useSyncExternalStore } from "react";
import { OPEN_EVENT, preloadPalette } from "./palette";

/** The platform never changes while the page is open: nothing to subscribe to. */
const subscribeToNothing = () => () => {
  // nothing to unsubscribe
};
/** Apple devices show ⌘; everyone else, Ctrl. (navigator.platform is deprecated; the user agent says the same.) */
const detectApplePlatform = () => /Mac|iPhone|iPad/.test(navigator.userAgent);

export function PaletteTrigger() {
  const isApplePlatform = useSyncExternalStore(subscribeToNothing, detectApplePlatform, () => true);
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      onPointerEnter={preloadPalette}
      onFocus={preloadPalette}
      aria-keyshortcuts={isApplePlatform ? "Meta+K" : "Control+K"}
      aria-label="Open command palette"
      className="num flex h-9 press items-center gap-1.5 rounded-md border border-rule px-2.5 text-xs text-ink-2 hover:bg-surface-2 hover:text-ink"
    >
      <kbd className="font-mono">{isApplePlatform ? "⌘" : "Ctrl"}</kbd>
      <kbd className="font-mono">K</kbd>
    </button>
  );
}
