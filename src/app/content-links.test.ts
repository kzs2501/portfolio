import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";
import { work } from "@/content/work";
import { pagePath, routes } from "@/lib/routes";
import { readSource } from "@/lib/toc";

/** Every case study, project and note, with its MDX source. */
const writing = [
  ...work.map((entry) => ({ collection: "work", page: routes.work(entry.slug), slug: entry.slug })),
  ...projects.map((entry) => ({ collection: "projects", page: routes.project(entry.slug), slug: entry.slug })),
  ...notes.map((entry) => ({ collection: "notes", page: routes.note(entry.slug), slug: entry.slug })),
].map((entry) => ({
  ...entry,
  source: readFileSync(join(process.cwd(), "src/content", entry.collection, `${entry.slug}.mdx`), "utf8"),
}));

/** The pages the site serves, at the addresses it serves them from. */
const PAGES = new Map<string, Set<string>>([
  [pagePath(routes.home()), new Set()],
  [pagePath(routes.notes()), new Set()],
  [pagePath(routes.about()), new Set()],
  ...writing.map(({ page, source }): [string, Set<string>] => [
    pagePath(page),
    new Set(readSource(source).flatMap((line) => (line.kind === "heading" ? [line.id] : []))),
  ]),
]);

/**
 * Links in the prose (not in code): markdown's `[text](href)` and a tag's `href="…"`. Read
 * from the prose as a whole, since a link's text can wrap onto the next line.
 */
const links = writing.flatMap(({ collection, slug, source }) => {
  const prose = readSource(source)
    .map((line) => (line.kind === "text" ? line.text : ""))
    .join("\n");
  return [...prose.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)\)|\bhref="([^"]+)"/gu)].map(([, markdown, tag]) => ({
    from: `${collection}/${slug}`,
    href: markdown ?? tag ?? "",
  }));
});
const internal = links.filter(({ href }) => href.startsWith("/") && !href.startsWith("//"));

describe("links in the writing", () => {
  it("are found, so the checks below check something", () => {
    expect(internal.length).toBeGreaterThanOrEqual(22);
  });

  it("point at a page the site serves, or a file it publishes", () => {
    const broken = internal.filter(({ href }) => {
      const path = href.split("#")[0] ?? "";
      return !PAGES.has(pagePath(path)) && !existsSync(join(process.cwd(), "public", path));
    });
    expect(broken).toEqual([]);
  });

  it("use the address the site serves, with its trailing slash, so a click costs no redirect", () => {
    const redirected = internal.filter(({ href }) => {
      const path = href.split("#")[0] ?? "";
      return !/\.\w+$/u.test(path) && path !== pagePath(path);
    });
    expect(redirected).toEqual([]);
  });

  it("land on a heading that's there, when they name one", () => {
    const missing = internal.filter(({ href }) => {
      const [path = "", id] = href.split("#");
      return id !== undefined && !PAGES.get(pagePath(path))?.has(id);
    });
    expect(missing).toEqual([]);
  });
});
