import { site } from "./site";

export interface ProjectMeta {
  slug: string;
  title: string;
  summary: string;
  period: string;
  stack: string[];
  demoUrl: string;
  sourceUrl: string;
  /** One line on why it's worth a look. */
  highlight: string;
  /** What it is, in a few words — the subtitle on its link-preview card. */
  tagline: string;
}

/** Public, runnable work — the code is the evidence. */
export const projects: ProjectMeta[] = [
  {
    slug: "admit-one",
    title: "admit-one",
    summary:
      "An event-ticketing checkout with timed holds, a typed step registry, idempotent payments and webhooks — plus a chaos panel that breaks it on purpose.",
    period: "2026",
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "TanStack Query",
      "React Hook Form",
      "Zod",
      "MSW",
      "Vitest",
      "Playwright",
    ],
    demoUrl: site.links.admitOneDemo,
    sourceUrl: site.links.admitOneSource,
    highlight:
      "An accessible seat map, a waiting room, UPI and all-in prices, and fifteen failure scenarios, each one an end-to-end test",
    tagline: "a ticketing checkout, done properly",
  },
];

export const findProject = (slug: string): ProjectMeta | undefined => projects.find((entry) => entry.slug === slug);

/** For slugs that must exist (static params come from this list): a miss is a bug. */
export function getProject(slug: string): ProjectMeta {
  const meta = findProject(slug);
  if (!meta) throw new Error(`Unknown project: ${slug}`);
  return meta;
}
