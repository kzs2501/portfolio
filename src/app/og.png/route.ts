import { site } from "@/content/site";
import { renderOg } from "@/lib/og";

export const dynamic = "force-static";

/** The link-preview card for every page that hasn't one of its own. */
export function GET() {
  return renderOg({ kicker: "Portfolio", title: site.focus });
}
