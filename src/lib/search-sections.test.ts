import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { plainText, sectionsOf } from "./search-sections";
import { extractToc } from "./toc";

const CONTENT = join(process.cwd(), "src/content");
const everyMdx = ["work", "notes", "projects"].flatMap((collection) =>
  readdirSync(join(CONTENT, collection))
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readFileSync(join(CONTENT, collection, file), "utf8")),
);

describe("the writing, as sections", () => {
  it("starts with the introduction, then one section per level-2 heading", () => {
    expect(sectionsOf("Why this matters.\n\n## The race\n\nSlow first.\n\n## The fix\n\nIgnore it.\n")).toEqual([
      { id: null, title: null, text: "Why this matters." },
      { id: "the-race", title: "The race", text: "Slow first." },
      { id: "the-fix", title: "The fix", text: "Ignore it." },
    ]);
  });

  it("leaves out an empty introduction, but keeps an empty section, since its heading is findable", () => {
    expect(sectionsOf("## Only\n")).toEqual([{ id: "only", title: "Only", text: "" }]);
  });

  it("gives every section the id its page renders, duplicates included", () => {
    for (const source of everyMdx) {
      const ids = sectionsOf(source).flatMap((section) => (section.id ? [section.id] : []));
      expect(ids).toEqual(extractToc(source).map((item) => item.id));
    }
    const duplicates = "### Result\n\n## Result\n\n## Result\n";
    expect(sectionsOf(duplicates).map((section) => section.id)).toEqual([null, "result-1", "result-2"]);
  });

  it("leaves fenced code out, and keeps a heading inside it from starting a section", () => {
    expect(sectionsOf("## Real\n\nWords.\n\n```ts\n## not a heading\nconst x = 1;\n```\n\nMore.\n")).toEqual([
      { id: "real", title: "Real", text: "Words. More." },
    ]);
  });
});

describe("the text a reader sees", () => {
  it("keeps links' and emphasis's words, and inline code's text", () => {
    expect(plainText("See [the fix](/notes/x) and **why** it _works_ with `AbortController`.")).toBe(
      "See the fix and why it works with AbortController.",
    );
  });

  it("keeps a snake_case word whole", () => {
    expect(plainText("The column is_paid stays.")).toBe("The column is_paid stays.");
  });

  it("keeps a component's caption and title, and nothing else of it", () => {
    expect(
      plainText(
        '<Figure caption="Toggle the guard and replay.">\n  <Demo name="race-timeline" title="Debounce vs. the race" minHeight={600} />\n</Figure>',
      ),
    ).toBe("Toggle the guard and replay. Debounce vs. the race");
  });

  it("keeps an image's alt text, as a screen reader reads it", () => {
    expect(plainText('Before. <img src="/a.webp" width={1280} alt="The chaos panel, open" /> After.')).toBe(
      "Before. The chaos panel, open After.",
    );
  });

  it("drops list markers and quote marks, and curls quotes as the page does", () => {
    expect(plainText('- one\n2. two\n> I\'d say "never"...')).toBe("one two I’d say “never”…");
  });

  it("leaves no markup in the real writing", () => {
    for (const source of everyMdx) {
      for (const { text } of sectionsOf(source)) {
        expect(text).not.toMatch(/<[A-Za-z/]|\]\(|```|\*\*|^#+ /u);
      }
    }
  });
});
