import { site } from "./site";

export type ProjectMeta = {
  slug: string;
  title: string;
  summary: string;
  period: string;
  stack: string[];
  demoUrl: string;
  sourceUrl: string;
  /** One line on why it's worth a look. */
  highlight: string;
};

/** Public, runnable work — the code is the evidence. */
export const projects: ProjectMeta[] = [
  {
    slug: "admit-one",
    title: "admit-one",
    summary:
      "An event-ticketing checkout with timed holds, a typed step registry, idempotent payments and webhooks — plus a chaos panel that breaks it on purpose.",
    period: "2026",
    stack: ["Next.js 16", "React 19", "TypeScript", "TanStack Query", "React Hook Form", "Zod", "MSW", "Vitest", "Playwright"],
    demoUrl: site.links.admitOneDemo,
    sourceUrl: site.links.admitOneSource,
    highlight: "Nine failure scenarios, each one an end-to-end test",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
