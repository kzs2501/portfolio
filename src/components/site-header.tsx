import Link from "next/link";
import { site } from "@/content/site";
import { ThemeToggle } from "./theme-toggle";
import { PaletteTrigger } from "./command-palette/trigger";

const nav = [
  { href: "/#work", label: "Work" },
  { href: "/notes", label: "Notes" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-rule/60 bg-paper/80 backdrop-blur-md supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          {site.name}
        </Link>
        <nav aria-label="Primary" className="ml-auto hidden sm:block">
          <ul className="flex items-center gap-1 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <PaletteTrigger />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
