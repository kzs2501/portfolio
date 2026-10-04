import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-32 text-center sm:px-8">
      <p className="num text-sm text-ink-3">404 · No such page</p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight">That entry isn&rsquo;t in the ledger.</h1>
      <p className="mt-6 text-ink-2">
        Try the <Link href="/" className="text-accent underline underline-offset-4">homepage</Link>, or press{" "}
        <kbd className="num rounded border border-rule px-1.5 py-0.5 text-xs">⌘K</kbd> to search.
      </p>
    </div>
  );
}
