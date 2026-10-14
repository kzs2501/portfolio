import type { Metadata } from "next";
import { ViewTransition } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { work, getWork } from "@/content/work";
import { Ledger } from "@/components/ledger";
import { PageTransition } from "@/components/page-transition";
import { ReadingProgress } from "@/components/reading-progress";
import { TocInline, TocSidebar } from "@/components/toc";
import { extractToc } from "@/lib/toc";

export const dynamicParams = false;

export function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const meta = getWork((await params).slug);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.summary,
    openGraph: {
      title: meta.title,
      description: meta.summary,
      type: "article",
    },
  };
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const meta = getWork(slug);
  if (!meta) notFound();

  const { default: Body } = await import(`@/content/work/${slug}.mdx`);
  // Contents are built from the MDX source at build time — static HTML, no JS needed.
  const toc = extractToc(readFileSync(join(process.cwd(), "src/content/work", `${slug}.mdx`), "utf8"));
  const index = work.findIndex((w) => w.slug === slug);
  const next = work[(index + 1) % work.length];

  return (
    <PageTransition>
      <ReadingProgress />
      <div className="mx-auto max-w-2xl px-5 sm:px-8 xl:grid xl:max-w-none xl:grid-cols-[13rem_minmax(0,42rem)_13rem] xl:justify-center xl:gap-12">
        <aside className="hidden pt-14 xl:block">
          <div className="h-full pt-[11.5rem]">
            <TocSidebar items={toc} />
          </div>
        </aside>
        <article className="pt-14">
          <Link
            href="/#work"
            transitionTypes={["nav-back"]}
            className="-mx-1 inline-flex min-h-8 items-center px-1 text-sm text-ink-3 hover:text-ink"
          >
            ← All work
          </Link>
          <header className="mt-10">
            <p className="num text-xs tracking-[0.18em] text-ink-3 uppercase">
              Case study {String(index + 1).padStart(2, "0")} · {meta.org} · {meta.period}
            </p>
            {/* Same name as the homepage row: the title morphs between the two. Works because
              data-scroll-behavior lets Next reset scroll before the new snapshot. */}
            <ViewTransition name={`work-title-${slug}`} share="morph" default="none">
              <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.05] tracking-tight text-balance sm:text-5xl">
                {meta.title}
              </h1>
            </ViewTransition>
            <p className="mt-5 text-lg leading-relaxed text-pretty text-ink-2">{meta.summary}</p>
            <div className="mt-8 rounded-lg border border-rule bg-surface px-5 py-4">
              <Ledger
                caption="Project facts"
                rows={[
                  { label: "Role", value: meta.role },
                  { label: "Team", value: meta.team },
                  { label: "Company", value: `${meta.org}, ${meta.period}` },
                  { label: "Stack", value: meta.stack.join(", ") },
                ]}
              />
            </div>
            <TocInline items={toc} />
          </header>

          <div className="prose-ledger mt-12">
            <Body />
          </div>

          <nav aria-label="Next case study" className="mt-20 border-t border-rule pt-8">
            <p className="num text-xs tracking-[0.18em] text-ink-3 uppercase">Next case study</p>
            <Link
              href={`/work/${next.slug}`}
              transitionTypes={["nav-forward"]}
              className="mt-2 block font-serif text-2xl tracking-tight hover:text-accent"
            >
              {next.title} →
            </Link>
          </nav>
        </article>
      </div>
    </PageTransition>
  );
}
