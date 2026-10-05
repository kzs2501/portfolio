import Link from "next/link";
import { ViewTransition } from "react";
import { site } from "@/content/site";
import { work } from "@/content/work";
import { notes, formatDate } from "@/content/notes";
import { SectionLabel } from "@/components/ledger";
import { PageTransition } from "@/components/page-transition";

export default function Home() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <section aria-labelledby="intro" className="pt-20 pb-16 sm:pt-28">
          <p className="num text-ink-3 text-xs tracking-[0.18em] uppercase">
            {site.location}
          </p>
          <h1
            id="intro"
            className="mt-5 max-w-3xl font-serif text-[2.6rem] leading-[1.05] tracking-tight text-balance sm:text-6xl"
          >
            Senior frontend engineer.{" "}
            <span className="text-ink-2 italic">
              Payments, multi-step checkout, and the tests that keep them safe.
            </span>
          </h1>
          <p className="text-ink-2 mt-7 max-w-xl text-lg leading-relaxed">
            Three years shipping React and Next.js into money-moving products —
            most recently four payment rails behind one checkout, and a
            nonprofit portal I built from an empty repo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link
              href="#work"
              className="press bg-ink text-paper rounded-full px-5 py-2.5 hover:opacity-85"
            >
              See the work
            </Link>
            <a
              href={`mailto:${site.email}`}
              className="press border-rule text-ink hover:bg-surface-2 rounded-full border px-5 py-2.5"
            >
              Get in touch
            </a>
          </div>
        </section>

        <section aria-labelledby="work" className="scroll-mt-24">
          <SectionLabel id="work">Selected work</SectionLabel>
          <ol className="mt-2">
            {work.map((w, i) => (
              <li key={w.slug} className="border-rule border-b">
                <Link
                  href={`/work/${w.slug}`}
                  transitionTypes={["nav-forward"]}
                  className="group grid gap-x-8 gap-y-2 py-8 sm:grid-cols-[3rem_1fr_auto]"
                >
                  <span className="num text-ink-3 text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    {/* Morphs into the case study's headline on click (and back). */}
                    <ViewTransition
                      name={`work-title-${w.slug}`}
                      share="morph"
                      default="none"
                    >
                      <span className="group-hover:text-accent block font-serif text-2xl leading-tight tracking-tight transition-colors sm:text-3xl">
                        {w.title}
                      </span>
                    </ViewTransition>
                    <span className="text-ink-2 mt-2 block max-w-2xl text-pretty">
                      {w.summary}
                    </span>
                    <span className="text-ink-3 mt-3 block text-sm">
                      Includes an interactive demo · {w.demo}
                    </span>
                  </span>
                  <span className="num text-ink-3 text-sm sm:text-right">
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

        <section aria-labelledby="notes" className="mt-24">
          <SectionLabel id="notes">Notes</SectionLabel>
          <ul className="mt-2">
            {notes.map((n) => (
              <li key={n.slug} className="border-rule border-b">
                <Link
                  href={`/notes/${n.slug}`}
                  transitionTypes={["nav-forward"]}
                  className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="group-hover:text-accent font-medium transition-colors">
                    {n.title}
                  </span>
                  <span className="num text-ink-3 shrink-0 text-sm">
                    {formatDate(n.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageTransition>
  );
}
