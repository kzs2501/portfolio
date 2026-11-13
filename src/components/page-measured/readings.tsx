"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { site } from "@/content/site";
import {
  formatBytes,
  formatDuration,
  formatResponse,
  formatShift,
  LAB_BUDGETS,
  pathKey,
  rate,
  type Measurements,
  type Metric,
  type Rating,
} from "@/lib/web-vitals";
import { getSnapshot, startObserving, subscribe } from "./observe";

export { startObserving };

const RATING_WORD: Record<Rating, string> = { good: "Good", "needs-work": "Needs work", poor: "Poor" };
const RATING_CLASS: Record<Rating, string> = { good: "text-ok", "needs-work": "text-warn", poor: "text-warn" };
const BUDGETS_URL = `${site.links.source}/blob/main/lighthouse/desktop.json`;

function arrival(measurements: Measurements, pathname: string, hasNavigated: boolean) {
  if (hasNavigated) {
    const ms = measurements.softNavigations[pathKey(pathname)];
    if (ms !== undefined) {
      return `Opened in the app, without a full load: the new content painted ${formatDuration(ms)} after your click.`;
    }
    return measurements.support.hasSoftNavigations
      ? "Opened in the app, without a full load."
      : "Opened in the app, without a full load. Your browser doesn’t time these; Chrome does.";
  }
  switch (measurements.arrival) {
    case "navigate":
      return "A full load.";
    case "reload":
      return "Reloaded.";
    case "back-forward":
      return "Back or forward, loaded again.";
    case "restored":
      return "Restored from your browser’s back/forward cache, so it showed at once.";
    case "prerendered":
      return "Prerendered before you clicked, so it showed at once.";
  }
}

function Value({
  metric,
  value,
  format,
  isSupported,
  waiting,
}: {
  metric: Metric;
  value: number | null;
  format: (value: number) => string;
  isSupported: boolean;
  waiting: string;
}) {
  if (!isSupported) return <>Your browser doesn’t report this.</>;
  if (value === null) return <>{waiting}</>;
  const rating = rate(metric, value);
  return (
    <>
      <span className="num text-ink">{format(value)}</span>{" "}
      <span className={RATING_CLASS[rating]}>{RATING_WORD[rating]}</span>
    </>
  );
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid gap-x-4 sm:grid-cols-[13rem_1fr]">
      <dt className="text-ink-3">{term}</dt>
      <dd className="text-ink-2">{children}</dd>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-medium text-ink-2">{title}</p>
      <dl className="space-y-1.5">{children}</dl>
    </div>
  );
}

/**
 * The visit's measurements, as the browser reported them. `hasNavigated` is whether the
 * visitor has moved on inside the app since the page loaded in full: then the load times
 * are that first page's, and this one's arrival is a soft navigation.
 */
export function ReadingsView({
  measurements,
  pathname,
  hasNavigated,
}: {
  measurements: Measurements | null;
  pathname: string;
  hasNavigated: boolean;
}) {
  if (!measurements) return <p className="mt-3 text-ink-3">Measuring…</p>;
  const { support, downloaded } = measurements;
  const requests = `${downloaded.requests} ${downloaded.requests === 1 ? "request" : "requests"}`;
  return (
    <div className="mt-3 max-w-2xl space-y-4">
      <dl>
        <Row term="How you got here">{arrival(measurements, pathname, hasNavigated)}</Row>
      </dl>
      <Group title={hasNavigated ? `The page you loaded first (${measurements.firstPath})` : "This page’s load"}>
        <Row term="Largest paint (LCP)">
          <Value
            metric="lcp"
            value={measurements.lcpMs}
            format={formatDuration}
            isSupported={support.hasLcp}
            waiting="Not reported yet."
          />
        </Row>
        <Row term="First byte (TTFB)">
          <Value
            metric="ttfb"
            value={measurements.ttfbMs}
            format={formatDuration}
            isSupported
            waiting="Not reported yet."
          />
        </Row>
      </Group>
      <Group title="This visit, so far">
        <Row term="Layout shift (CLS)">
          {support.hasCls ? (
            <Value metric="cls" value={measurements.cls} format={formatShift} isSupported waiting="" />
          ) : (
            "Your browser doesn’t report layout shifts; Chromium-based browsers do."
          )}
        </Row>
        <Row term="Slowest response (INP)">
          <Value
            metric="inp"
            value={measurements.inpMs}
            format={formatResponse}
            isSupported={support.hasInp}
            waiting="Click, tap or press a key to measure."
          />
        </Row>
        <Row term="Downloaded">
          <span className="num text-ink">{formatBytes(downloaded.bytes)}</span> in {requests},{" "}
          {formatBytes(downloaded.scriptBytes)} of it script
          {downloaded.fromCache > 0 && `; ${downloaded.fromCache} from your browser’s cache`}.
        </Row>
      </Group>
      <p className="text-ink-3">
        Measured by your browser just now; this panel sends nothing anywhere. Ratings use Google’s thresholds for a good
        experience. On every change, CI fails if Lighthouse measures LCP over {LAB_BUDGETS.lcpMs / 1000} s or CLS over{" "}
        {LAB_BUDGETS.cls} on a desktop:{" "}
        <a href={BUDGETS_URL} className="inline-flex min-h-6 items-center underline underline-offset-4 hover:text-ink">
          the budgets
        </a>
        .
      </p>
    </div>
  );
}

/** The panel's contents, loaded with the panel's code: what the browser has measured, kept current. */
export default function Readings({ pathname, hasNavigated }: { pathname: string; hasNavigated: boolean }) {
  useEffect(startObserving, []);
  const measurements = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return <ReadingsView measurements={measurements} pathname={pathname} hasNavigated={hasNavigated} />;
}
