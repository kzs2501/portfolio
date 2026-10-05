"use client";

import { useSyncExternalStore } from "react";
import { OPEN_EVENT, preloadPalette } from "./palette";

const noop = () => () => {};
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);

export function PaletteTrigger() {
  const mac = useSyncExternalStore(noop, isMac, () => true);
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      onPointerEnter={preloadPalette}
      onFocus={preloadPalette}
      aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
      aria-label="Open command palette"
      className="num press flex h-9 items-center gap-1.5 rounded-md border border-rule px-2.5 text-xs text-ink-2 hover:bg-surface-2 hover:text-ink"
    >
      <kbd className="font-mono">{mac ? "⌘" : "Ctrl"}</kbd>
      <kbd className="font-mono">K</kbd>
    </button>
  );
}
