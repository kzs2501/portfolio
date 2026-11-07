import { toSlugParams } from "@/app/_lib/content-page";
import { notes, getNote } from "@/content/notes";
import { renderOg } from "@/lib/og";

export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = () => toSlugParams(notes);

export async function GET(request: Request, { params }: RouteContext<"/notes/[slug]/og.png">) {
  const meta = getNote((await params).slug);
  return renderOg({ kicker: "Note", title: meta.title });
}
