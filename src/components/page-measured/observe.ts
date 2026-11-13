import {
  arrivalOf,
  clsFrom,
  downloadedFrom,
  inpFrom,
  pathKey,
  sinceActivation,
  type Fetched,
  type InteractionEvent,
  type Measurements,
  type Shift,
} from "@/lib/web-vitals";

/**
 * The visit, as the browser's performance timeline records it: one observer per kind of
 * entry, each asking for what was recorded before it started (`buffered`), so starting
 * once the page is idle still sees the load. A small store hands the view a new snapshot
 * when something changed, at most once a frame.
 */

let navigation: PerformanceNavigationTiming | undefined;
let lcp: number | null = null;
let wasRestored = false;
const shifts: Shift[] = [];
const events: InteractionEvent[] = [];
const fetched: Fetched[] = [];
const softNavigations: Record<string, number> = {};

let snapshot: Measurements | null = null;
const listeners = new Set<() => void>();
let isScheduled = false;
let isStarted = false;

const supports = (type: string) =>
  typeof PerformanceObserver !== "undefined" && PerformanceObserver.supportedEntryTypes.includes(type);

/** A field some engines add to an entry and TypeScript's DOM types don't know yet. */
function numberIn(entry: object, field: string) {
  const value: unknown = Reflect.get(entry, field);
  return typeof value === "number" ? value : 0;
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
    },
    lcpMs: lcp === null ? null : sinceActivation(lcp, activationStart),
    ttfbMs: navigation ? sinceActivation(navigation.responseStart, activationStart) : null,
    inpMs: inpFrom(events),
    cls: clsFrom(shifts),
    softNavigations: { ...softNavigations },
    downloaded: downloadedFrom(navigation ? [navigation, ...fetched] : fetched),
  };
}

function changed() {
  if (isScheduled) return;
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
  events.push({ interactionId: numberIn(entry, "interactionId"), duration: entry.duration });
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
    shifts.push({
      value: numberIn(entry, "value"),
      startTime: entry.startTime,
      isAfterInput: Reflect.get(entry, "hadRecentInput") === true,
    });
  });
  // Events from 16 ms up (the least the browser allows), and the first input whatever it took.
  observe("event", takeEvent, { durationThreshold: 16 });
  observe("first-input", takeEvent);
  observe("resource", (entry) => {
    if (entry instanceof PerformanceResourceTiming) {
      fetched.push({ name: entry.name, transferSize: entry.transferSize, encodedBodySize: entry.encodedBodySize });
    }
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
  changed();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getSnapshot = () => snapshot;
