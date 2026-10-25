// @vitest-environment node
/**
 * Every page is a folder's index.html (`trailingSlash`), so its address ends in a slash
 * and the one without redirects to it. What the site hands crawlers and feed readers is
 * the address itself, never a redirect.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
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

/** Every route that generates an image (Open Graph cards, the Apple icon), as a sample URL path. */
function imageRoutes(dir = "src/app", path = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      // A dynamic segment stands for any value; a route group adds nothing to the path.
      const segment = entry.name.startsWith("(") ? "" : `/${entry.name.replace(/^\[.*\]$/, "any")}`;
      return imageRoutes(join(dir, entry.name), path + segment);
    }
    const route = /^(opengraph-image|apple-icon)\.tsx$/.exec(entry.name)?.[1];
    return route ? [`${path}/${route}`] : [];
  });
}

describe("images for crawlers", () => {
  // The static export writes these images without an extension, so the host can't tell
  // they're PNGs; and LinkedIn, X and Slack show no preview for an image that isn't
  // labelled as one. vercel.json labels them, at both addresses (with and without the
  // trailing slash the host redirects to).
  it("labels every generated image a PNG, wherever the host serves it", () => {
    const config = JSON.parse(readFileSync("vercel.json", "utf8")) as {
      headers: { source: string; headers: { key: string; value: string }[] }[];
    };
    const pngRules = config.headers
      .filter((rule) => rule.headers.some(({ key, value }) => key === "Content-Type" && value === "image/png"))
      .map((rule) => new RegExp(`^${rule.source.replaceAll("(.*)", ".*")}$`));
    const routes = imageRoutes();
    expect(routes).toContain("/opengraph-image");
    expect(routes).toContain("/work/any/opengraph-image");
    for (const route of routes) {
      for (const address of [route, `${route}/`]) {
        expect(
          pngRules.some((rule) => rule.test(address)),
          address,
        ).toBe(true);
      }
    }
  });
});
