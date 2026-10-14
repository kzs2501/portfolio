"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The email as a real mailto link, plus a copy button — recruiters copy far more
 * often than they click mailto. If the clipboard is unavailable, the address is
 * selected instead so ⌘C still works.
 */
export function CopyEmail({ email, className = "" }: { email: string; className?: string }) {
  const [hasCopied, setHasCopied] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setHasCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setHasCopied(false), 1500);
    } catch {
      const el = linkRef.current;
      if (!el) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <a ref={linkRef} href={`mailto:${email}`} className="hover:text-accent">
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={hasCopied ? "Email address copied" : "Copy email address"}
        className="num inline-flex min-h-6 press items-center rounded border border-rule px-1.5 text-[11px] text-ink-3 hover:border-ink-3 hover:text-ink"
      >
        {hasCopied ? "Copied" : "Copy"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {hasCopied ? "Email address copied" : ""}
      </span>
    </span>
  );
}
