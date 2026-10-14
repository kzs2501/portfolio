import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

const VARIANT_CLASSES = {
  primary: "bg-ink text-paper hover:opacity-85",
  secondary: "border border-rule text-ink hover:bg-surface-2",
} as const;

type PillLinkProps = { variant?: keyof typeof VARIANT_CLASSES; children: ReactNode } & (
  { href: Route; isExternal?: false } | { href: string; isExternal: true }
);

/** A call to action shaped like a button but behaving like a link. External links open in a new tab. */
export function PillLink({ variant = "primary", children, ...target }: PillLinkProps) {
  const className = `press rounded-full px-5 py-2.5 ${VARIANT_CLASSES[variant]}`;
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
