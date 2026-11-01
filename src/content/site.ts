const NAME = "Kshitiz Sonakiya";
const ROLE = "Senior Frontend Engineer";

export const site = {
  name: NAME,
  role: ROLE,
  title: `${NAME} · ${ROLE}`,
  /** How I work, in one line: the homepage heading's second half and the link-preview title. */
  focus: "I build web apps that stay fast, accessible and correct under pressure.",
  description:
    "Case studies, notes and live projects from a senior frontend engineer who builds web apps that stay fast, accessible and correct under pressure: design systems, long forms and flows, performance, and the tests behind them. React, Next.js, TypeScript.",
  location: "India · open to remote",
  email: "kshitizsonakiya2001@gmail.com",
  url: process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://kshitizsonakiya.vercel.app",
  links: {
    github: "https://github.com/kzs2501",
    linkedin: "https://www.linkedin.com/in/kshitiz-sonakiya/",
    resume: "/resume.pdf",
    source: "https://github.com/kzs2501/portfolio",
    dressCircleDemo: "https://dresscircle.vercel.app",
    dressCircleSource: "https://github.com/kzs2501/dresscircle",
  },
} as const;
