import { describe, expect, it } from "vitest";
import { deepLink, reconcileCurrent, registry, resolveStages } from "./registry";

const ids = (rail: Parameters<typeof resolveStages>[0]["rail"], guest = false) =>
  resolveStages({ rail, guest }).map((s) => s.id);

describe("stage registry", () => {
  it("builds each rail's flow from the same registry", () => {
    expect(ids("card")).toEqual(["amount", "rail", "card", "frequency", "review", "processing", "receipt"]);
    expect(ids("crypto")).toEqual(["amount", "rail", "source", "network", "review", "processing", "receipt"]);
    expect(ids("stock")).toContain("authorization");
    expect(ids("fund")).toEqual(["amount", "rail", "fund", "review", "processing", "receipt"]);
  });

  it("adds guest details only for guests, in registry order", () => {
    expect(ids("card", true).slice(0, 3)).toEqual(["amount", "rail", "details"]);
    expect(ids("card", false)).not.toContain("details");
  });

  it("never lets one rail's stages leak into another", () => {
    expect(ids("fund")).not.toContain("card");
    expect(ids("card")).not.toContain("network");
  });

  it("keeps the user on their stage when it survives a context change", () => {
    const next = resolveStages({ rail: "crypto", guest: false });
    expect(reconcileCurrent("review", 4, next)).toBe("review");
  });

  it("lands on the same position when the current stage disappears", () => {
    const next = resolveStages({ rail: "crypto", guest: false });
    // Was on "frequency" (card only, index 3) → now index 3 is "network".
    expect(reconcileCurrent("frequency", 3, next)).toBe("network");
  });

  it("clamps to the last stage rather than running off the end", () => {
    const next = resolveStages({ rail: "fund", guest: false });
    expect(reconcileCurrent("authorization", 99, next)).toBe("receipt");
  });

  it("encodes the position in a shareable deep link", () => {
    expect(deepLink({ rail: "stock", guest: true }, "shares")).toBe("/give?rail=stock&guest=1&step=shares");
  });

  it("has unique stage ids", () => {
    expect(new Set(registry.map((s) => s.id)).size).toBe(registry.length);
  });
});
