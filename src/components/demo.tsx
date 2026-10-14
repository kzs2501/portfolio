"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

/**
 * Every interactive demo is code-split and only downloaded as it approaches the
 * viewport — the same "load the SDK on mount, not on page load" idea as the
 * Stripe.js work. The frame reserves its height up front, so nothing shifts
 * when the demo arrives (no CLS).
 */
const loaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  "stage-registry": () => import("@/demos/stage-registry/demo"),
  "single-flight": () => import("@/demos/single-flight/demo"),
  "brand-tokens": () => import("@/demos/brand-tokens/demo"),
  "race-timeline": () => import("@/demos/race-timeline/demo"),
};

export type DemoName = keyof typeof loaders;

export function Demo({ name, title, minHeight = 480 }: { name: DemoName; title: string; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Loaded, setLoaded] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const load = () =>
      loaders[name]()
        .then((m) => !cancelled && setLoaded(() => m.default))
        .catch(() => !cancelled && setFailed(true));

    if (!("IntersectionObserver" in window)) {
      load();
      return () => void (cancelled = true);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [name]);

  return (
    <div
      ref={ref}
      role="region"
      aria-label={`Interactive demo: ${title}`}
      style={{ minHeight }}
      className="overflow-hidden rounded-xl border border-rule bg-surface"
    >
      {Loaded ? (
        <Loaded />
      ) : (
        <div className="grid h-full place-items-center p-8 text-sm text-ink-3" style={{ minHeight }}>
          {failed ? "This demo couldn’t load. Refresh to try again." : "Loading interactive demo…"}
        </div>
      )}
    </div>
  );
}
