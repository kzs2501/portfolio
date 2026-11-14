import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";
import { work } from "@/content/work";
import { extractToc } from "@/lib/toc";
import { searchIndex } from "./search-index";

const index = searchIndex();
const pages = [
  ...work.map((entry) => ({ collection: "work", ...entry })),
  ...projects.map((entry) => ({ collection: "projects", ...entry })),
  ...notes.map((entry) => ({ collection: "notes", ...entry })),
];
const sourceOf = (collection: string, slug: string) =>
  readFileSync(join(process.cwd(), "src/content", collection, `${slug}.mdx`), "utf8");

describe("the index of the writing", () => {
  it("has each page's introduction, then each of its sections", () => {
    for (const { collection, slug, title } of pages) {
      const entries = index.filter((entry) => entry.page === title);
      expect(entries.map((entry) => entry.section)).toEqual([
        null,
        ...extractToc(sourceOf(collection, slug)).map((item) => item.title),
      ]);
    }
    expect(index).toHaveLength(
      pages.length + pages.flatMap(({ collection, slug }) => extractToc(sourceOf(collection, slug))).length,
    );
  });

  it("opens an introduction with the page's summary", () => {
    const debounce = index.find((entry) => entry.id === "notes/debounce-is-not-a-race-guard");
    expect(
      debounce?.text.startsWith(notes.find((note) => note.slug === "debounce-is-not-a-race-guard")?.summary ?? "?"),
    ).toBe(true);
  });

  it("links each section to its heading on its page", () => {
    expect(index.find((entry) => entry.id === "notes/debounce-is-not-a-race-guard#the-race")).toMatchObject({
      href: "/notes/debounce-is-not-a-race-guard/#the-race",
      page: notes.find((note) => note.slug === "debounce-is-not-a-race-guard")?.title,
      kind: "Note",
      section: "The race",
    });
    expect(index.find((entry) => entry.id === "work/charity-portal")).toMatchObject({
      href: "/work/charity-portal",
      kind: "Case study",
    });
  });

  it("gives every entry its own id", () => {
    expect(new Set(index.map((entry) => entry.id)).size).toBe(index.length);
  });
});
