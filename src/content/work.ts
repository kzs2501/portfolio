export interface WorkMeta {
  slug: string;
  title: string;
  org: string;
  period: string;
  summary: string;
  role: string;
  team: string;
  stack: string[];
  demo: string;
}

/** Order here is the order on the homepage. */
export const work: WorkMeta[] = [
  {
    slug: "four-rails-one-checkout",
    title: "Four payment rails, one checkout",
    org: "Benefi",
    period: "2025–26",
    summary:
      "Cards, crypto, brokerage securities and donor-advised funds behind one config-driven checkout of 30+ stages — where adding a payment rail became a config change instead of a refactor.",
    role: "Architected and built the giving flow",
    team: "Web team of ~5",
    stack: ["Next.js", "React 19", "TypeScript", "Zustand", "TanStack Query", "Stripe", "wagmi/viem"],
    demo: "Stage-registry playground",
  },
  {
    slug: "charity-portal",
    title: "Founding engineer: the charity portal",
    org: "Benefi",
    period: "2026",
    summary:
      "A portal for nonprofits, from an empty repo to production in under six months: identity verification, Plaid and Stripe Connect payouts, and a test suite the company didn’t have before.",
    role: "Founding engineer, ~84% of commits",
    team: "Me, plus two contributors",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind 4", "TanStack Query", "Zod", "Vitest", "MSW"],
    demo: "Single-flight token refresh",
  },
  {
    slug: "multi-brand-checkout",
    title: "One checkout, many brands",
    org: "Tekion",
    period: "2023–25",
    summary:
      "A token-driven, config-built checkout that served Honda, GM’s brands and others from one codebase — and turned onboarding a new brand from a project into configuration.",
    role: "Built the checkout; designed the multi-brand architecture",
    team: "Product engineering team",
    stack: ["React", "Redux", "GraphQL", "Design tokens", "Compound components"],
    demo: "Live brand re-skin",
  },
];

export const findWork = (slug: string): WorkMeta | undefined => work.find((entry) => entry.slug === slug);

/** For slugs that must exist (static params come from this list): a miss is a bug. */
export function getWork(slug: string): WorkMeta {
  const meta = findWork(slug);
  if (!meta) throw new Error(`Unknown case study: ${slug}`);
  return meta;
}
