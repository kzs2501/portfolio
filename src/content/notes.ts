export interface NoteMeta {
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO
}

/** Newest first. */
export const notes: NoteMeta[] = [
  {
    slug: "redirect-races-the-webhook",
    title: "The redirect races the webhook",
    summary:
      "After a payment, the browser’s redirect and the provider’s webhook race back to your app. Only one of them should be allowed to issue tickets.",
    date: "2026-10-12",
  },
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

export const findNote = (slug: string): NoteMeta | undefined => notes.find((entry) => entry.slug === slug);

/** For slugs that must exist (static params come from this list): a miss is a bug. */
export function getNote(slug: string): NoteMeta {
  const meta = findNote(slug);
  if (!meta) throw new Error(`Unknown note: ${slug}`);
  return meta;
}

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
