import type { Metadata } from "next";
import { alternatesFor } from "@/app/_lib/content-page";
import { routes } from "@/lib/routes";
import { site } from "@/content/site";
import { CopyEmail } from "@/components/copy-email";
import { experience, education } from "@/content/experience";
import { SectionLabel } from "@/components/ledger";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "About",
  description: "Experience, how I work, and the tools I reach for.",
  alternates: alternatesFor(routes.about()),
};

const principles = [
  {
    title: "Make the hard part a config change",
    body: "Most of my best work has been turning a pile of special cases — payment rails, brands, onboarding steps — into one system where the next case is data, not a refactor.",
  },
  {
    title: "Model the states before the screens",
    body: "Loading, empty, error, expired, retrying. If a state can happen in production it gets a name, a design and a test before it gets pixels.",
  },
  {
    title: "Tests are how a team moves fast",
    body: "I've introduced testing to codebases that had none, twice. Not for coverage numbers — so that the next person can change payments code without fear.",
  },
];

const stack = [
  ["Core", "TypeScript, React 19, Next.js (App Router), Redux, Zustand"],
  ["Data", "TanStack Query, REST, GraphQL, Zod, React Hook Form"],
  ["Payments", "Stripe, Stripe Connect, Plaid, wagmi/viem, Solana"],
  ["Styling", "Tailwind CSS, Sass, design tokens, design systems"],
  ["Quality", "Vitest, Jest, React Testing Library, MSW, Playwright, Lighthouse CI"],
];

export default function About() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-5 pt-20 sm:px-8">
        <h1 className="font-serif text-5xl tracking-tight">About</h1>
        <div className="prose-ledger mt-8 text-ink-2">
          <p>
            I&rsquo;m a frontend engineer based in India, with three years of shipping React into products that move
            money: automotive checkouts at Tekion, then a multi-rail giving platform and a nonprofit portal at Benefi.
          </p>
          <p>
            I&rsquo;m happiest where the UI is the hard part — long, branching flows with real consequences when a state
            is wrong. I&rsquo;m looking for a remote senior frontend role on a product team that cares about craft.
          </p>
        </div>

        <section aria-labelledby="principles" className="mt-16">
          <SectionLabel id="principles">How I work</SectionLabel>
          <div className="mt-6 space-y-8">
            {principles.map((p) => (
              <div key={p.title}>
                <h3 className="font-serif text-2xl tracking-tight">{p.title}</h3>
                <p className="mt-2 text-ink-2">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="experience" className="mt-16">
          <SectionLabel id="experience">Experience</SectionLabel>
          <ol className="mt-4">
            {experience.map((e) => (
              <li key={e.title} className="grid gap-1 border-b border-rule py-6 sm:grid-cols-[9.5rem_1fr] sm:gap-6">
                <span className="num pt-0.5 text-sm text-ink-3">{e.period}</span>
                <div>
                  <p className="font-medium">
                    {e.title}{" "}
                    <span className="text-ink-3">
                      · {e.org}, {e.place}
                    </span>
                  </p>
                  <p className="mt-1.5 text-ink-2">{e.summary}</p>
                </div>
              </li>
            ))}
            <li className="grid gap-1 py-6 sm:grid-cols-[9.5rem_1fr] sm:gap-6">
              <span className="num pt-0.5 text-sm text-ink-3">{education.period}</span>
              <p className="font-medium">
                {education.degree} <span className="text-ink-3">· {education.school}</span>
              </p>
            </li>
          </ol>
        </section>

        <section aria-labelledby="stack" className="mt-16">
          <SectionLabel id="stack">Tools</SectionLabel>
          <dl className="mt-4 space-y-3 text-sm">
            {stack.map(([k, v]) => (
              <div key={k} className="grid gap-1 sm:grid-cols-[9.5rem_1fr] sm:gap-6">
                <dt className="num text-ink-3">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-16 text-ink-2">
          The fastest way to reach me is <CopyEmail email={site.email} className="text-accent" />, or grab the{" "}
          <a href={site.links.resume} className="text-accent underline underline-offset-4">
            résumé
          </a>
          .
        </p>
      </div>
    </PageTransition>
  );
}
