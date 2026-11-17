import { describe, expect, it } from "vitest";
import { isSitePage } from "./routes";

describe("a link to one of the site's pages", () => {
  it.each([
    "/",
    "/notes/",
    "/projects/dresscircle/",
    "/notes/load-sdks-on-mount",
    "/#work",
    "/notes/x/#the-race",
    // A dot in the query or the fragment isn't a file's extension (PF-04).
    "/notes/?q=a.b",
    "/notes/x/?v=1.2",
    "/notes/x/#v1.2",
  ])("is %s", (href) => {
    expect(isSitePage(href)).toBe(true);
  });

  it.each([
    "#the-race",
    "https://dresscircle.vercel.app",
    "//example.com/notes/",
    "mailto:someone@example.com",
    "/resume.pdf",
    "/notes/rss.xml",
    "/notes/rss.xml?x=1",
    "/resume.pdf#page=2",
    "",
  ])("isn't %j", (href) => {
    expect(isSitePage(href)).toBe(false);
  });
});
