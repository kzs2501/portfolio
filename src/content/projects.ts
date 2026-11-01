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
    slug: "dresscircle",
    title: "Dress Circle",
    summary:
      "A ticket box office you can try and try to break: timed holds, a checkout driven by the URL, idempotent payments settled by webhook, and a chaos panel that makes them fail on purpose.",
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
      "Storybook",
      "Postgres",
    ],
    demoUrl: site.links.dressCircleDemo,
    sourceUrl: site.links.dressCircleSource,
    highlight:
      "An accessible seat map, a waiting room, UPI and all-in prices, an organisers’ dashboard, a catalogue of every state with screenshot tests, the same API on Postgres and Razorpay’s test mode, tickets that work offline with a door scanner, and sixteen failure scenarios, each one an end-to-end test",
    tagline: "a ticket box office, done properly",
  },
];

export const findProject = (slug: string): ProjectMeta | undefined => projects.find((entry) => entry.slug === slug);

/** For slugs that must exist (static params come from this list): a miss is a bug. */
export function getProject(slug: string): ProjectMeta {
  const meta = findProject(slug);
  if (!meta) throw new Error(`Unknown project: ${slug}`);
  return meta;
}
