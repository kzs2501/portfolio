"use client";

import { startTransition, useState, ViewTransition, type CSSProperties } from "react";
import { DemoShell, Segmented } from "../shared/controls";
import { brands, buildSummary, formatUSD, monthlyPaymentCents, type Brand } from "./brands";

const fontFamily: Record<Brand["tokens"]["font"], string> = {
  sans: "var(--font-sans)",
  serif: "var(--font-serif)",
  mono: "var(--font-mono)",
};

/** The one checkout component. It reads tokens and modules — never brand names. */
function CheckoutSummary({ brand }: { brand: Brand }) {
  const { tokens: t, modules } = brand;
  const { items, totalCents } = buildSummary(brand);
  const style = {
    "--b-accent": t.accent,
    "--b-accent-ink": t.accentInk,
    "--b-surface": t.surface,
    "--b-ink": t.ink,
    "--b-muted": t.muted,
    "--b-radius": t.radius,
    fontFamily: fontFamily[t.font],
  } as CSSProperties;

  return (
    <div
      style={style}
      className="rounded-[var(--b-radius)] border border-black/10 bg-[var(--b-surface)] p-5 text-[var(--b-ink)] shadow-sm"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-lg font-semibold">{brand.name}</p>
        <p className="text-xs text-[var(--b-muted)]">Order summary</p>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span className="text-[var(--b-muted)]">{item.label}</span>
            <span className="tabular-nums">{formatUSD(item.cents)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between border-t border-current/15 pt-3 font-semibold">
        <span>Total</span>
        <span className="tabular-nums">{formatUSD(totalCents)}</span>
      </div>
      {modules.financing && (
        <p className="mt-2 text-xs text-[var(--b-muted)]">
          or about <span className="tabular-nums">{formatUSD(monthlyPaymentCents(totalCents, 5.9, 60))}</span>/mo over 60
          months at 5.9% APR
        </p>
      )}
      <button
        type="button"
        tabIndex={-1}
        className={`mt-5 w-full bg-[var(--b-accent)] py-2.5 text-sm font-medium text-[var(--b-accent-ink)] ${
          t.button === "pill" ? "rounded-full" : "rounded-[var(--b-radius)]"
        }`}
      >
        {brand.cta}
      </button>
    </div>
  );
}

export default function BrandTokensDemo() {
  const [id, setId] = useState(brands[0].id);
  const brand = brands.find((b) => b.id === id)!;

  const config = JSON.stringify({ name: brand.name, tokens: brand.tokens, modules: brand.modules, cta: brand.cta }, null, 2);

  return (
    <DemoShell
      title="One checkout, many brands"
      intro="Three fictional brands, one checkout component. Each brand is a config object — tokens for how it looks, flags for what it offers. Switching brands changes data, not code."
    >
      <Segmented
        label="Brand"
        value={id}
        options={brands.map((b) => ({ value: b.id, label: b.name }))}
        onChange={(next) => startTransition(() => setId(next))}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="num mb-2 text-[10px] tracking-[0.16em] text-ink-3 uppercase">Rendered checkout</p>
          <ViewTransition name="brand-card">
            <div aria-live="polite" aria-label={`${brand.name} checkout preview`}>
              <CheckoutSummary brand={brand} />
            </div>
          </ViewTransition>
        </div>
        <div>
          <p className="num mb-2 text-[10px] tracking-[0.16em] text-ink-3 uppercase">The entire brand definition</p>
          <pre tabIndex={0} aria-label="Brand definition" className="max-h-[22rem] overflow-auto rounded-lg border border-rule bg-paper p-3.5 font-mono text-[11px] leading-relaxed text-ink">
            {config}
          </pre>
        </div>
      </div>
    </DemoShell>
  );
}
