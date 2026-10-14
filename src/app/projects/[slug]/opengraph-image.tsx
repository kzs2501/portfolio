import { renderOg, ogSize } from "@/lib/og";
import { toSlugParams } from "@/app/_lib/content-page";
import { projects, getProject } from "@/content/projects";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Project";

export const generateStaticParams = () => toSlugParams(projects);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const meta = getProject((await params).slug);
  return renderOg({ kicker: `Project · ${meta.period}`, title: `${meta.title}: ${meta.tagline}` });
}
