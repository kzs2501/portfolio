import { describe, expect, it } from "vitest";
import { commands, filterCommands, score } from "./commands";

describe("palette ranking", () => {
  it("returns everything for an empty query", () => {
    expect(filterCommands("   ")).toHaveLength(commands.length);
  });

  it("prefers a match at a word start over one mid-word", () => {
    expect(score("rail", "Four payment rails")!).toBeGreaterThan(score("rail", "Guardrails")!);
  });

  it("prefers a contiguous match over a scattered one", () => {
    expect(score("note", "Notes")!).toBeGreaterThan(score("nts", "Notes")!);
  });

  it("matches subsequences, and rejects non-matches", () => {
    expect(score("chptl", "charity portal")).not.toBeNull();
    expect(score("xyz", "charity portal")).toBeNull();
  });

  it("finds case studies by title and by stack keywords", () => {
    expect(filterCommands("portal")[0].id).toBe("work-charity-portal");
    expect(filterCommands("redux").map((c) => c.id)).toContain("work-multi-brand-checkout");
  });

  it("finds actions by synonym", () => {
    expect(filterCommands("dark")[0].id).toBe("theme");
    expect(filterCommands("cv").map((c) => c.id)).toContain("resume");
  });

  it("has unique command ids", () => {
    expect(new Set(commands.map((c) => c.id)).size).toBe(commands.length);
  });
});
