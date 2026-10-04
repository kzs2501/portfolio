import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { work, getWork } from "@/content/work";
import { Ledger } from "@/components/ledger";
import { PageTransition } from "@/components/page-transition";

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
    openGraph: { title: meta.title, description: meta.summary, type: "article" },
  };
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const meta = getWork(slug);
  if (!meta) notFound();

  const { default: Body } = await import(`@/content/work/${slug}.mdx`);
  const index = work.findIndex((w) => w.slug === slug);
  const next = work[(index + 1) % work.length];

  return (
    <PageTransition>
      <article className="mx-auto max-w-2xl px-5 pt-14 sm:px-8">
        <Link href="/#work" transitionTypes={["nav-back"]} className="text-sm text-ink-3 hover:text-ink">
          ← All work
        </Link>
        <header className="mt-10">
          <p className="num text-xs tracking-[0.18em] text-ink-3 uppercase">
            Case study {String(index + 1).padStart(2, "0")} · {meta.org} · {meta.period}
          </p>
          <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.05] tracking-tight text-balance sm:text-5xl">
            {meta.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-2">{meta.summary}</p>
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
        </header>

        <div className="prose-ledger mt-12">
          <Body />
        </div>

        <nav aria-label="Next case study" className="mt-20 border-t border-rule pt-8">
          <p className="num text-xs tracking-[0.18em] text-ink-3 uppercase">Next case study</p>
          <Link href={`/work/${next.slug}`} transitionTypes={["nav-forward"]} className="mt-2 block font-serif text-2xl tracking-tight hover:text-accent">
            {next.title} →
          </Link>
        </nav>
      </article>
    </PageTransition>
  );
}
