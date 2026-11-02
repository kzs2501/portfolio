// @vitest-environment node
/**
 * Every relative link in the README reaches a file that exists, spelled exactly so (GitHub's
 * links are case-sensitive; a Mac's disk isn't), and every anchor a heading that exists.
 * The README's tour is links to source files, so a file that moves fails here first.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { describe, expect, it } from "vitest";

const DOCUMENTS = ["README.md", "SECURITY.md"];

const withoutCodeBlocks = (markdown: string) => markdown.replace(/```[\s\S]*?```/g, "");

function anchorsOf(markdown: string): Set<string> {
  const slugger = new GithubSlugger();
  return new Set(
    [...withoutCodeBlocks(markdown).matchAll(/^#{1,6} (.+)$/gm)].map(([, heading = ""]) => slugger.slug(heading)),
  );
}

function existsExactly(file: string): boolean {
  // A folder's link may end in a slash: that last, empty segment is no part of the name.
  const segments = path.normalize(file).split(path.sep).filter(Boolean);
  return segments.every((segment, i) => {
    const parent = segments.slice(0, i).join(path.sep) || ".";
    return existsSync(parent) && readdirSync(parent).includes(segment);
  });
}

/** The targets of a document's links and images, leaving out web and email addresses. */
function relativeLinksIn(markdown: string): string[] {
  return [...withoutCodeBlocks(markdown).matchAll(/\]\(([^)\s]+)\)/g)]
    .map(([, target = ""]) => target)
    .filter((target) => !/^(https?:|mailto:)/.test(target));
}

describe("links in the README", () => {
  it("finds the links to check", () => {
    expect(relativeLinksIn(readFileSync("README.md", "utf8")).length).toBeGreaterThan(15);
  });

  it.each(DOCUMENTS)("%s links only to files and headings that exist", (document) => {
    const broken = relativeLinksIn(readFileSync(document, "utf8")).filter((link) => {
      const [target = "", anchor] = decodeURIComponent(link).split("#");
      const file = target === "" ? document : path.join(path.dirname(document), target);
      if (!existsExactly(file)) return true;
      return anchor !== undefined && file.endsWith(".md") && !anchorsOf(readFileSync(file, "utf8")).has(anchor);
    });
    expect(broken).toEqual([]);
  });
});
