"use client";

import { useRef } from "react";
import { useCopyFeedback } from "./use-copy-feedback";

/**
 * The email as a real mailto link, plus a copy button — recruiters copy far more
 * often than they click mailto. If the clipboard is unavailable, the address is
 * selected instead so ⌘C still works.
 */
export function CopyEmail({ email, className = "" }: { email: string; className?: string }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const { hasCopied, copy } = useCopyFeedback();

  const copyEmail = async () => {
    if (await copy(email)) return;
    // No clipboard: select the address so ⌘C still works.
    const link = linkRef.current;
    if (!link) return;
    const range = document.createRange();
    range.selectNodeContents(link);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <a ref={linkRef} href={`mailto:${email}`} className="hover:text-accent">
        {email}
      </a>
      <button
        type="button"
        onClick={copyEmail}
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
