import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { work, findWork } from "@/content/work";
import { ArticleHeader } from "@/components/article-header";
import { BackLink } from "@/components/back-link";
import { Eyebrow } from "@/components/eyebrow";
import { FactsPanel } from "@/components/ledger";
import { PageTransition } from "@/components/page-transition";
import { ReadingProgress } from "@/components/reading-progress";
import { TocInline, TocSidebar } from "@/components/toc";
import { extractToc } from "@/lib/toc";
import { routes } from "@/lib/routes";
import { articleMetadata, toSlugParams } from "@/app/_lib/content-page";
import { loadMdxBody } from "@/app/_lib/load-mdx";

export const dynamicParams = false;

export const generateStaticParams = () => toSlugParams(work);

export async function generateMetadata({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  return articleMetadata(findWork(slug), routes.work(slug));
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const meta = findWork(slug);
  if (!meta) notFound();

  const Body = await loadMdxBody("work", slug);
  // Contents are built from the MDX source at build time — static HTML, no JS needed.
  const toc = extractToc(readFileSync(join(process.cwd(), "src/content/work", `${slug}.mdx`), "utf8"));
  const index = work.findIndex((entry) => entry.slug === slug);
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
          <BackLink href={routes.homeSection("work")}>All work</BackLink>
          {/* The title shares a view-transition name with its homepage row, so it morphs
              between the two. Works because data-scroll-behavior lets Next reset scroll
              before the new snapshot. */}
          <ArticleHeader
            eyebrow={`Case study ${String(index + 1).padStart(2, "0")} · ${meta.org} · ${meta.period}`}
            title={meta.title}
            summary={meta.summary}
            titleTransitionName={`work-title-${slug}`}
          >
            <FactsPanel
              rows={[
                { label: "Role", value: meta.role },
                { label: "Team", value: meta.team },
                { label: "Company", value: `${meta.org}, ${meta.period}` },
                { label: "Stack", value: meta.stack.join(", ") },
              ]}
            />
            <TocInline items={toc} />
          </ArticleHeader>

          <div className="prose-ledger mt-12">
            <Body />
          </div>

          {next && (
            <nav aria-label="Next case study" className="mt-20 border-t border-rule pt-8">
              <Eyebrow>Next case study</Eyebrow>
              <Link
                href={routes.work(next.slug)}
                transitionTypes={["nav-forward"]}
                className="mt-2 block font-serif text-2xl tracking-tight hover:text-accent"
              >
                {next.title} →
              </Link>
            </nav>
          )}
        </article>
      </div>
    </PageTransition>
  );
}
