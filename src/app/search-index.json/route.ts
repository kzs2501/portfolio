import { searchIndex } from "@/app/_lib/search-index";

export const dynamic = "force-static";

/** The writing, section by section, for the ⌘K palette: built with the site, fetched when the palette is used. */
export function GET() {
  return Response.json(searchIndex());
}
