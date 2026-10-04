import { renderOg, ogSize } from "@/lib/og";
import { notes, getNote } from "@/content/notes";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Note";

export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const meta = getNote((await params).slug)!;
  return renderOg({ kicker: "Note", title: meta.title });
}
