import { renderOg, ogSize } from "@/lib/og";
import { toSlugParams } from "@/app/_lib/content-page";
import { notes, getNote } from "@/content/notes";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Note";

export const generateStaticParams = () => toSlugParams(notes);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const meta = getNote((await params).slug);
  return renderOg({ kicker: "Note", title: meta.title });
}
