/**
 * Properties of the panel's numbers over any run of entries: what the November bug hunt
 * checked, kept. CLS equals Google's definition written the slow and obvious way, and the
 * running totals the panel keeps equal the list versions they replaced (PF-08).
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  CLS_START,
  clsFrom,
  downloadedFrom,
  formatBytes,
  formatDuration,
  INP_START,
  inpFrom,
  inpOf,
  NOTHING_DOWNLOADED,
  rate,
  withFetched,
  withInteraction,
  withShift,
  type Shift,
} from "./web-vitals";

/** Session windows, the slow and obvious way. */
function obviousCls(shifts: readonly Shift[]) {
  let worst = 0;
  let current: Shift[] = [];
  for (const shift of shifts.filter((each) => !each.isAfterInput)) {
    const [first] = current;
    const last = current.at(-1);
    const isSameWindow =
      first !== undefined &&
      last !== undefined &&
      shift.startTime - last.startTime < 1000 &&
      shift.startTime - first.startTime < 5000;
    current = isSameWindow ? [...current, shift] : [shift];
    worst = Math.max(
      worst,
      current.reduce((sum, each) => sum + each.value, 0),
    );
  }
  return worst;
}

const shifts = fc
  .array(
    fc.record({
      value: fc.double({ min: 0, max: 0.5, noNaN: true }),
      gap: fc.integer({ min: 0, max: 3000 }),
      isAfterInput: fc.boolean(),
    }),
    { maxLength: 40 },
  )
  .map((raw) => {
    let time = 0;
    return raw.map(({ value, gap, isAfterInput }) => ({ value, startTime: (time += gap), isAfterInput }));
  });

/** Interactions numbered upwards, as browsers number them, each with one to three events. */
const interactions = (most: number) =>
  fc
    .array(fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 1, maxLength: 3 }), { maxLength: most })
    .map((durations) =>
      durations.flatMap((events, index) => events.map((duration) => ({ interactionId: index + 1, duration }))),
    );

describe("the panel's numbers, for any run of entries", () => {
  it("CLS is the worst session window, as Google defines it, kept as a running total", () => {
    fc.assert(
      fc.property(shifts, (run) => {
        expect(clsFrom(run)).toBeCloseTo(obviousCls(run), 9);
        expect(run.reduce(withShift, CLS_START).worst).toBeCloseTo(obviousCls(run), 9);
      }),
      { numRuns: 2_000 },
    );
  });

  it("INP kept from the slowest ten is exactly INP from every event, below 500 interactions", () => {
    fc.assert(
      fc.property(interactions(120), (events) => {
        expect(inpOf(events.reduce(withInteraction, INP_START))).toBe(inpFrom(events));
      }),
      { numRuns: 1_000 },
    );
    const many = Array.from({ length: 499 }, (_, index) => ({
      interactionId: index + 1,
      duration: (index * 37) % 500,
    }));
    expect(inpOf(many.reduce(withInteraction, INP_START))).toBe(inpFrom(many));
  });

  it("INP is the slowest interaction below 50, and never more than the slowest", () => {
    const event = fc.record({
      interactionId: fc.integer({ min: 0, max: 60 }),
      duration: fc.integer({ min: 0, max: 1000 }),
    });
    fc.assert(
      fc.property(fc.array(event, { maxLength: 300 }), (events) => {
        const byId = new Map<number, number>();
        for (const { interactionId, duration } of events) {
          if (interactionId > 0) byId.set(interactionId, Math.max(byId.get(interactionId) ?? 0, duration));
        }
        const slowest = Math.max(-1, ...byId.values());
        const inp = inpFrom(events);
        if (byId.size === 0) expect(inp).toBeNull();
        else if (byId.size < 50) expect(inp).toBe(slowest);
        else expect(inp).toBeLessThanOrEqual(slowest);
      }),
      { numRuns: 2_000 },
    );
  });

  it("downloads kept as a running total add up the same as the list", () => {
    const fetched = fc.record({
      name: fc.constantFrom("/a.js", "/b.mjs?v=1", "/c.css", "/d.woff2", "/e.js#x"),
      transferSize: fc.integer({ min: 0, max: 2_000_000 }),
      encodedBodySize: fc.integer({ min: 0, max: 2_000_000 }),
    });
    fc.assert(
      fc.property(fc.array(fetched, { maxLength: 40 }), (entries) => {
        expect(entries.reduce(withFetched, NOTHING_DOWNLOADED)).toEqual(downloadedFrom(entries));
        expect(downloadedFrom(entries).bytes).toBe(entries.reduce((sum, entry) => sum + entry.transferSize, 0));
      }),
      { numRuns: 1_000 },
    );
  });

  it("formats and rates any number without saying NaN", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1e7, noNaN: true }), (value) => {
        for (const written of [formatDuration(value), formatBytes(Math.round(value))]) {
          expect(written).not.toMatch(/NaN|Infinity|undefined/u);
        }
        for (const metric of ["lcp", "inp", "cls", "ttfb"] as const) rate(metric, value);
      }),
      { numRuns: 2_000 },
    );
    expect(formatDuration(-0.4)).not.toMatch(/-/u);
  });
});
