import { site } from "@/content/site";
import { CopyEmail } from "./copy-email";
import { LocalTime } from "./local-time";

const links = [
  { href: site.links.github, label: "GitHub" },
  { href: site.links.linkedin, label: "LinkedIn" },
  { href: site.links.resume, label: "Résumé" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10 text-sm sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div className="space-y-1.5">
          <CopyEmail email={site.email} className="text-ink" />
          <LocalTime />
          <p className="text-ink-3">Open to remote roles</p>
        </div>
        <ul className="-mx-2 flex flex-wrap">
          {links.map((l) => (
            <li key={l.label}>
              {/* Padding (not just text) so each link is a ≥24px target. */}
              <a href={l.href} className="inline-flex min-h-8 items-center px-2 text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mx-auto max-w-5xl px-5 pb-10 text-xs text-ink-3 sm:px-8">
        Built with Next.js, static and dependency-light.{" "}
        <a href={site.links.source} className="inline-flex min-h-6 items-center underline underline-offset-4 hover:text-ink">
          Source on GitHub
        </a>
        .
      </p>
    </footer>
  );
}
