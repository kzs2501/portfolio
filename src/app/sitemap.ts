import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { work } from "@/content/work";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";
import { pagePath, routes } from "@/lib/routes";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Each page's own address, with its trailing slash, not a redirect to it.
  const url = (path: string) => new URL(pagePath(path), site.url).toString();
  return [
    { url: url(routes.home()), priority: 1 },
    { url: url(routes.about()), priority: 0.6 },
    { url: url(routes.notes()), priority: 0.6 },
    ...work.map((w) => ({ url: url(routes.work(w.slug)), priority: 0.9 })),
    ...projects.map((p) => ({ url: url(routes.project(p.slug)), priority: 0.9 })),
    ...notes.map((n) => ({ url: url(routes.note(n.slug)), lastModified: n.date, priority: 0.7 })),
  ];
}
