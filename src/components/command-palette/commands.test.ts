import { describe, expect, it } from "vitest";
import { COMMANDS, filterCommands, orderResults, score, type Command } from "./commands";

describe("palette ranking", () => {
  it("returns everything for an empty query", () => {
    expect(filterCommands("   ")).toHaveLength(COMMANDS.length);
  });

  it("prefers a match at a word start over one mid-word", () => {
    expect(score("rail", "Four payment rails") ?? 0).toBeGreaterThan(score("rail", "Guardrails") ?? 0);
  });

  it("prefers a contiguous match over a scattered one", () => {
    expect(score("note", "Notes") ?? 0).toBeGreaterThan(score("nts", "Notes") ?? 0);
  });

  it("matches subsequences, and rejects non-matches", () => {
    expect(score("chptl", "charity portal")).not.toBeNull();
    expect(score("xyz", "charity portal")).toBeNull();
  });

  it("finds case studies by title and by stack keywords", () => {
    expect(filterCommands("portal")[0]?.id).toBe("work-charity-portal");
    expect(filterCommands("redux").map((c) => c.id)).toContain("work-multi-brand-checkout");
  });

  it("finds actions by synonym", () => {
    expect(filterCommands("dark")[0]?.id).toBe("theme");
    expect(filterCommands("cv").map((c) => c.id)).toContain("resume");
  });

  it("has unique command ids", () => {
    expect(new Set(COMMANDS.map((command) => command.id)).size).toBe(COMMANDS.length);
  });
});

describe("titles and the writing, in one list (PF-01)", () => {
  const section: Command = {
    id: "writing-notes/redirect-races-the-webhook#idempotency",
    group: "In the writing",
    label: "The same idea on the way in: idempotency keys",
    action: { type: "navigate", href: "/notes/redirect-races-the-webhook/#idempotency" as never },
  };

  it("puts the writing ahead of titles that only match letter by letter", () => {
    const results = orderResults("idem", [section]);
    expect(results[0]).toBe(section);
    // The scattered title matches still come, after it.
    expect(results.slice(1).map((command) => command.id)).toEqual(filterCommands("idem").map((command) => command.id));
  });

  it("keeps a title that really matches ahead of the writing", () => {
    const results = orderResults("portal", [section]);
    expect(results[0]?.id).toBe("work-charity-portal");
    expect(results.at(-1)).toBe(section);
  });

  it("lists every command for an empty query, and no writing", () => {
    expect(orderResults("  ", [])).toHaveLength(COMMANDS.length);
  });
});

describe("a page listed once, by its title or its introduction (PF-05)", () => {
  const TITLE_ID = "note-load-sdks-on-mount";
  const title = COMMANDS.find((command) => command.id === TITLE_ID);
  if (!title) throw new Error(`${TITLE_ID} is a command`);
  const intro: Command = {
    id: "writing-notes/load-sdks-on-mount",
    group: "In the writing",
    label: title.label,
    hint: "Note",
    excerpt: [{ text: "…the SDK loads when the component that needs it mounts…", isMatch: false }],
    action: title.action,
  };
  const section: Command = {
    id: "writing-notes/load-sdks-on-mount#the-race",
    group: "In the writing",
    label: "The race",
    hint: title.label,
    action: { type: "navigate", href: "/notes/load-sdks-on-mount/#the-race" as never },
  };
  const ofThePage = (results: readonly Command[]) =>
    results
      .filter((command) => command.id === TITLE_ID || command.id.startsWith("writing-"))
      .map((command) => command.id);

  it("drops the introduction when the title already matches, and keeps its sections", () => {
    expect(ofThePage(orderResults("third-party", [intro, section]))).toEqual([TITLE_ID, section.id]);
  });

  it("keeps the introduction, in place of a title that only matches letter by letter", () => {
    expect(ofThePage(orderResults("idem", [intro]))).toEqual([intro.id]);
  });
});
