import { describe, expect, it } from "vitest";
import { buildRace, resultsFor } from "./race";

describe("typeahead race timeline", () => {
  it("debounces three keystrokes into two requests", () => {
    expect(buildRace(false).requests.map((r) => r.query)).toEqual(["BT", "BTC"]);
  });

  it("returns the newer request before the older one", () => {
    const [bt, btc] = buildRace(false).requests;
    expect(btc.returnsAt).toBeLessThan(bt.returnsAt);
  });

  it("shows stale results at the end without a guard", () => {
    const race = buildRace(false);
    const { input, screen } = race.screenAt(race.duration);
    expect(input).toBe("BTC");
    expect(screen).toEqual({ kind: "results", query: "BT", stale: true });
  });

  it("keeps the latest results at the end with a guard", () => {
    const race = buildRace(true);
    expect(race.screenAt(race.duration).screen).toEqual({ kind: "results", query: "BTC", stale: false });
  });

  it("shows correct results in the window between the two responses, either way", () => {
    for (const guard of [true, false]) {
      const race = buildRace(guard);
      const [bt, btc] = race.requests;
      const between = (btc.returnsAt + bt.returnsAt) / 2;
      expect(race.screenAt(between).screen).toMatchObject({ kind: "results", query: "BTC" });
    }
  });

  it("marks the late response as dropped with a guard, stale without", () => {
    const kind = (guard: boolean) => buildRace(guard).markers.find((m) => m.lane === "req-BT")!.kind;
    expect(kind(false)).toBe("stale");
    expect(kind(true)).toBe("dropped");
  });

  it("is idle before anything is sent", () => {
    expect(buildRace(true).screenAt(0.1).screen).toEqual({ kind: "idle" });
  });

  it("filters the mock pairs by prefix", () => {
    expect(resultsFor("BTC")).toEqual(["BTC-INR", "BTC-USDT"]);
    expect(resultsFor("BT").length).toBeGreaterThan(resultsFor("BTC").length);
  });
});
