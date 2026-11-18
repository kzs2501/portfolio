/**
 * Core Web Vitals and their neighbours, worked out from the browser's own performance
 * entries: what the footer's "This page, measured" shows. Pure, so every rule here is
 * tested without a browser; reading the entries is `components/page-measured/observe.ts`.
 */

export type Metric = "lcp" | "inp" | "cls" | "ttfb";
export type Rating = "good" | "needs-work" | "poor";

/** Google's limits for a good and for a poor experience, per metric (web.dev/articles/vitals). */
export const THRESHOLDS: Readonly<Record<Metric, readonly [good: number, poor: number]>> = {
  lcp: [2500, 4000],
  inp: [200, 500],
  cls: [0.1, 0.25],
  ttfb: [800, 1800],
};

/** At the good limit is still good; past the poor limit is poor. */
export function rate(metric: Metric, value: number): Rating {
  const [good, poor] = THRESHOLDS[metric];
  if (value <= good) return "good";
  return value <= poor ? "needs-work" : "poor";
}

/**
 * What CI holds the site to: Lighthouse's desktop run fails past these
 * (`lighthouse/desktop.json`, which a test keeps these equal to).
 */
export const LAB_BUDGETS = { lcpMs: 2000, cls: 0.05 } as const;

export interface Shift {
  value: number;
  startTime: number;
  isAfterInput: boolean;
}

/** CLS as the visit goes: the worst window so far, and the one shifts are adding to. */
export interface ClsState {
  worst: number;
  windowValue: number;
  windowStart: number | null;
  previous: number;
}

export const CLS_START: ClsState = { worst: 0, windowValue: 0, windowStart: null, previous: 0 };

/**
 * Cumulative Layout Shift, as Chrome reports it, one shift at a time: shifts gather into
 * session windows, and a window closes after a second with no shift or once it spans five
 * seconds. The page's CLS is its worst window. A shift just after an input was expected by
 * the visitor, so it doesn't count.
 */
export function withShift(state: ClsState, shift: Shift): ClsState {
  if (shift.isAfterInput) return state;
  const { windowStart } = state;
  const isSameWindow =
    windowStart !== null && shift.startTime - state.previous < 1000 && shift.startTime - windowStart < 5000;
  const windowValue = isSameWindow ? state.windowValue + shift.value : shift.value;
  return {
    worst: Math.max(state.worst, windowValue),
    windowValue,
    windowStart: isSameWindow ? windowStart : shift.startTime,
    previous: shift.startTime,
  };
}

/** CLS of a whole run of shifts, in the order they happened. */
export const clsFrom = (shifts: readonly Shift[]): number => shifts.reduce(withShift, CLS_START).worst;

export interface InteractionEvent {
  /** 0 for events that aren't part of an interaction (a scroll, a hover). */
  interactionId: number;
  duration: number;
}

/**
 * Interaction to Next Paint: each click, tap or key press lasts as long as its slowest
 * event, and INP is the slowest interaction; from 50 on, one is set aside per 50, so a
 * single hiccup on a long visit doesn't stand for it (Google's 98th percentile). Null until
 * there's been an interaction.
 */
export function inpFrom(events: readonly InteractionEvent[]): number | null {
  const longest = new Map<number, number>();
  for (const { interactionId, duration } of events) {
    if (interactionId > 0) longest.set(interactionId, Math.max(longest.get(interactionId) ?? 0, duration));
  }
  const slowestFirst = [...longest.values()].sort((a, b) => b - a);
  return slowestFirst[Math.min(slowestFirst.length - 1, Math.floor(slowestFirst.length / 50))] ?? null;
}

/** The most interactions INP keeps: its 98th percentile needs no more below 500 of them. */
export const INP_KEPT = 10;

/** INP as the visit goes: the slowest interactions, how many there have been, and the newest's id. */
export interface InpState {
  slowest: readonly { id: number; ms: number }[];
  count: number;
  lastId: number;
}

export const INP_START: InpState = { slowest: [], count: 0, lastId: 0 };

/**
 * One more event towards INP, keeping no more than INP needs (PF-08). Browsers number
 * interactions upwards, so a higher id than any so far is a new one. Exactly `inpFrom`
 * below 500 interactions; past that, an estimate from the slowest `INP_KEPT`.
 */
export function withInteraction(state: InpState, { interactionId, duration }: InteractionEvent): InpState {
  if (interactionId <= 0) return state;
  const known = state.slowest.find(({ id }) => id === interactionId);
  const merged = known
    ? state.slowest.map((kept) => (kept === known ? { id: kept.id, ms: Math.max(kept.ms, duration) } : kept))
    : [...state.slowest, { id: interactionId, ms: duration }];
  const isNew = interactionId > state.lastId;
  return {
    slowest: merged.sort((a, b) => b.ms - a.ms).slice(0, INP_KEPT),
    count: state.count + (isNew ? 1 : 0),
    lastId: Math.max(state.lastId, interactionId),
  };
}

export function inpOf({ slowest, count }: InpState): number | null {
  if (count === 0) return null;
  return slowest[Math.min(slowest.length - 1, Math.floor(count / 50))]?.ms ?? null;
}

/** A prerendered page is measured from when it was shown, not from when it was fetched. */
export const sinceActivation = (time: number, activationStart: number) => Math.max(time - activationStart, 0);

/** How the page that loaded in full got here. A page opened without a full load is the view's to tell. */
export type Arrival = "navigate" | "reload" | "back-forward" | "restored" | "prerendered";

export function arrivalOf({
  type,
  activationStart,
  wasRestored,
}: {
  /** The navigation entry's type: "navigate", "reload", "back_forward" or "prerender". */
  type: string | undefined;
  activationStart: number;
  /** Shown again from the back/forward cache (`pageshow` with `persisted`). */
  wasRestored: boolean;
}): Arrival {
  if (wasRestored) return "restored";
  if (activationStart > 0 || type === "prerender") return "prerendered";
  if (type === "reload") return "reload";
  if (type === "back_forward") return "back-forward";
  return "navigate";
}

export interface Fetched {
  name: string;
  transferSize: number;
  encodedBodySize: number;
}

export interface Downloaded {
  bytes: number;
  requests: number;
  scriptBytes: number;
  fromCache: number;
}

const SCRIPT = /\.m?js(?:[?#]|$)/u;

export const NOTHING_DOWNLOADED: Downloaded = { bytes: 0, requests: 0, scriptBytes: 0, fromCache: 0 };

/**
 * One more file towards what the visit has downloaded. A file the browser's cache answered
 * has a transfer size of 0 but a body, and is counted as cached.
 */
export function withFetched(total: Downloaded, { name, transferSize, encodedBodySize }: Fetched): Downloaded {
  return {
    bytes: total.bytes + transferSize,
    requests: total.requests + 1,
    scriptBytes: total.scriptBytes + (SCRIPT.test(name) ? transferSize : 0),
    fromCache: total.fromCache + (transferSize === 0 && encodedBodySize > 0 ? 1 : 0),
  };
}

/** What the visit has downloaded: the page and every file it asked for. */
export const downloadedFrom = (entries: readonly Fetched[]): Downloaded =>
  entries.reduce(withFetched, NOTHING_DOWNLOADED);

/** A route's path without its trailing slash, so `/about/` and `/about` are one page. */
export const pathKey = (path: string) => (path.length > 1 ? path.replace(/\/+$/u, "") : path);

/** What the panel shows, from one moment of the visit. */
export interface Measurements {
  /** The page the browser loaded in full; the load times below are its. */
  firstPath: string;
  arrival: Arrival;
  /** Which entries this browser reports at all. */
  support: {
    hasLcp: boolean;
    hasCls: boolean;
    hasInp: boolean;
    hasSoftNavigations: boolean;
    /** Whether the browser times the page and its files at all: first byte and downloads. */
    hasTimings: boolean;
  };
  /** Null until the browser has reported one. */
  lcpMs: number | null;
  ttfbMs: number | null;
  inpMs: number | null;
  cls: number;
  /** Pages opened without a full load that the browser timed, by `pathKey`: click to new content painted. */
  softNavigations: Readonly<Record<string, number>>;
  downloaded: Downloaded;
}

/** "412 ms", or from a second up "1.24 s". */
export function formatDuration(ms: number) {
  const rounded = Math.round(ms);
  return rounded < 1000 ? `${rounded} ms` : `${(ms / 1000).toFixed(2)} s`;
}

/**
 * A response time. Browsers time events in steps of 8 ms, so 0 means quicker than one
 * step (Firefox reports a quick key press so), not instant.
 */
export const formatResponse = (ms: number) => (ms < 8 ? "under 8 ms" : formatDuration(ms));

/** Layout shift has no unit; two places, as Google reports it. */
export const formatShift = (value: number) => value.toFixed(2);

/** Decimal kilobytes, as browsers' network panels count them. */
export function formatBytes(bytes: number) {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}
