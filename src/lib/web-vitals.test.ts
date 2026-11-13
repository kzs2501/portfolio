import { describe, expect, it } from "vitest";
import desktop from "../../lighthouse/desktop.json";
import {
  arrivalOf,
  clsFrom,
  downloadedFrom,
  formatBytes,
  formatDuration,
  formatResponse,
  formatShift,
  inpFrom,
  LAB_BUDGETS,
  pathKey,
  rate,
  sinceActivation,
} from "./web-vitals";

const shift = (startTime: number, value: number, isAfterInput = false) => ({ startTime, value, isAfterInput });

describe("rating against Google's thresholds", () => {
  it.each([
    ["lcp", 2500, "good"],
    ["lcp", 2501, "needs-work"],
    ["lcp", 4000, "needs-work"],
    ["lcp", 4001, "poor"],
    ["inp", 200, "good"],
    ["inp", 500, "needs-work"],
    ["inp", 501, "poor"],
    ["cls", 0.1, "good"],
    ["cls", 0.26, "poor"],
    ["ttfb", 801, "needs-work"],
  ] as const)("rates %s %d as %s", (metric, value, rating) => {
    expect(rate(metric, value)).toBe(rating);
  });
});

describe("the budgets CI holds the site to", () => {
  it("are the ones in Lighthouse's desktop config", () => {
    const { assertions } = desktop.ci.assert;
    expect(assertions["largest-contentful-paint"]).toEqual(["error", { maxNumericValue: LAB_BUDGETS.lcpMs }]);
    expect(assertions["cumulative-layout-shift"]).toEqual(["error", { maxNumericValue: LAB_BUDGETS.cls }]);
  });
});

describe("layout shift", () => {
  it("is zero with no shifts", () => {
    expect(clsFrom([])).toBe(0);
  });

  it("adds shifts less than a second apart into one window", () => {
    expect(clsFrom([shift(100, 0.02), shift(900, 0.03), shift(1800, 0.01)])).toBeCloseTo(0.06);
  });

  it("starts a new window after a second with no shift, and keeps the worst", () => {
    expect(clsFrom([shift(0, 0.02), shift(500, 0.02), shift(2000, 0.05)])).toBeCloseTo(0.05);
  });

  it("closes a window once it spans five seconds, however close its shifts", () => {
    const steady = Array.from({ length: 12 }, (_, index) => shift(index * 900, 0.01));
    // 0 to 4,500 ms is one window (six shifts); 5,400 ms starts the next.
    expect(clsFrom(steady)).toBeCloseTo(0.06);
  });

  it("ignores a shift the visitor caused, without breaking the window", () => {
    expect(clsFrom([shift(0, 0.02), shift(300, 0.5, true), shift(600, 0.02)])).toBeCloseTo(0.04);
  });
});

describe("responsiveness (INP)", () => {
  const events = (durations: number[]) => durations.map((duration, index) => ({ interactionId: index + 1, duration }));

  it("waits for an interaction", () => {
    expect(inpFrom([])).toBeNull();
    expect(inpFrom([{ interactionId: 0, duration: 300 }])).toBeNull();
  });

  it("times an interaction by its slowest event, and takes the slowest interaction", () => {
    expect(
      inpFrom([
        { interactionId: 7, duration: 24 },
        { interactionId: 7, duration: 56 },
        { interactionId: 9, duration: 40 },
      ]),
    ).toBe(56);
  });

  it("sets one aside per 50 interactions", () => {
    expect(inpFrom(events([400, ...Array<number>(48).fill(30)]))).toBe(400);
    expect(inpFrom(events([400, 120, ...Array<number>(48).fill(30)]))).toBe(120);
    expect(inpFrom(events([400, 350, 120, ...Array<number>(97).fill(30)]))).toBe(120);
  });
});

describe("how the page arrived", () => {
  it.each([
    [{ type: "navigate", activationStart: 0, wasRestored: false }, "navigate"],
    [{ type: "reload", activationStart: 0, wasRestored: false }, "reload"],
    [{ type: "back_forward", activationStart: 0, wasRestored: false }, "back-forward"],
    [{ type: "back_forward", activationStart: 0, wasRestored: true }, "restored"],
    [{ type: "navigate", activationStart: 812, wasRestored: false }, "prerendered"],
    [{ type: "prerender", activationStart: 0, wasRestored: false }, "prerendered"],
    [{ type: undefined, activationStart: 0, wasRestored: false }, "navigate"],
  ] as const)("reads %o as %s", (navigation, arrival) => {
    expect(arrivalOf(navigation)).toBe(arrival);
  });

  it("measures a prerendered page from when it was shown", () => {
    expect(sinceActivation(900, 0)).toBe(900);
    expect(sinceActivation(900, 812)).toBe(88);
    // Painted while still prerendering: it was there the moment it was shown.
    expect(sinceActivation(300, 812)).toBe(0);
  });
});

describe("what the visit downloaded", () => {
  it("adds up the page and its files, script apart, and counts what the cache answered", () => {
    expect(
      downloadedFrom([
        { name: "https://example.com/", transferSize: 12_000, encodedBodySize: 11_500 },
        { name: "https://example.com/_next/static/chunks/a.js", transferSize: 40_000, encodedBodySize: 39_700 },
        { name: "https://example.com/_next/static/chunks/b.js?v=2", transferSize: 0, encodedBodySize: 8_000 },
        { name: "https://example.com/_next/static/media/font.woff2", transferSize: 20_000, encodedBodySize: 19_800 },
        { name: "https://example.com/about/index.txt?_rsc=1", transferSize: 3_000, encodedBodySize: 2_800 },
      ]),
    ).toEqual({ bytes: 75_000, requests: 5, scriptBytes: 40_000, fromCache: 1 });
  });
});

describe("formatting", () => {
  it.each([
    [38.4, "38 ms"],
    [999.4, "999 ms"],
    [999.6, "1.00 s"],
    [1240, "1.24 s"],
  ])("writes %d ms as %s", (ms, text) => {
    expect(formatDuration(ms)).toBe(text);
  });

  it("writes a response quicker than the browser's 8 ms step as under one", () => {
    expect(formatResponse(0)).toBe("under 8 ms");
    expect(formatResponse(8)).toBe("8 ms");
    expect(formatResponse(40)).toBe("40 ms");
  });

  it("writes shifts and sizes the way browsers' tools do", () => {
    expect(formatShift(0.0031)).toBe("0.00");
    expect(formatShift(0.046)).toBe("0.05");
    expect(formatBytes(640)).toBe("640 B");
    expect(formatBytes(142_400)).toBe("142 KB");
    expect(formatBytes(1_260_000)).toBe("1.3 MB");
  });

  it("treats a route with or without its trailing slash as one page", () => {
    expect(pathKey("/about/")).toBe("/about");
    expect(pathKey("/about")).toBe("/about");
    expect(pathKey("/")).toBe("/");
  });
});
