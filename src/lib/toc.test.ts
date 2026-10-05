import { readFileSync } from "node:fs";
import { join } from "node:path";
import GithubSlugger from "github-slugger";
import { describe, expect, it } from "vitest";
import { work } from "@/content/work";
import { extractToc } from "./toc";

describe("table of contents", () => {
  it("lists level-2 headings with github-style ids", () => {
    const toc = extractToc("intro\n\n## The problem\n\ntext\n\n## The key decision: a registry, not a flow\n");
    expect(toc).toEqual([
      { id: "the-problem", title: "The problem" },
      { id: "the-key-decision-a-registry-not-a-flow", title: "The key decision: a registry, not a flow" },
    ]);
  });

  it("skips headings inside fenced code", () => {
    const toc = extractToc("## Real\n\n```md\n## Not a heading\n```\n\n## Also real\n");
    expect(toc.map((t) => t.title)).toEqual(["Real", "Also real"]);
  });

  it("numbers duplicates exactly like rehype-slug, counting h3s too", () => {
    const toc = extractToc("### Result\n\n## Result\n\n## Result\n");
    expect(toc.map((t) => t.id)).toEqual(["result-1", "result-2"]);
  });

  it("strips inline markdown and shows curly apostrophes", () => {
    expect(extractToc("## What I'd do `next`\n")[0]).toEqual({ id: "what-id-do-next", title: "What I’d do next" });
  });

  it("produces one entry per heading in every real case study", () => {
    for (const w of work) {
      const source = readFileSync(join(process.cwd(), "src/content/work", `${w.slug}.mdx`), "utf8");
      const toc = extractToc(source);
      expect(toc.length).toBeGreaterThan(4);
      const slugger = new GithubSlugger();
      expect(toc.map((t) => t.id)).toEqual(toc.map((t) => slugger.slug(t.title.replace(/’/g, "'"))));
    }
  });
});
