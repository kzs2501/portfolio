import { describe, expect, it } from "vitest";
import { isSitePage } from "./routes";

describe("a link to one of the site's pages", () => {
  it.each(["/", "/notes/", "/projects/dresscircle/", "/notes/load-sdks-on-mount", "/#work", "/notes/x/#the-race"])(
    "is %s",
    (href) => {
      expect(isSitePage(href)).toBe(true);
    },
  );

  it.each([
    "#the-race",
    "https://dresscircle.vercel.app",
    "//example.com/notes/",
    "mailto:someone@example.com",
    "/resume.pdf",
    "/notes/rss.xml",
    "",
  ])("isn't %j", (href) => {
    expect(isSitePage(href)).toBe(false);
  });
});
