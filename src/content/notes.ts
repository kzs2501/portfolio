export interface NoteMeta {
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO
}

/** Newest first. */
export const notes: NoteMeta[] = [
  {
    slug: "an-offline-ticket-needs-a-signature-not-a-server",
    title: "An offline ticket needs a signature, not a server",
    summary:
      "Doors are where networks fail. A signed ticket can be checked with a public key alone, a door has to remember whom it let in, and a service worker had to share its scope with MSW.",
    date: "2026-10-22",
  },
  {
    slug: "the-database-is-the-lock",
    title: "The database is the lock",
    summary:
      "Fifty buyers want the last ten tickets at once. Checking first and then writing oversells; one conditional update can’t. And a race test proves nothing until it has failed against the race.",
    date: "2026-10-21",
  },
  {
    slug: "a-screenshot-test-is-only-as-stable-as-its-machine",
    title: "A screenshot test is only as stable as its machine",
    summary:
      "Screenshots only compare with ones made on the same machine — the same OS, and the same kind of chip. Getting that right, and treating a flaky screenshot as a bug report, found two real bugs.",
    date: "2026-10-21",
  },
  {
    slug: "a-virtualised-table-should-still-be-a-table",
    title: "A virtualised table should still be a table",
    summary:
      "Drawing only the rows in view keeps 9,000 orders fast. The usual way of doing it also stops the table being a table for anyone using a screen reader.",
    date: "2026-10-20",
  },
  {
    slug: "upi-is-a-webhook-problem-too",
    title: "UPI is a webhook problem too",
    summary:
      "With UPI, the buyer approves in another app, where your page can’t see. So the page shouldn’t decide whether they paid — the webhook should, just as it does for cards.",
    date: "2026-10-19",
  },
  {
    slug: "a-waiting-room-should-tell-the-truth",
    title: "A waiting room should tell the truth",
    summary:
      "When 40,000 people want the same tickets, a waiting room decides who goes first. The hard part isn’t the line — it’s being honest about it.",
    date: "2026-10-19",
  },
  {
    slug: "a-seat-map-a-screen-reader-can-use",
    title: "A seat map a screen reader can use",
    summary:
      "Most seat maps are a picture you click. Built as a WAI-ARIA grid — one tab stop, arrows that move to the seat in front, every seat named — it works for keyboards and screen readers too.",
    date: "2026-10-17",
  },
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
