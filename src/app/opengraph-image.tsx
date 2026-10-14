import { site } from "@/content/site";
import { renderOg, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = "image/png";
export const alt = site.title;

export default function Image() {
  return renderOg({
    kicker: "Portfolio",
    title: site.focus,
  });
}
