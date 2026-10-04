import { renderOg, ogSize } from "@/lib/og";
import { work, getWork } from "@/content/work";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Case study";

export function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const meta = getWork((await params).slug)!;
  return renderOg({ kicker: `Case study · ${meta.org} · ${meta.period}`, title: meta.title });
}
