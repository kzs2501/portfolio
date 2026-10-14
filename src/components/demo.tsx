"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

/**
 * Every interactive demo is code-split and only downloaded as it approaches the
 * viewport — the same "load the SDK on mount, not on page load" idea as the
 * Stripe.js work. The frame reserves its height up front, so nothing shifts
 * when the demo arrives (no CLS).
 */
const DEMO_LOADERS = {
  "stage-registry": () => import("@/demos/stage-registry/demo"),
  "single-flight": () => import("@/demos/single-flight/demo"),
  "brand-tokens": () => import("@/demos/brand-tokens/demo"),
  "race-timeline": () => import("@/demos/race-timeline/demo"),
} satisfies Record<string, () => Promise<{ default: ComponentType }>>;

/** The demos that exist — a misspelt name is a type error, and MDX is checked by a test. */
export type DemoName = keyof typeof DEMO_LOADERS;

export const isDemoName = (value: string): value is DemoName => Object.hasOwn(DEMO_LOADERS, value);

export function Demo({ name, title, minHeight = 480 }: { name: DemoName; title: string; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Loaded, setLoaded] = useState<ComponentType | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let isCancelled = false;
    const load = () =>
      DEMO_LOADERS[name]()
        .then((demoModule) => !isCancelled && setLoaded(() => demoModule.default))
        .catch(() => !isCancelled && setHasFailed(true));

    if (!("IntersectionObserver" in window)) {
      void load();
      return () => {
        isCancelled = true;
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void load();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => {
      isCancelled = true;
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
          {hasFailed ? "This demo couldn’t load. Refresh to try again." : "Loading interactive demo…"}
        </div>
      )}
    </div>
  );
}
