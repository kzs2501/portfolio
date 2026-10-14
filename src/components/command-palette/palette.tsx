"use client";

import { lazy, Suspense, useEffect, useState } from "react";

export const OPEN_EVENT = "palette:open";

// The dialog's code downloads on first use (or on hover/focus of the trigger),
// so a visitor who never opens the palette never pays for it.
const load = () => import("./dialog");
const Dialog = lazy(load);
export const preloadPalette = () => void load();

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const show = () => {
      setIsMounted(true);
      setIsOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsMounted(true);
        setIsOpen((wasOpen) => !wasOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, []);

  if (!isMounted) return null;
  return (
    <Suspense fallback={null}>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </Suspense>
  );
}
