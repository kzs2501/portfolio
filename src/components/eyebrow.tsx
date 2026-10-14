import type { ReactNode } from "react";

/** The small-caps line above a title: "Case study 01 · Benefi · 2025–26". */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`num text-xs tracking-[0.18em] text-ink-3 uppercase ${className}`}>{children}</p>;
}
