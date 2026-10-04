import type { ReactNode } from "react";

/** A highlighted aside inside a case study or note. */
export function Callout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="rounded-lg border border-rule bg-surface px-5 py-4 text-[0.97rem]">
      {title && <p className="num mb-1 text-[11px] tracking-[0.16em] text-accent uppercase">{title}</p>}
      <div className="space-y-2 text-ink-2">{children}</div>
    </aside>
  );
}

/** Full-bleed-ish wrapper for demos and diagrams, wider than the prose column. */
export function Figure({ caption, children }: { caption?: ReactNode; children: ReactNode }) {
  return (
    <figure className="not-prose my-10 sm:-mx-8 md:-mx-20">
      {children}
      {caption && <figcaption className="mt-3 px-1 text-sm text-ink-3 sm:px-8 md:px-20">{caption}</figcaption>}
    </figure>
  );
}
