const NAME = "Kshitiz Sonakiya";
const ROLE = "Senior Frontend Engineer";

export const site = {
  name: NAME,
  role: ROLE,
  title: `${NAME} — ${ROLE}`,
  /** What the work is about, in one line — the homepage subtitle and the link-preview title. */
  focus: "Payments, multi-step checkout, and the tests that keep them safe.",
  description:
    "Case studies and notes from a senior frontend engineer who builds payment flows, config-driven checkouts and the test suites behind them. React, Next.js, TypeScript.",
  location: "India · open to remote",
  email: "kshitizsonakiya2001@gmail.com",
  url: process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://kshitizsonakiya.vercel.app",
  links: {
    github: "https://github.com/kzs2501",
    linkedin: "https://www.linkedin.com/in/kshitiz-sonakiya/",
    resume: "/resume.pdf",
    source: "https://github.com/kzs2501/portfolio",
    // Deploy day: replace with the real Vercel URL for admit-one.
    admitOneDemo: "https://admit-one.vercel.app",
    admitOneSource: "https://github.com/kzs2501/admit-one",
  },
} as const;
