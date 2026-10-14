import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, findProject } from "@/content/projects";
import { Ledger } from "@/components/ledger";
import { PageTransition } from "@/components/page-transition";
import { ReadingProgress } from "@/components/reading-progress";
import { loadMdxBody } from "@/app/_lib/load-mdx";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const meta = findProject((await params).slug);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.summary,
    openGraph: { title: meta.title, description: meta.summary, type: "article" },
  };
}

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default async function Project({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const meta = findProject(slug);
  if (!meta) notFound();
  const Body = await loadMdxBody("projects", slug);

  return (
    <PageTransition>
      <ReadingProgress />
      <article className="mx-auto max-w-2xl px-5 pt-14 sm:px-8">
        <Link
          href="/#projects"
          transitionTypes={["nav-back"]}
          className="-mx-1 inline-flex min-h-8 items-center px-1 text-sm text-ink-3 hover:text-ink"
        >
          ← All projects
        </Link>
        <header className="mt-10">
          <p className="num text-xs tracking-[0.18em] text-ink-3 uppercase">Project · {meta.period}</p>
          <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.05] tracking-tight text-balance sm:text-5xl">
            {meta.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-pretty text-ink-2">{meta.summary}</p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <a
              href={meta.demoUrl}
              {...external}
              className="press rounded-full bg-ink px-5 py-2.5 text-paper hover:opacity-85"
            >
              Try the live demo <span aria-hidden="true">↗</span>
            </a>
            <a
              href={meta.sourceUrl}
              {...external}
              className="press rounded-full border border-rule px-5 py-2.5 text-ink hover:bg-surface-2"
            >
              Read the source <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="mt-8 rounded-lg border border-rule bg-surface px-5 py-4">
            <Ledger
              caption="Project facts"
              rows={[
                { label: "What", value: "Personal project, built from scratch" },
                { label: "Highlight", value: meta.highlight },
                { label: "Stack", value: meta.stack.join(", ") },
              ]}
            />
          </div>
        </header>
        <div className="prose-ledger mt-12">
          <Body />
        </div>
      </article>
    </PageTransition>
  );
}
