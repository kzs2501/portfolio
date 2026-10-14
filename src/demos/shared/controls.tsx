import type { ReactNode } from "react";

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-lg border border-rule bg-paper p-0.5 text-sm"
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              // Roving focus: arrows move the selection like native radios.
              const i = options.findIndex((candidate) => candidate.value === value);
              const delta =
                e.key === "ArrowRight" || e.key === "ArrowDown"
                  ? 1
                  : e.key === "ArrowLeft" || e.key === "ArrowUp"
                    ? -1
                    : 0;
              if (!delta) return;
              e.preventDefault();
              const nextOption = options[(i + delta + options.length) % options.length];
              if (nextOption) onChange(nextOption.value);
              const group = e.currentTarget.parentElement;
              requestAnimationFrame(() => group?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus());
            }}
            className={`press rounded-md px-3 py-1.5 ${isSelected ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function PlayerControls({
  isPlaying,
  isDone,
  onPlay,
  onPause,
  onStep,
  onReset,
}: {
  isPlaying: boolean;
  isDone: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
}) {
  const btn =
    "press rounded-md border border-rule bg-paper px-3 py-1.5 text-sm text-ink hover:bg-surface-2 disabled:opacity-40";
  return (
    <div className="flex flex-wrap gap-2">
      {isPlaying ? (
        <button type="button" className={btn} onClick={onPause}>
          Pause
        </button>
      ) : (
        <button type="button" className={btn} onClick={onPlay}>
          {isDone ? "Replay" : "Play"}
        </button>
      )}
      <button type="button" className={btn} onClick={onStep} disabled={isDone}>
        Step
      </button>
      <button type="button" className={btn} onClick={onReset}>
        Reset
      </button>
    </div>
  );
}

export function DemoShell({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <div className="p-5 sm:p-7">
      <div className="mb-5 max-w-xl">
        <p className="num text-[11px] tracking-[0.16em] text-accent uppercase">Interactive · {title}</p>
        <p className="mt-1.5 text-sm text-ink-2">{intro}</p>
      </div>
      {children}
    </div>
  );
}
