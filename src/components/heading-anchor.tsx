"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";

/**
 * An h2 with a link to itself. The link sits beside the heading, not inside it,
 * so screen readers announce headings cleanly. It's a real <a href="#id">
 * (⌘-click and no-JS work); clicking also copies the section URL.
 */
export function AnchoredHeading({ id, children, ...props }: ComponentProps<"h2">) {
  const [hasCopied, setHasCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!id) return <h2 {...props}>{children}</h2>;
  const title = typeof children === "string" ? children : id;

  return (
    <div className="anchored-heading flex items-baseline gap-2">
      <h2 id={id} {...props}>
        {children}
      </h2>
      <a
        href={`#${id}`}
        aria-label={`Link to section: ${title}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${id}`);
            setHasCopied(true);
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => setHasCopied(false), 1500);
          } catch {
            // No clipboard: the hash navigation still updates the address bar.
          }
        }}
        className="heading-anchor num inline-flex min-h-6 min-w-6 shrink-0 items-center justify-center rounded text-base text-ink-3 hover:text-accent"
      >
        {hasCopied ? "✓" : "#"}
      </a>
      <span role="status" aria-live="polite" className="sr-only">
        {hasCopied ? "Link copied" : ""}
      </span>
    </div>
  );
}
