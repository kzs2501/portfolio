import { site } from "@/content/site";

const links = [
  { href: `mailto:${site.email}`, label: "Email" },
  { href: site.links.github, label: "GitHub" },
  { href: site.links.linkedin, label: "LinkedIn" },
  { href: site.links.resume, label: "Résumé" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10 text-sm sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div className="space-y-1">
          <p className="text-ink">{site.email}</p>
          <p className="text-ink-3">{site.location}</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mx-auto max-w-5xl px-5 pb-10 text-xs text-ink-3 sm:px-8">
        Built with Next.js, static and dependency-light.{" "}
        <a href={site.links.source} className="underline underline-offset-4 hover:text-ink">
          Source on GitHub
        </a>
        .
      </p>
    </footer>
  );
}
