"use client";

import { useEffect } from "react";

/** The reading line: a heading above this (25% down the viewport) has "begun". */
const READING_LINE = 0.25;

/**
 * Marks the section being read with aria-current="location" on every matching
 * contents link.
 *
 * The IntersectionObserver is only a *trigger* — it fires whenever a heading
 * crosses the reading line. The current section is then computed from geometry
 * (the last heading above the line), never inferred from the events themselves:
 * a big jump fires several crossings in one batch, in no guaranteed order, and
 * event-order logic would mark the wrong section.
 */
export function TocActive({ ids }: { ids: string[] }) {
  useEffect(() => {
    const headings = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    const update = () => {
      const line = window.innerHeight * READING_LINE;
      let current: string | null = null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) current = h.id;
        else break; // headings are in document order
      }
      document.querySelectorAll<HTMLAnchorElement>("[data-toc-id]").forEach((a) => {
        if (a.dataset["tocId"] === current) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    };

    const observer = new IntersectionObserver(update, {
      rootMargin: `0px 0px -${(1 - READING_LINE) * 100}% 0px`,
    });
    headings.forEach((h) => observer.observe(h));
    update();
    return () => observer.disconnect();
  }, [ids]);

  return null;
}
