import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";
import { site } from "@/content/site";
import { work } from "@/content/work";
import { notes, formatDate } from "@/content/notes";
import { projects } from "@/content/projects";
import { SectionLabel } from "@/components/ledger";
import { PageTransition } from "@/components/page-transition";
import { routes } from "@/lib/routes";
import { ActionLink } from "@/components/action-link";
import { alternatesFor } from "@/app/_lib/content-page";

export const metadata: Metadata = { alternates: alternatesFor(routes.home()) };

/** The line above a row's title, drawn like a callout on a drawing: "→ Benefi · 2025–26". */
function RowMeta({ children }: { children: ReactNode }) {
  return (
    <span className="num block text-xs tracking-[0.04em] text-ink-3">
      <span aria-hidden="true" className="text-accent">
        →{" "}
      </span>
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <PageTransition>
      <section aria-labelledby="intro" className="blueprint">
        <div className="mx-auto max-w-5xl px-5 pt-20 pb-16 sm:px-8 sm:pt-28">
          <p className="num text-xs tracking-[0.1em] text-ink-3 uppercase">{site.location}</p>
          <h1
            id="intro"
            className="mt-5 max-w-3xl font-sans text-[2.1rem] leading-[1.08] font-extrabold tracking-[-0.025em] text-balance sm:text-5xl"
          >
            Senior frontend engineer. <span className="font-medium text-ink-2">{site.focus}</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-2">
            Three years shipping React and Next.js into money-moving products — most recently four payment rails behind
            one checkout, and a nonprofit portal I built from an empty repo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <ActionLink href={routes.homeSection("work")}>See the work</ActionLink>
            <a
              href={`mailto:${site.email}`}
              className="press rounded-sm border border-rule px-5 py-2.5 font-sans font-medium text-ink hover:bg-surface-2"
            >
              Get in touch
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <section aria-labelledby="work" className="scroll-mt-24">
          <SectionLabel id="work">Selected work</SectionLabel>
          <ol className="mt-2">
            {work.map((w) => (
              <li key={w.slug} className="border-b border-rule">
                <Link href={routes.work(w.slug)} transitionTypes={["nav-forward"]} className="group block py-8">
                  <RowMeta>
                    {w.org} · {w.period}
                  </RowMeta>
                  {/* Morphs into the case study's headline on click (and back). */}
                  <ViewTransition name={`work-title-${w.slug}`} share="morph" default="none">
                    <span className="mt-2 block font-sans text-2xl leading-tight font-bold tracking-tight transition-colors group-hover:text-accent sm:text-[1.75rem]">
                      {w.title}
                    </span>
                  </ViewTransition>
                  <span className="mt-2 block max-w-2xl text-pretty text-ink-2">{w.summary}</span>
                  <span className="mt-3 block text-sm text-ink-3">Includes an interactive demo · {w.demo}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="projects" className="mt-24 scroll-mt-24">
          <SectionLabel id="projects">Projects</SectionLabel>
          <ul className="mt-2">
            {projects.map((p) => (
              <li key={p.slug} className="border-b border-rule">
                <Link href={routes.project(p.slug)} transitionTypes={["nav-forward"]} className="group block py-8">
                  <RowMeta>Personal · {p.period}</RowMeta>
                  <span className="mt-2 block font-sans text-2xl leading-tight font-bold tracking-tight transition-colors group-hover:text-accent sm:text-[1.75rem]">
                    {p.title}
                  </span>
                  <span className="mt-2 block max-w-2xl text-pretty text-ink-2">{p.summary}</span>
                  <span className="mt-3 block text-sm text-ink-3">Live demo and source · {p.highlight}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="notes" className="mt-24">
          <SectionLabel id="notes">Notes</SectionLabel>
          <ul className="mt-2">
            {notes.map((n) => (
              <li key={n.slug} className="border-b border-rule">
                <Link
                  href={routes.note(n.slug)}
                  transitionTypes={["nav-forward"]}
                  className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="font-sans font-semibold transition-colors group-hover:text-accent">{n.title}</span>
                  <span className="num shrink-0 text-sm text-ink-3">{formatDate(n.date)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageTransition>
  );
}
