import Link from "next/link";
import type { ReactNode } from "react";
import { isSitePage, routes } from "@/lib/routes";

/**
 * A link in the writing. One to another of the site's pages is Next's Link, like every
 * other link between pages here: fetched while it's on screen, opened without reloading
 * the page, and sliding forward like the home page's cards. Anything else (another site,
 * a file, a place on this page) stays a plain link. MDX gives a link its href and text;
 * the prose styles it.
 */
export function ProseLink({ href, children }: { href?: string | undefined; children?: ReactNode }) {
  if (href && isSitePage(href)) {
    return (
      <Link href={routes.inContent(href)} transitionTypes={["nav-forward"]}>
        {children}
      </Link>
    );
  }
  return <a href={href}>{children}</a>;
}
