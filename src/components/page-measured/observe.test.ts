import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as Observe from "./observe";

const NAVIGATION = {
  name: "http://localhost/notes/",
  entryType: "navigation",
  type: "navigate",
  responseStart: 42,
  transferSize: 20_000,
  encodedBodySize: 19_000,
};
const RESOURCES = [
  { name: "http://localhost/_next/static/chunks/app.js", transferSize: 60_000, encodedBodySize: 59_000 },
  { name: "http://localhost/fonts/body.woff2", transferSize: 0, encodedBodySize: 30_000 },
];

let observe: typeof Observe;
let frames: FrameRequestCallback[];

beforeEach(async () => {
  // The observer's state is the page's; each test starts as a fresh page would.
  vi.resetModules();
  frames = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
  vi.stubGlobal("PerformanceObserver", undefined);
  observe = await import("./observe");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const nextFrame = () => {
  for (const frame of frames.splice(0)) frame(0);
};

describe("the visit, measured without PerformanceObserver (PF-07)", () => {
  it("reads the page's timeline instead, so first byte and downloads are real", () => {
    vi.spyOn(performance, "getEntriesByType").mockImplementation(
      (type) =>
        (type === "navigation"
          ? [NAVIGATION]
          : type === "resource"
            ? RESOURCES
            : []) as unknown as PerformanceEntryList,
    );
    observe.startObserving();
    observe.subscribe(() => undefined);
    nextFrame();
    expect(observe.getSnapshot()).toMatchObject({
      firstPath: "/notes/",
      ttfbMs: 42,
      support: { hasTimings: true, hasCls: false, hasInp: false },
      downloaded: { bytes: 80_000, requests: 3, scriptBytes: 60_000, fromCache: 1 },
    });
  });

  it("says it has no timings when the browser keeps none", () => {
    vi.stubGlobal("performance", { now: () => 0 });
    observe.startObserving();
    observe.subscribe(() => undefined);
    nextFrame();
    expect(observe.getSnapshot()).toMatchObject({ ttfbMs: null, support: { hasTimings: false } });
  });
});

describe("measuring only while the panel is open (PF-08)", () => {
  it("doesn't measure until something subscribes, then does at the next frame", () => {
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([]);
    observe.startObserving();
    expect(frames).toHaveLength(0);
    const listener = vi.fn();
    const unsubscribe = observe.subscribe(listener);
    expect(frames).toHaveLength(1);
    nextFrame();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
