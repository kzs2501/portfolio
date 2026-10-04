"use client";

import { lazy, Suspense, useEffect, useState } from "react";

export const OPEN_EVENT = "palette:open";

// The dialog's code downloads on first use (or on hover/focus of the trigger),
// so a visitor who never opens the palette never pays for it.
const load = () => import("./dialog");
const Dialog = lazy(load);
export const preloadPalette = () => void load();

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const show = () => {
      setMounted(true);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMounted(true);
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, []);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <Dialog open={open} onClose={() => setOpen(false)} />
    </Suspense>
  );
}
