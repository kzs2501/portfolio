export type NoteMeta = {
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO
};

/** Newest first. */
export const notes: NoteMeta[] = [
  {
    slug: "debounce-is-not-a-race-guard",
    title: "Debounce doesn’t fix race conditions",
    summary:
      "Debouncing cuts how many requests you send. It does nothing about the order they come back in — and the stale one wins more often than you’d think.",
    date: "2026-10-04",
  },
  {
    slug: "load-sdks-on-mount",
    title: "Load third-party SDKs when they mount, not on page load",
    summary:
      "A payments SDK used on two screens was being downloaded on every page. Moving the load to first mount is a small change with a large payoff — and two traps.",
    date: "2026-10-04",
  },
  {
    slug: "async-intersection-observer-mock",
    title: "Your IntersectionObserver mock should be async",
    summary:
      "jsdom has no layout engine, so you have to fake IntersectionObserver. Fake it synchronously and your tests pass against timing a browser never produces.",
    date: "2026-10-04",
  },
];

export const getNote = (slug: string) => notes.find((n) => n.slug === slug);

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
