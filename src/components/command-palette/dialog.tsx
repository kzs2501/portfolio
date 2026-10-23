"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { site } from "@/content/site";
import { toggleTheme } from "@/lib/theme";
import { filterCommands, type Command } from "./commands";

const slugOf = (group: string) => group.toLowerCase().replaceAll(" ", "-");

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

  const results = useMemo(() => filterCommands(query), [query]);
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
          setStatus(`Couldn’t copy — it’s ${site.email}`);
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
          placeholder="Search pages, case studies, notes…"
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
                onPointerMove={() => setActive(index)}
                onClick={() => void run(command)}
                className={`flex press cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2.5 text-sm ${
                  index === active ? "bg-surface-2 text-ink" : "text-ink-2"
                }`}
              >
                <span className="truncate">{command.label}</span>
                {command.hint && <span className="shrink-0 text-xs text-ink-3">{command.hint}</span>}
              </div>
            ))}
          </div>
        ))}
        {results.length === 0 && <p className="px-3 py-8 text-center text-sm text-ink-3">Nothing matches “{query}”.</p>}
      </div>

      <div role="status" aria-live="polite" className="border-t border-rule px-4 py-2 text-xs text-ink-3">
        {status || `${results.length} result${results.length === 1 ? "" : "s"} · ↑↓ to move · ↵ to open`}
      </div>
    </dialog>
  );
}
