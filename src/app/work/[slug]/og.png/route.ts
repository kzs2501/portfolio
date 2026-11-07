import { toSlugParams } from "@/app/_lib/content-page";
import { work, getWork } from "@/content/work";
import { renderOg } from "@/lib/og";

export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = () => toSlugParams(work);

export async function GET(request: Request, { params }: RouteContext<"/work/[slug]/og.png">) {
  const meta = getWork((await params).slug);
  return renderOg({ kicker: `Case study · ${meta.org} · ${meta.period}`, title: meta.title });
}
