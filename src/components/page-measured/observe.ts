import {
  arrivalOf,
  CLS_START,
  INP_START,
  inpOf,
  NOTHING_DOWNLOADED,
  pathKey,
  sinceActivation,
  withFetched,
  withInteraction,
  withShift,
  type Fetched,
  type Measurements,
} from "@/lib/web-vitals";

/**
 * The visit, as the browser's performance timeline records it: one observer per kind of
 * entry, each asking for what was recorded before it started (`buffered`), so starting
 * once the page is idle still sees the load. What they report is kept as running totals,
 * not lists, so a long visit costs nothing more (PF-08). A small store hands the view a
 * new snapshot when something changed, at most once a frame, and only while the view is
 * open. A browser with no observers is read from its timeline instead (PF-07).
 */

let navigation: PerformanceNavigationTiming | undefined;
let lcp: number | null = null;
let wasRestored = false;
let cls = CLS_START;
let inp = INP_START;
let downloads = NOTHING_DOWNLOADED;
const softNavigations: Record<string, number> = {};

let snapshot: Measurements | null = null;
const listeners = new Set<() => void>();
let isScheduled = false;
let isStarted = false;

const hasObservers = () => typeof PerformanceObserver !== "undefined";
const hasTimeline = () => typeof performance !== "undefined" && typeof performance.getEntriesByType === "function";

const supports = (type: string) => hasObservers() && PerformanceObserver.supportedEntryTypes.includes(type);

/** A field some engines add to an entry and TypeScript's DOM types don't know yet. */
function numberIn(entry: object, field: string) {
  const value: unknown = Reflect.get(entry, field);
  return typeof value === "number" ? value : 0;
}

const fetchedOf = (entry: PerformanceEntry): Fetched => ({
  name: entry.name,
  transferSize: numberIn(entry, "transferSize"),
  encodedBodySize: numberIn(entry, "encodedBodySize"),
});

/** With no observers to tell us, the timeline as it stands: read at the start, and each time the view opens. */
function readTimeline() {
  if (hasObservers() || !hasTimeline()) return;
  const [entry] = performance.getEntriesByType("navigation");
  // A navigation entry: the page's own timing, with the fields `measure` reads.
  if (entry) navigation = entry as PerformanceNavigationTiming;
  downloads = performance.getEntriesByType("resource").map(fetchedOf).reduce(withFetched, NOTHING_DOWNLOADED);
}

function measure(): Measurements {
  const activationStart = navigation ? numberIn(navigation, "activationStart") : 0;
  return {
    firstPath: navigation ? new URL(navigation.name).pathname : location.pathname,
    arrival: arrivalOf({ type: navigation?.type, activationStart, wasRestored }),
    support: {
      hasLcp: supports("largest-contentful-paint"),
      hasCls: supports("layout-shift"),
      hasInp: supports("event"),
      hasSoftNavigations: supports("soft-navigation"),
      hasTimings: supports("navigation") || hasTimeline(),
    },
    lcpMs: lcp === null ? null : sinceActivation(lcp, activationStart),
    ttfbMs: navigation ? sinceActivation(navigation.responseStart, activationStart) : null,
    inpMs: inpOf(inp),
    cls: cls.worst,
    softNavigations: { ...softNavigations },
    downloaded: navigation ? withFetched(downloads, fetchedOf(navigation)) : downloads,
  };
}

/** Something changed: measure again before the next frame, if anyone is looking. */
function changed() {
  if (isScheduled || listeners.size === 0) return;
  isScheduled = true;
  requestAnimationFrame(() => {
    isScheduled = false;
    snapshot = measure();
    for (const listener of listeners) listener();
  });
}

/** Event Timing's threshold isn't in TypeScript's DOM types yet. */
type ObserveOptions = PerformanceObserverInit & { durationThreshold?: number };

function observe(type: string, take: (entry: PerformanceEntry) => void, options: ObserveOptions = {}) {
  if (!supports(type)) return;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) take(entry);
    changed();
  }).observe({ type, buffered: true, ...options });
}

const takeEvent = (entry: PerformanceEntry) => {
  inp = withInteraction(inp, { interactionId: numberIn(entry, "interactionId"), duration: entry.duration });
};

/** Starts watching; safe to call again. */
export function startObserving() {
  if (isStarted || typeof window === "undefined") return;
  isStarted = true;
  observe("navigation", (entry) => {
    if (entry instanceof PerformanceNavigationTiming) navigation = entry;
  });
  // The largest paint so far; the browser stops reporting new ones after the first input.
  observe("largest-contentful-paint", (entry) => {
    lcp = entry.startTime;
  });
  observe("layout-shift", (entry) => {
    cls = withShift(cls, {
      value: numberIn(entry, "value"),
      startTime: entry.startTime,
      isAfterInput: Reflect.get(entry, "hadRecentInput") === true,
    });
  });
  // Events from 16 ms up (the least the browser allows), and the first input whatever it took.
  observe("event", takeEvent, { durationThreshold: 16 });
  observe("first-input", takeEvent);
  observe("resource", (entry) => {
    downloads = withFetched(downloads, fetchedOf(entry));
  });
  // Chrome's record of a page opened without a full load: from the click to its new content painted.
  observe("soft-navigation", (entry) => {
    softNavigations[pathKey(new URL(entry.name).pathname)] = entry.duration;
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      wasRestored = true;
      changed();
    }
  });
  readTimeline();
  changed();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  // A fresh snapshot for whoever just started looking; without observers, read the timeline now.
  readTimeline();
  changed();
  return () => {
    listeners.delete(listener);
  };
}

export const getSnapshot = () => snapshot;
