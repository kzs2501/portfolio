"use client";

import { useSyncExternalStore } from "react";
import { formatClock, formatUtcOffset, HOME, relativeToVisitor, zoneOffsetMinutes } from "@/lib/local-time";

// Re-render on each minute boundary, not on an arbitrary interval, so the clock
// never shows a stale minute for up to 59 seconds.
const subscribe = (onChange: () => void) => {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    timer = setTimeout(() => {
      onChange();
      schedule();
    }, 60_000 - (Date.now() % 60_000) + 50);
  };
  schedule();
  return () => clearTimeout(timer);
};
const currentMinute = () => Math.floor(Date.now() / 60_000);

/**
 * "Bengaluru · 9:41 pm IST (UTC+5:30)" and, for visitors elsewhere, how far ahead
 * or behind that is — the timezone question a remote team always asks. Rendered
 * after hydration (null server snapshot) in a fixed-width slot: no mismatch, no shift.
 */
export function LocalTime() {
  const minute = useSyncExternalStore(subscribe, currentMinute, () => null);
  const now = minute === null ? null : new Date(minute * 60_000);
  const home = now ? zoneOffsetMinutes(now, HOME.timeZone) : 0;
  const relative = now ? relativeToVisitor(home, -now.getTimezoneOffset()) : null;

  return (
    <p className="text-ink-3">
      {HOME.city} ·{" "}
      <time
        dateTime={now?.toISOString()}
        className="num inline-block min-w-[4.75rem] text-ink-2"
        suppressHydrationWarning
      >
        {now ? formatClock(now) : " "}
      </time>{" "}
      {HOME.abbr} ({formatUtcOffset(HOME.offsetMinutes)})
      {relative && <span className="block text-xs">{relative}</span>}
    </p>
  );
}
