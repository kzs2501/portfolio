import { site } from "@/content/site";
import { work } from "@/content/work";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";

export type CommandAction =
  { type: "navigate"; href: string } | { type: "external"; href: string } | { type: "theme" } | { type: "copy-email" };

export type Command = {
  id: string;
  group: "Pages" | "Case studies" | "Projects" | "Notes" | "Actions";
  label: string;
  hint?: string;
  keywords?: string;
  action: CommandAction;
};

export const commands: Command[] = [
  { id: "home", group: "Pages", label: "Home", action: { type: "navigate", href: "/" } },
  { id: "notes", group: "Pages", label: "Notes", action: { type: "navigate", href: "/notes" } },
  {
    id: "about",
    group: "Pages",
    label: "About",
    keywords: "experience cv history",
    action: { type: "navigate", href: "/about" },
  },
  ...work.map<Command>((w) => ({
    id: `work-${w.slug}`,
    group: "Case studies",
    label: w.title,
    hint: w.org,
    keywords: w.stack.join(" "),
    action: { type: "navigate", href: `/work/${w.slug}` },
  })),
  ...projects.map<Command>((p) => ({
    id: `project-${p.slug}`,
    group: "Projects",
    label: p.title,
    hint: "Project",
    keywords: `${p.stack.join(" ")} ticketing checkout demo`,
    action: { type: "navigate", href: `/projects/${p.slug}` },
  })),
  ...notes.map<Command>((n) => ({
    id: `note-${n.slug}`,
    group: "Notes",
    label: n.title,
    action: { type: "navigate", href: `/notes/${n.slug}` },
  })),
  { id: "theme", group: "Actions", label: "Switch theme", keywords: "dark light mode", action: { type: "theme" } },
  {
    id: "email",
    group: "Actions",
    label: "Copy email address",
    hint: site.email,
    keywords: "contact mail",
    action: { type: "copy-email" },
  },
  {
    id: "resume",
    group: "Actions",
    label: "Open résumé",
    keywords: "resume cv pdf",
    action: { type: "external", href: site.links.resume },
  },
  {
    id: "github",
    group: "Actions",
    label: "GitHub",
    keywords: "code source",
    action: { type: "external", href: site.links.github },
  },
  {
    id: "linkedin",
    group: "Actions",
    label: "LinkedIn",
    keywords: "contact",
    action: { type: "external", href: site.links.linkedin },
  },
];

/**
 * Rank a candidate against a query. Higher is better; null means no match.
 * Contiguous matches beat scattered ones, and matches at a word start beat
 * matches mid-word — "fo" should find "Four payment rails" before "Portfolio".
 */
export function score(query: string, text: string): number | null {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const t = text.toLowerCase();

  const at = t.indexOf(q);
  if (at !== -1) {
    const wordStart = at === 0 || /\s|[-—:(]/.test(t[at - 1]);
    return 1000 - at + (wordStart ? 500 : 0);
  }

  // Subsequence: every query char in order, with a penalty for gaps.
  let ti = 0;
  let gaps = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return null;
    gaps += found - ti;
    ti = found + 1;
  }
  return Math.max(1, 300 - gaps);
}

export function filterCommands(query: string, list: Command[] = commands): Command[] {
  if (!query.trim()) return list;
  return list
    .map((c) => {
      const s = Math.max(
        score(query, c.label) ?? -1,
        (score(query, `${c.keywords ?? ""} ${c.hint ?? ""}`) ?? -1) - 200,
      );
      return { c, s };
    })
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .map(({ c }) => c);
}
