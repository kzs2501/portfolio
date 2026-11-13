"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// The measuring code downloads once the page has loaded and the browser is idle, so it
// never competes with the page itself; its observers then pick up what was recorded.
const load = () => import("./readings");
const Readings = lazy(load);

function whenLoadedAndIdle(run: () => void) {
  let isCancelled = false;
  const idle = () => {
    if (isCancelled) return;
    if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 3000 });
    else setTimeout(run, 500);
  };
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
  return () => {
    isCancelled = true;
    window.removeEventListener("load", idle);
  };
}

/**
 * "This page, measured", at the foot of every page: the visitor's own Core Web Vitals, from
 * their browser's performance timeline, beside the budgets CI holds the site to. Closed, it
 * is the same in the static HTML as after hydration, so it can't shift the layout.
 */
export function PageMeasured() {
  const pathname = usePathname();
  const details = useRef<HTMLDetailsElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // The page the footer first rendered on; once the path changes, every page is opened in the app.
  const [landing, setLanding] = useState(pathname);
  const [hasNavigated, setHasNavigated] = useState(false);
  if (!hasNavigated && pathname !== landing) setHasNavigated(true);

  // Opened before React had hydrated the page (a slow phone, a quick hand): the browser
  // opened it, but the toggle came before anyone was listening. Catch up.
  useEffect(() => {
    if (details.current?.open) setIsOpen(true);
  }, []);

  useEffect(
    () =>
      whenLoadedAndIdle(() => {
        void load().then(({ startObserving }) => {
          startObserving();
        });
      }),
    [],
  );

  // Shown again from the back/forward cache: this page arrived afresh.
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setLanding(pathname);
      setHasNavigated(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener("pageshow", onShow);
    };
  }, [pathname]);

  return (
    <details
      ref={details}
      className="group mx-auto max-w-5xl px-5 pb-10 text-xs sm:px-8"
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
    >
      <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-2 text-ink-3 hover:text-ink [&::-webkit-details-marker]:hidden">
        This page, measured
        <span
          aria-hidden="true"
          className="text-base leading-none transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      {isOpen && (
        <Suspense fallback={null}>
          <Readings pathname={pathname} hasNavigated={hasNavigated} />
        </Suspense>
      )}
    </details>
  );
}
