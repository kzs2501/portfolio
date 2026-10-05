import Link from "next/link";
import { site } from "@/content/site";
import { ThemeToggle } from "./theme-toggle";
import { PaletteTrigger } from "./command-palette/trigger";
import { NavLinks } from "./nav-links";

/**
 * Transparent at the top of the page; its background and hairline fade in over
 * the first 48px of scroll (pure CSS, see `.site-header` in globals.css).
 */
export function SiteHeader() {
  return (
    <header className="site-header z-30">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          {site.name}
        </Link>
        <nav aria-label="Primary" className="ml-auto hidden sm:block">
          <NavLinks />
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <PaletteTrigger />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
