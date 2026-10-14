import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

/** "← All notes": the way back to an index, animating as a backwards navigation. */
export function BackLink({ href, children }: { href: Route; children: ReactNode }) {
  return (
    <Link
      href={href}
      transitionTypes={["nav-back"]}
      className="-mx-1 inline-flex min-h-8 items-center px-1 text-sm text-ink-3 hover:text-ink"
    >
      ← {children}
    </Link>
  );
}
