import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

const VARIANT_CLASSES = {
  primary: "bg-accent text-paper hover:opacity-90",
  secondary: "border border-rule text-ink hover:bg-surface-2",
} as const;

type ActionLinkProps = { variant?: keyof typeof VARIANT_CLASSES; children: ReactNode } & (
  { href: Route; isExternal?: false } | { href: string; isExternal: true }
);

/** A call to action shaped like a button but behaving like a link. External links open in a new tab. */
export function ActionLink({ variant = "primary", children, ...target }: ActionLinkProps) {
  const className = `press rounded-sm px-5 py-2.5 font-sans font-medium ${VARIANT_CLASSES[variant]}`;
  if (target.isExternal) {
    return (
      <a href={target.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children} <span aria-hidden="true">↗</span>
      </a>
    );
  }
  return (
    <Link href={target.href} className={className}>
      {children}
    </Link>
  );
}
