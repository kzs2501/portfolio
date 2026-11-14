"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { site } from "@/content/site";
import { pagePath } from "@/lib/routes";
import { toggleTheme } from "@/lib/theme";
import { filterCommands, type Command } from "./commands";
import { loadSearch, MIN_QUERY_LENGTH, searchWriting, type WritingHit, type WritingIndex } from "./search";

const slugOf = (group: string) => group.toLowerCase().replaceAll(" ", "-");

/** Starts fetching the index of the writing, for the trigger to call on approach. */
export const preloadSearch = () => {
  loadSearch().catch(() => undefined);
};

const asCommand = (hit: WritingHit): Command => ({
  id: `writing-${hit.id}`,
  group: "In the writing",
  label: hit.section ?? hit.page,
  hint: hit.section ? hit.page : hit.kind,
  excerpt: hit.excerpt,
  action: { type: "navigate", href: hit.href },
});

/**
 * Once a section has opened, move focus to its heading, as the skip link does for
 * <main>: keyboard and screen-reader users land where they asked, not at the top. The
 * new page can take a moment, so look each frame for up to two seconds, and only once
 * the address is the new page's (the old one may have a heading with the same id).
 */
function focusOnArrival(href: string) {
  const [path = "", id] = href.split("#");
  if (!id) return;
  const until = performance.now() + 2000;
  const look = () => {
    const isThere = pagePath(location.pathname) === pagePath(path);
    const heading = isThere ? document.getElementById(decodeURIComponent(id)) : null;
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus();
      return;
    }
    if (performance.now() < until) requestAnimationFrame(look);
  };
  requestAnimationFrame(look);
}

type Writing = { status: "loading" } | { status: "ready"; index: WritingIndex } | { status: "failed" };

/**
 * Native <dialog> + showModal() gives us, for free: a focus trap, an inert page
 * behind it, Escape-to-close, and the top layer (no z-index wars). Inside, the
 * input and list follow the ARIA combobox pattern — focus stays in the input and
 * aria-activedescendant points at the highlighted option.
 */
export default function PaletteDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState("");
  const [writing, setWriting] = useState<Writing>({ status: "loading" });

  const results = useMemo(
    () => [
      ...filterCommands(query),
      ...(writing.status === "ready" ? searchWriting(writing.index, query).map(asCommand) : []),
    ],
    [query, writing],
  );
  const isSearchingWriting = query.trim().length >= MIN_QUERY_LENGTH;
  const optionId = (i: number) => `${listId}-opt-${i}`;

  // Keep the native dialog in sync with the `isOpen` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      returnFocus.current = document.activeElement;
      setQuery("");
      setActive(0);
      setStatus("");
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // The index of the writing, fetched on first open (or sooner, on approach); after a
  // failure, each open tries again, and says "titles only" until it works.
  useEffect(() => {
    if (!isOpen || writing.status === "ready") return;
    let isCurrent = true;
    loadSearch().then(
      (index) => {
        if (isCurrent) setWriting({ status: "ready", index });
      },
      () => {
        if (isCurrent) setWriting({ status: "failed" });
      },
    );
    return () => {
      isCurrent = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Keep the highlighted option visible while arrowing through a long list.
  useEffect(() => {
    document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const close = () => {
    onClose();
    // Put focus back where the user was before the palette opened.
    if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus();
  };

  const run = async (command: Command) => {
    const { action } = command;
    switch (action.type) {
      case "navigate":
        close();
        router.push(action.href);
        focusOnArrival(action.href);
        return;
      case "external":
        close();
        window.open(action.href, "_blank", "noopener,noreferrer");
        return;
      case "theme":
        close();
        toggleTheme();
        return;
      case "copy-email":
        try {
          await navigator.clipboard.writeText(site.email);
          setStatus("Email address copied");
        } catch {
          setStatus(`Couldn’t copy. The address is ${site.email}`);
        }
        return;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = results[active];
      if (selected) void run(selected);
    }
  };

  // Group for display while keeping one flat index for keyboard movement.
  const groups = useMemo(() => {
    const map = new Map<string, { command: Command; index: number }[]>();
    results.forEach((command, index) => {
      const list = map.get(command.group) ?? [];
      list.push({ command, index });
      map.set(command.group, list);
    });
    return [...map.entries()];
  }, [results]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onClose={close}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> itself.
        if (e.target === dialogRef.current) close();
      }}
      className="m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-rule bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/25 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 border-b border-rule px-4">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4 shrink-0 text-ink-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            // New query, new results: start again from the top. Done here in the
            // event rather than in an effect, so there's no extra render.
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search pages and the writing…"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={results.length ? optionId(active) : undefined}
          aria-label="Search commands"
          className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3"
        />
        <kbd className="num rounded border border-rule px-1.5 py-0.5 text-[10px] text-ink-3">esc</kbd>
      </div>

      <div
        id={listId}
        role="listbox"
        aria-label="Commands"
        className="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain p-2"
      >
        {groups.map(([group, items]) => (
          // An id can't hold a space: `aria-labelledby` would read "Case studies" as two ids.
          <div key={group} role="group" aria-labelledby={`${listId}-${slugOf(group)}`} className="pb-1">
            <div
              id={`${listId}-${slugOf(group)}`}
              className="num px-2 pt-2 pb-1 text-[10px] tracking-[0.16em] text-ink-3 uppercase"
            >
              {group}
            </div>
            {items.map(({ command, index }) => (
              <div
                key={command.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === active}
                // A result from the writing is named by its title and page; its lines describe it.
                aria-labelledby={command.excerpt ? `${optionId(index)}-label ${optionId(index)}-hint` : undefined}
                aria-describedby={command.excerpt ? `${optionId(index)}-excerpt` : undefined}
                onPointerMove={() => setActive(index)}
                onClick={() => void run(command)}
                className={`press cursor-pointer rounded-md px-3 py-2.5 text-sm ${
                  index === active ? "bg-surface-2 text-ink" : "text-ink-2"
                }`}
              >
                {/* A result from the writing puts its page under its title on a phone, so neither is cut short. */}
                <div
                  className={
                    command.excerpt
                      ? "flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                      : "flex items-center justify-between gap-4"
                  }
                >
                  <span id={`${optionId(index)}-label`} className="truncate">
                    {command.label}
                  </span>
                  {command.hint && (
                    <span id={`${optionId(index)}-hint`} className="truncate text-xs text-ink-3 sm:shrink-0">
                      {command.hint}
                    </span>
                  )}
                </div>
                {command.excerpt && (
                  <p id={`${optionId(index)}-excerpt`} className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-3">
                    {command.excerpt.map((segment, at) =>
                      segment.isMatch ? (
                        <mark key={at} className="rounded-sm bg-accent-soft text-ink">
                          {segment.text}
                        </mark>
                      ) : (
                        segment.text
                      ),
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
        {results.length === 0 && !(isSearchingWriting && writing.status === "loading") && (
          <p className="px-3 py-8 text-center text-sm text-ink-3">Nothing matches “{query}”.</p>
        )}
      </div>

      <div role="status" aria-live="polite" className="border-t border-rule px-4 py-2 text-xs text-ink-3">
        {status ||
          (isSearchingWriting && writing.status === "loading"
            ? "Searching the writing…"
            : isSearchingWriting && writing.status === "failed"
              ? "Titles only: the search of the writing couldn’t load."
              : `${results.length} result${results.length === 1 ? "" : "s"} · ↑↓ to move · ↵ to open`)}
      </div>
    </dialog>
  );
}
