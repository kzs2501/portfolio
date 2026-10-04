import type { Metadata } from "next";
import Link from "next/link";
import { notes, formatDate } from "@/content/notes";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Notes",
  description: "Short technical notes on async UI, performance and testing.",
};

export default function NotesIndex() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-5 pt-20 sm:px-8">
        <h1 className="font-serif text-5xl tracking-tight">Notes</h1>
        <p className="mt-4 text-lg text-ink-2">
          Short write-ups of things I learned the hard way: async UI, performance, and testing.
        </p>
        <ul className="mt-12 border-t border-rule">
          {notes.map((n) => (
            <li key={n.slug} className="border-b border-rule">
              <Link href={`/notes/${n.slug}`} transitionTypes={["nav-forward"]} className="group block py-7">
                <span className="num text-xs text-ink-3">{formatDate(n.date)}</span>
                <span className="mt-1 block font-serif text-2xl tracking-tight transition-colors group-hover:text-accent">
                  {n.title}
                </span>
                <span className="mt-2 block text-ink-2">{n.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-ink-3">
          <a href="/notes/rss.xml" className="underline underline-offset-4 hover:text-ink">RSS feed</a>
        </p>
      </div>
    </PageTransition>
  );
}
