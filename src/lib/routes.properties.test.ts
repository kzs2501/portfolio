/**
 * Properties of telling the site's own pages from everything else, over any href: what
 * the November bug hunt checked, kept.
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { isSitePage, pagePath } from "./routes";

describe("a link, whatever its href", () => {
  it("is a site page only if its path starts with one slash, and never throws", () => {
    const href = fc.oneof(
      fc.string({ maxLength: 60 }),
      fc.webUrl(),
      fc.constantFrom("/", "//x", "/a.b/c", "/notes/x/#y", "/#", "/?q=1", "/notes/rss.xml?x", "/résumé.pdf"),
    );
    fc.assert(
      fc.property(href, (link) => {
        if (isSitePage(link)) expect(link.startsWith("/") && !link.startsWith("//")).toBe(true);
        expect(() => pagePath(link)).not.toThrow();
      }),
      { numRuns: 2_000 },
    );
  });
});
