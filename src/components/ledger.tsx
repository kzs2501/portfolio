import type { ReactNode } from "react";

/** Receipt-style facts: `Role ........ Founding engineer`. */
export function Ledger({ rows, caption }: { rows: { label: string; value: ReactNode }[]; caption?: string }) {
  return (
    <dl aria-label={caption} className="space-y-2 text-sm">
      {rows.map(({ label, value }) => (
        <div key={label} className="leader">
          <dt className="shrink-0 text-ink-3">{label}</dt>
          <span aria-hidden="true" className="leader-fill" />
          <dd className="text-right text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A thin section heading in the ledger style: small caps label + hairline. */
export function SectionLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <div className="flex items-center gap-4">
      <h2 id={id} className="num shrink-0 text-xs tracking-[0.18em] text-ink-3 uppercase">
        {children}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-rule" />
    </div>
  );
}
