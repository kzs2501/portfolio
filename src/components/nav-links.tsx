"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";

const nav = [
  { href: routes.homeSection("work"), label: "Work", match: (p: string) => p === "/" || p.startsWith("/work") },
  { href: routes.notes(), label: "Notes", match: (p: string) => p.startsWith("/notes") },
  { href: routes.about(), label: "About", match: (p: string) => p.startsWith("/about") },
];

/** Primary nav with a "you are here" underline (aria-current="page"). */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1 text-sm">
      {nav.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={item.match(pathname) ? "page" : undefined}
            className="nav-link relative block rounded-md px-3 py-2 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
