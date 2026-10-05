"use client";

import { startTransition, useState, ViewTransition } from "react";
import { DemoShell, Segmented } from "../shared/controls";
import { deepLink, rails, reconcileCurrent, registry, resolveStages, type Ctx, type Rail } from "./registry";

export default function StageRegistryDemo() {
  // Context and position live in ONE state object and change only through
  // functional updates. Updates run inside transitions, so a second quick click
  // can arrive before React re-renders; reading `index` from this render's
  // closure would then compute the same target twice and swallow a click.
  const [flow, setFlow] = useState<{ ctx: Ctx; currentId: string }>({
    ctx: { rail: "card", guest: false },
    currentId: "amount",
  });
  const { ctx, currentId } = flow;

  const stages = resolveStages(ctx);
  const index = Math.max(0, stages.findIndex((s) => s.id === currentId));
  const current = stages[index];
  const next = stages[index + 1];

  const changeCtx = (patch: Partial<Ctx>) =>
    startTransition(() =>
      setFlow((prev) => {
        const prevStages = resolveStages(prev.ctx);
        const prevIndex = Math.max(0, prevStages.findIndex((s) => s.id === prev.currentId));
        const nextCtx = { ...prev.ctx, ...patch };
        return { ctx: nextCtx, currentId: reconcileCurrent(prev.currentId, prevIndex, resolveStages(nextCtx)) };
      }),
    );

  const go = (delta: number) =>
    startTransition(() =>
      setFlow((prev) => {
        const list = resolveStages(prev.ctx);
        const i = list.findIndex((s) => s.id === prev.currentId);
        const target = list[i + delta];
        return target ? { ...prev, currentId: target.id } : prev;
      }),
    );

  return (
    <DemoShell
      title="Stage registry"
      intro="One registry of stages, each with a rule for when it applies. Switch the payment rail or check out as a guest — the flow rebuilds itself, and you keep your place."
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented<Rail> label="Payment rail" value={ctx.rail} options={rails} onChange={(rail) => changeCtx({ rail })} />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
          <input
            type="checkbox"
            checked={ctx.guest}
            onChange={(e) => changeCtx({ guest: e.target.checked })}
            className="size-4 accent-[var(--accent)]"
          />
          Check out as guest
        </label>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_15rem]">
        <ol aria-label="Checkout stages" className="space-y-1.5">
          {stages.map((s, i) => {
            const state = i < index ? "done" : i === index ? "current" : s === next ? "prefetched" : "upcoming";
            return (
              <ViewTransition key={s.id} name={`stage-${s.id}`} enter="item-enter" exit="item-exit" update="item-move" default="none">
                <li
                  aria-current={state === "current" ? "step" : undefined}
                  className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                    state === "current"
                      ? "border-accent bg-accent-soft text-ink"
                      : state === "done"
                        ? "border-transparent text-ink-3"
                        : "border-rule bg-paper text-ink-2"
                  }`}
                >
                  <span className={`num w-5 shrink-0 text-xs ${state === "current" ? "text-ink-2" : "text-ink-3"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1">{s.label}</span>
                  {state === "done" && <span className="text-xs text-ok">done</span>}
                  {state === "prefetched" && (
                    <span className="num rounded-full border border-rule px-2 py-0.5 text-[10px] tracking-wide text-ink-3 uppercase">
                      prefetched
                    </span>
                  )}
                </li>
              </ViewTransition>
            );
          })}
        </ol>

        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-rule bg-paper p-3.5">
            <p className="num text-[10px] tracking-[0.16em] text-ink-3 uppercase">Registry entry</p>
            <pre className="mt-2 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink">
{`{
  id: "${current.id}",
  when: ${current.rule === "always" ? "undefined" : `ctx => ${current.rule}`}
}`}
            </pre>
          </div>
          <div className="rounded-lg border border-rule bg-paper p-3.5">
            <p className="num text-[10px] tracking-[0.16em] text-ink-3 uppercase">Deep link</p>
            <p className="mt-2 font-mono text-xs break-all text-ink">{deepLink(ctx, current.id)}</p>
          </div>
          <p className="text-ink-3">
            <span className="num text-ink">{stages.length}</span> of {registry.length} registered stages apply.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="press rounded-md border border-rule bg-paper px-3.5 py-1.5 text-sm text-ink hover:bg-surface-2 disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={!next}
          className="press rounded-md bg-ink px-3.5 py-1.5 text-sm text-paper hover:opacity-85 disabled:opacity-40"
        >
          Continue →
        </button>
        <p aria-live="polite" className="ml-2 text-sm text-ink-3">
          Step {index + 1} of {stages.length}: {current.label}
        </p>
      </div>
    </DemoShell>
  );
}
