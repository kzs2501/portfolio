import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { work } from "@/content/work";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, site.url).toString();
  return [
    { url: url("/"), priority: 1 },
    { url: url("/about"), priority: 0.6 },
    { url: url("/notes"), priority: 0.6 },
    ...work.map((w) => ({ url: url(`/work/${w.slug}`), priority: 0.9 })),
    ...projects.map((p) => ({ url: url(`/projects/${p.slug}`), priority: 0.9 })),
    ...notes.map((n) => ({ url: url(`/notes/${n.slug}`), lastModified: n.date, priority: 0.7 })),
  ];
}
