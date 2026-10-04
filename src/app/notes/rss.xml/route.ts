import { site } from "@/content/site";
import { notes } from "@/content/notes";

export const dynamic = "force-static";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = notes
    .map((n) => {
      const link = new URL(`/notes/${n.slug}`, site.url).toString();
      return `<item><title>${escape(n.title)}</title><link>${link}</link><guid>${link}</guid><pubDate>${new Date(n.date).toUTCString()}</pubDate><description>${escape(n.summary)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escape(site.name)} — Notes</title><link>${site.url}</link><description>${escape(site.description)}</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
