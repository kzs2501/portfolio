import { toSlugParams } from "@/app/_lib/content-page";
import { projects, getProject } from "@/content/projects";
import { renderOg } from "@/lib/og";

export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = () => toSlugParams(projects);

export async function GET(request: Request, { params }: RouteContext<"/projects/[slug]/og.png">) {
  const meta = getProject((await params).slug);
  return renderOg({ kicker: `Project · ${meta.period}`, title: `${meta.title}: ${meta.tagline}` });
}
