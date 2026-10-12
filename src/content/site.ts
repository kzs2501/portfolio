export const site = {
  name: "Kshitiz Sonakiya",
  title: "Kshitiz Sonakiya — Senior Frontend Engineer",
  tagline:
    "Senior frontend engineer — payments, multi-step checkout, and the tests that keep them safe.",
  description:
    "Case studies and notes from a senior frontend engineer who builds payment flows, config-driven checkouts and the test suites behind them. React, Next.js, TypeScript.",
  location: "India · open to remote",
  email: "kshitizsonakiya2001@gmail.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kshitizsonakiya.vercel.app",
  links: {
    github: "https://github.com/Punisher666",
    linkedin: "https://www.linkedin.com/in/kshitiz-sonakiya/",
    resume: "/resume.pdf",
    source: "https://github.com/Punisher666/portfolio",
  },
} as const;
