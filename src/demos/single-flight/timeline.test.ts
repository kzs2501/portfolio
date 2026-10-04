import { describe, expect, it } from "vitest";
import { buildTimeline } from "./timeline";

describe("single-flight refresh timeline", () => {
  it("makes exactly one refresh call no matter how many requests 401", () => {
    for (const n of [1, 3, 5, 8]) {
      expect(buildTimeline("single-flight", n).summary.refreshCalls).toBe(1);
    }
  });

  it("lets every request succeed after the shared refresh", () => {
    const { summary, markers } = buildTimeline("single-flight", 5);
    expect(summary).toMatchObject({ succeeded: 5, failed: 0, sessionRevoked: false });
    expect(markers.filter((m) => m.kind === "ok")).toHaveLength(5);
  });

  it("never retries a request before the shared refresh has finished", () => {
    const { segments } = buildTimeline("single-flight", 5);
    const refresh = segments.find((s) => s.lane === "shared" && s.kind === "refresh")!;
    for (const retry of segments.filter((s) => s.kind === "retry")) {
      expect(retry.start).toBeGreaterThanOrEqual(refresh.end);
    }
  });

  it("starts one refresh per 401 in naive mode", () => {
    expect(buildTimeline("naive", 5).summary.refreshCalls).toBe(5);
  });

  it("gets the session revoked in naive mode once a spent refresh token is replayed", () => {
    expect(buildTimeline("naive", 5).summary).toMatchObject({ succeeded: 1, failed: 4, sessionRevoked: true });
  });

  it("is harmless in naive mode with a single request", () => {
    expect(buildTimeline("naive", 1).summary).toMatchObject({ succeeded: 1, sessionRevoked: false });
  });

  it("puts every segment on a known lane, with positive length", () => {
    for (const mode of ["naive", "single-flight"] as const) {
      const t = buildTimeline(mode, 5);
      const laneIds = new Set(t.lanes.map((l) => l.id));
      for (const s of t.segments) {
        expect(laneIds.has(s.lane)).toBe(true);
        expect(s.end).toBeGreaterThan(s.start);
      }
    }
  });
});
