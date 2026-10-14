/**
 * The typeahead race, as a timeline. Debounce is ON throughout — the point is
 * that it doesn't help with ordering:
 *
 *   "B", "BT" typed quickly → one debounced request for "BT" (slow: 4 ticks)
 *   "BTC" typed after a pause → a second request for "BTC" (fast: 1 tick)
 *
 * "BTC" comes back first. Then the stale "BT" response lands. Without a guard
 * it overwrites the newer results; with a guard it's dropped.
 */
import type { TimelineMarker, TimelineSegment } from "../shared/timeline-types";

export type ScreenState =
  { kind: "idle" } | { kind: "loading"; query: string } | { kind: "results"; query: string; isStale: boolean };

const DEBOUNCE = 1.5;

const keystrokes = [
  { at: 0, value: "B" },
  { at: 0.6, value: "BT" },
  { at: 2.8, value: "BTC" },
];

const latency: Record<string, number> = { BT: 4, BTC: 1 };

/** Every query the timeline sends has a latency; a missing one is a bug in this table. */
function latencyFor(query: string): number {
  const ticks = latency[query];
  if (ticks === undefined) throw new Error(`No latency for "${query}"`);
  return ticks;
}

export function buildRace(isGuarded: boolean) {
  const segments: TimelineSegment[] = [];
  const markers: TimelineMarker[] = [];

  // Debounce: a request fires DEBOUNCE after a keystroke with no newer keystroke.
  const requests: { query: string; sentAt: number; returnsAt: number }[] = [];
  keystrokes.forEach((k, i) => {
    markers.push({ lane: "keys", kind: "key", at: k.at });
    const nextKey = keystrokes[i + 1];
    const firesAt = k.at + DEBOUNCE;
    if (nextKey && nextKey.at < firesAt) {
      segments.push({ lane: "debounce", kind: "cancelled", start: k.at, end: nextKey.at });
      return;
    }
    segments.push({ lane: "debounce", kind: "debounce", start: k.at, end: firesAt });
    requests.push({ query: k.value, sentAt: firesAt, returnsAt: firesAt + latencyFor(k.value) });
  });

  for (const r of requests) {
    const lane = `req-${r.query}`;
    segments.push({ lane, kind: "request", start: r.sentAt, end: r.returnsAt });
    const isLatest = r === requests[requests.length - 1];
    const isLate = requests.some((o) => o !== r && o.sentAt > r.sentAt && o.returnsAt < r.returnsAt);
    markers.push({ lane, kind: isGuarded && !isLatest ? "dropped" : isLate ? "stale" : "fresh", at: r.returnsAt });
  }

  const latestQuery = keystrokes.at(-1)?.value ?? "";
  const duration = Math.ceil(Math.max(...requests.map((r) => r.returnsAt)) + 1);

  /** What the user sees at time t: the input's value and the results panel. */
  const screenAt = (t: number): { input: string; screen: ScreenState } => {
    const input = [...keystrokes].reverse().find((k) => k.at <= t)?.value ?? "";
    let screen: ScreenState = { kind: "idle" };
    const events = [
      ...requests.map((r) => ({ at: r.sentAt, type: "send" as const, r })),
      ...requests.map((r) => ({ at: r.returnsAt, type: "return" as const, r })),
    ]
      .filter((e) => e.at <= t)
      .sort((a, b) => a.at - b.at);

    const latestSent = (at: number) => [...requests].reverse().find((r) => r.sentAt <= at);

    for (const e of events) {
      if (e.type === "send") screen = { kind: "loading", query: e.r.query };
      else {
        const newest = latestSent(e.at);
        if (isGuarded && newest && newest !== e.r) continue; // the guard: ignore superseded responses
        screen = { kind: "results", query: e.r.query, isStale: e.r.query !== input };
      }
    }
    return { input, screen };
  };

  return { segments, markers, duration, requests, latestQuery, screenAt };
}

/** Same mock data the typeahead challenge uses. */
const DB = ["BTC-INR", "ETH-INR", "SOL-INR", "BTC-USDT", "ETH-USDT", "BTT-USDT", "BTTC-INR"];
export const resultsFor = (q: string) => DB.filter((p) => p.startsWith(q));
