import Link from "next/link";
import { ViewTransition } from "react";
import { site } from "@/content/site";
import { work } from "@/content/work";
import { notes, formatDate } from "@/content/notes";
import { projects } from "@/content/projects";
import { SectionLabel } from "@/components/ledger";
import { PageTransition } from "@/components/page-transition";
import { routes } from "@/lib/routes";
import { PillLink } from "@/components/pill-link";

export default function Home() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <section aria-labelledby="intro" className="pt-20 pb-16 sm:pt-28">
          <p className="num text-xs tracking-[0.18em] text-ink-3 uppercase">{site.location}</p>
          <h1
            id="intro"
            className="mt-5 max-w-3xl font-serif text-[2.6rem] leading-[1.05] tracking-tight text-balance sm:text-6xl"
          >
            Senior frontend engineer. <span className="text-ink-2 italic">{site.focus}</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-2">
            Three years shipping React and Next.js into money-moving products — most recently four payment rails behind
            one checkout, and a nonprofit portal I built from an empty repo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <PillLink href={routes.homeSection("work")}>See the work</PillLink>
            <a
              href={`mailto:${site.email}`}
              className="press rounded-full border border-rule px-5 py-2.5 text-ink hover:bg-surface-2"
            >
              Get in touch
            </a>
          </div>
        </section>

        <section aria-labelledby="work" className="scroll-mt-24">
          <SectionLabel id="work">Selected work</SectionLabel>
          <ol className="mt-2">
            {work.map((w, i) => (
              <li key={w.slug} className="border-b border-rule">
                <Link
                  href={routes.work(w.slug)}
                  transitionTypes={["nav-forward"]}
                  className="group grid gap-x-8 gap-y-2 py-8 sm:grid-cols-[3rem_1fr_auto]"
                >
                  <span className="num text-sm text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    {/* Morphs into the case study's headline on click (and back). */}
                    <ViewTransition name={`work-title-${w.slug}`} share="morph" default="none">
                      <span className="block font-serif text-2xl leading-tight tracking-tight transition-colors group-hover:text-accent sm:text-3xl">
                        {w.title}
                      </span>
                    </ViewTransition>
                    <span className="mt-2 block max-w-2xl text-pretty text-ink-2">{w.summary}</span>
                    <span className="mt-3 block text-sm text-ink-3">Includes an interactive demo · {w.demo}</span>
                  </span>
                  <span className="num text-sm text-ink-3 sm:text-right">
                    {w.org}
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> · </span>
                    {w.period}
                  </span>
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
                <Link
                  href={routes.project(p.slug)}
                  transitionTypes={["nav-forward"]}
                  className="group grid gap-x-8 gap-y-2 py-8 sm:grid-cols-[3rem_1fr_auto]"
                >
                  <span aria-hidden="true" className="num text-sm text-ink-3">
                    ↗
                  </span>
                  <span>
                    <span className="block font-serif text-2xl leading-tight tracking-tight transition-colors group-hover:text-accent sm:text-3xl">
                      {p.title}
                    </span>
                    <span className="mt-2 block max-w-2xl text-pretty text-ink-2">{p.summary}</span>
                    <span className="mt-3 block text-sm text-ink-3">Live demo and source · {p.highlight}</span>
                  </span>
                  <span className="num text-sm text-ink-3 sm:text-right">
                    Personal
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> · </span>
                    {p.period}
                  </span>
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
                  <span className="font-medium transition-colors group-hover:text-accent">{n.title}</span>
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
