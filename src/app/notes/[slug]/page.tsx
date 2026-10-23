import { notFound } from "next/navigation";
import { notes, findNote, formatDate } from "@/content/notes";
import { ArticleHeader } from "@/components/article-header";
import { BackLink } from "@/components/back-link";
import { PageTransition } from "@/components/page-transition";
import { ReadingProgress } from "@/components/reading-progress";
import { routes } from "@/lib/routes";
import { articleMetadata, toSlugParams } from "@/app/_lib/content-page";
import { loadMdxBody } from "@/app/_lib/load-mdx";

export const dynamicParams = false;

export const generateStaticParams = () => toSlugParams(notes);

export async function generateMetadata({ params }: PageProps<"/notes/[slug]">) {
  const { slug } = await params;
  const meta = findNote(slug);
  return articleMetadata(meta, routes.note(slug), meta ? { publishedTime: meta.date } : {});
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
        <BackLink href={routes.notes()}>All notes</BackLink>
        <ArticleHeader
          eyebrow={
            <>
              Note · <time dateTime={meta.date}>{formatDate(meta.date)}</time>
            </>
          }
          title={meta.title}
          summary={meta.summary}
        />
        <div className="prose-ledger mt-12">
          <Body />
        </div>
      </article>
    </PageTransition>
  );
}
