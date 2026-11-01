import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { site } from "./site";
import { work } from "./work";
import { notes } from "./notes";
import { projects } from "./projects";
import { experience, education } from "./experience";

/** Every string a visitor can read, from the typed content index. */
function visibleStrings(value: unknown, path = "content"): [string, string][] {
  if (typeof value === "string") {
    // URLs, emails and dates aren't prose.
    if (/^(https?:|\/|mailto:)|@|^\d{4}-\d{2}-\d{2}$/.test(value)) return [];
    return [[path, value]];
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => visibleStrings(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => (k === "slug" ? [] : visibleStrings(v, `${path}.${k}`)));
  }
  return [];
}

describe("content typography", () => {
  const strings = visibleStrings({ site, work, projects, notes, experience, education });

  it("finds the content to check", () => {
    expect(strings.length).toBeGreaterThan(30);
  });

  it("uses curly quotes and apostrophes, never straight ones", () => {
    const offenders = strings.filter(([, s]) => /['"]/.test(s)).map(([p, s]) => `${p}: ${s}`);
    expect(offenders).toEqual([]);
  });

  it("uses a real ellipsis, never three dots", () => {
    expect(strings.filter(([, s]) => s.includes("...")).map(([p]) => p)).toEqual([]);
  });

  it("uses commas, colons and brackets, never an em dash", () => {
    expect(strings.filter(([, s]) => s.includes("—")).map(([p, s]) => `${p}: ${s}`)).toEqual([]);
  });
});

describe("article typography", () => {
  const articles = (["work", "notes", "projects"] as const).flatMap((collection) =>
    readdirSync(`src/content/${collection}`)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => [`${collection}/${file}`, readFileSync(`src/content/${collection}/${file}`, "utf8")] as const),
  );
  /** What a reader sees as text: code, fenced or inline, keeps its own punctuation. */
  const prose = (source: string) => source.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");

  it("finds the articles to check", () => {
    expect(articles.length).toBeGreaterThan(10);
  });

  // Smartypants turns "--" into an em dash, so a double hyphen counts as one.
  it("uses commas, colons and brackets, never an em dash", () => {
    const offenders = articles.flatMap(([path, source]) =>
      prose(source)
        .split("\n")
        .filter((line) => /—|--/.test(line))
        .map((line) => `${path}: ${line.trim()}`),
    );
    expect(offenders).toEqual([]);
  });
});
