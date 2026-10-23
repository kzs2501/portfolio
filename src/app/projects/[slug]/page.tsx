import { notFound } from "next/navigation";
import { projects, findProject } from "@/content/projects";
import { ArticleHeader } from "@/components/article-header";
import { BackLink } from "@/components/back-link";
import { FactsPanel } from "@/components/ledger";
import { PageTransition } from "@/components/page-transition";
import { PillLink } from "@/components/pill-link";
import { ReadingProgress } from "@/components/reading-progress";
import { routes } from "@/lib/routes";
import { articleMetadata, toSlugParams } from "@/app/_lib/content-page";
import { loadMdxBody } from "@/app/_lib/load-mdx";

export const dynamicParams = false;

export const generateStaticParams = () => toSlugParams(projects);

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  return articleMetadata(findProject(slug), routes.project(slug));
}

export default async function Project({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const meta = findProject(slug);
  if (!meta) notFound();
  const Body = await loadMdxBody("projects", slug);

  return (
    <PageTransition>
      <ReadingProgress />
      <article className="mx-auto max-w-2xl px-5 pt-14 sm:px-8">
        <BackLink href={routes.homeSection("projects")}>All projects</BackLink>
        <ArticleHeader eyebrow={`Project · ${meta.period}`} title={meta.title} summary={meta.summary}>
          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <PillLink href={meta.demoUrl} isExternal>
              Try the live demo
            </PillLink>
            <PillLink href={meta.sourceUrl} isExternal variant="secondary">
              Read the source
            </PillLink>
          </div>
          <FactsPanel
            rows={[
              { label: "What", value: "Personal project, built from scratch" },
              { label: "Highlight", value: meta.highlight },
              { label: "Stack", value: meta.stack.join(", ") },
            ]}
          />
        </ArticleHeader>
        <div className="prose-ledger mt-12">
          <Body />
        </div>
      </article>
    </PageTransition>
  );
}
