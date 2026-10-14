import { site } from "@/content/site";
import { work } from "@/content/work";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";
import type { Route } from "next";
import { routes } from "@/lib/routes";

export type CommandAction =
  { type: "navigate"; href: Route } | { type: "external"; href: string } | { type: "theme" } | { type: "copy-email" };

export interface Command {
  id: string;
  group: "Pages" | "Case studies" | "Projects" | "Notes" | "Actions";
  label: string;
  hint?: string;
  keywords?: string;
  action: CommandAction;
}

export const COMMANDS: readonly Command[] = [
  { id: "home", group: "Pages", label: "Home", action: { type: "navigate", href: routes.home() } },
  { id: "notes", group: "Pages", label: "Notes", action: { type: "navigate", href: routes.notes() } },
  {
    id: "about",
    group: "Pages",
    label: "About",
    keywords: "experience cv history",
    action: { type: "navigate", href: routes.about() },
  },
  ...work.map<Command>((w) => ({
    id: `work-${w.slug}`,
    group: "Case studies",
    label: w.title,
    hint: w.org,
    keywords: w.stack.join(" "),
    action: { type: "navigate", href: routes.work(w.slug) },
  })),
  ...projects.map<Command>((p) => ({
    id: `project-${p.slug}`,
    group: "Projects",
    label: p.title,
    hint: "Project",
    keywords: `${p.stack.join(" ")} ticketing checkout demo`,
    action: { type: "navigate", href: routes.project(p.slug) },
  })),
  ...notes.map<Command>((n) => ({
    id: `note-${n.slug}`,
    group: "Notes",
    label: n.title,
    action: { type: "navigate", href: routes.note(n.slug) },
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
const CONTIGUOUS_MATCH_SCORE = 1000;
const WORD_START_BONUS = 500;
const SUBSEQUENCE_MATCH_SCORE = 300;

export function score(query: string, text: string): number | null {
  const needle = query.trim().toLowerCase();
  if (!needle) return 0;
  const haystack = text.toLowerCase();

  const matchIndex = haystack.indexOf(needle);
  if (matchIndex !== -1) {
    const isWordStart = matchIndex === 0 || /\s|[-—:(]/.test(haystack.charAt(matchIndex - 1));
    return CONTIGUOUS_MATCH_SCORE - matchIndex + (isWordStart ? WORD_START_BONUS : 0);
  }

  // Subsequence: every query character in order, with a penalty for gaps.
  let searchFrom = 0;
  let gaps = 0;
  for (const character of needle) {
    const found = haystack.indexOf(character, searchFrom);
    if (found === -1) return null;
    gaps += found - searchFrom;
    searchFrom = found + 1;
  }
  return Math.max(1, SUBSEQUENCE_MATCH_SCORE - gaps);
}

/** Keyword and hint matches rank below label matches of the same quality. */
const KEYWORD_MATCH_PENALTY = 200;

export function filterCommands(query: string, list: readonly Command[] = COMMANDS): Command[] {
  if (!query.trim()) return [...list];
  return list
    .map((command) => {
      const rank = Math.max(
        score(query, command.label) ?? -1,
        (score(query, `${command.keywords ?? ""} ${command.hint ?? ""}`) ?? -1) - KEYWORD_MATCH_PENALTY,
      );
      return { command, rank };
    })
    .filter(({ rank }) => rank > 0)
    .sort((first, second) => second.rank - first.rank)
    .map(({ command }) => command);
}
