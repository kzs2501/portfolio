// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isDemoName } from "./demo";

const CONTENT_DIR = join(process.cwd(), "src/content");

/** Every MDX file under src/content, with the demo names it embeds. */
function demoNamesInContent() {
  const files = readdirSync(CONTENT_DIR, { recursive: true, encoding: "utf8" }).filter((file) => file.endsWith(".mdx"));
  return files.flatMap((file) =>
    [...readFileSync(join(CONTENT_DIR, file), "utf8").matchAll(/<Demo\s[^>]*name="([^"]+)"/g)].map((match) => ({
      file,
      name: match[1] ?? "",
    })),
  );
}

describe("demos embedded in content", () => {
  it("only names demos that exist (MDX isn't type-checked, so this test is)", () => {
    const embedded = demoNamesInContent();
    expect(embedded.length).toBeGreaterThanOrEqual(4);
    expect(embedded.filter(({ name }) => !isDemoName(name))).toEqual([]);
  });
});
