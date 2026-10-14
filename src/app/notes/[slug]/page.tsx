import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { notes, findNote, formatDate } from "@/content/notes";
import { PageTransition } from "@/components/page-transition";
import { ReadingProgress } from "@/components/reading-progress";
import { loadMdxBody } from "@/app/_lib/load-mdx";

export const dynamicParams = false;

export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const meta = findNote((await params).slug);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.summary,
    openGraph: { title: meta.title, description: meta.summary, type: "article", publishedTime: meta.date },
  };
}

export default async function Note({ params }: PageProps<"/notes/[slug]">) {
  const { slug } = await params;
  const meta = findNote(slug);
  if (!meta) notFound();
  const Body = await loadMdxBody("notes", slug);

  return (
    <PageTransition>
      <ReadingProgress />
      <article className="mx-auto max-w-2xl px-5 pt-14 sm:px-8">
        <Link
          href="/notes"
          transitionTypes={["nav-back"]}
          className="-mx-1 inline-flex min-h-8 items-center px-1 text-sm text-ink-3 hover:text-ink"
        >
          ← All notes
        </Link>
        <header className="mt-10">
          <p className="num text-xs tracking-[0.18em] text-ink-3 uppercase">
            Note · <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          </p>
          <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.05] tracking-tight text-balance sm:text-5xl">
            {meta.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-pretty text-ink-2">{meta.summary}</p>
        </header>
        <div className="prose-ledger mt-12">
          <Body />
        </div>
      </article>
    </PageTransition>
  );
}
