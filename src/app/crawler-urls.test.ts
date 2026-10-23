// @vitest-environment node
/**
 * Every page is a folder's index.html (`trailingSlash`), so its address ends in a slash
 * and the one without redirects to it. What the site hands crawlers and feed readers is
 * the address itself, never a redirect.
 */
import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { pagePath } from "@/lib/routes";
import { GET } from "./notes/rss.xml/route";
import sitemap from "./sitemap";

const isPageAddress = (url: string) => new URL(url).pathname.endsWith("/");

describe("addresses for crawlers and feed readers", () => {
  it("lists each page in the sitemap at its own address", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.length).toBeGreaterThan(5);
    expect(urls.filter((url) => !isPageAddress(url))).toEqual([]);
    expect(urls).toContain(new URL("/about/", site.url).toString());
  });

  it("links each note in the feed at its own address", async () => {
    const xml = await GET().text();
    const links = [...xml.matchAll(/<item>.*?<link>(.*?)<\/link>/g)].map((match) => match[1] ?? "");
    expect(links.length).toBeGreaterThan(5);
    expect(links.filter((url) => !isPageAddress(url))).toEqual([]);
  });

  it("adds the slash only where it's missing", () => {
    expect(pagePath("/")).toBe("/");
    expect(pagePath("/about")).toBe("/about/");
    expect(pagePath("/notes/x/")).toBe("/notes/x/");
  });
});
