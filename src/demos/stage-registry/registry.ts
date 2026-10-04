/**
 * A toy version of a config-driven checkout. Every stage lives in one registry;
 * a stage declares *when* it applies, and the flow is whatever survives the
 * filter. Adding a payment rail means adding entries here — not touching the
 * flow, the navigation, or any other rail.
 */
export type Rail = "card" | "crypto" | "stock" | "fund";
export type Ctx = { rail: Rail; guest: boolean };

export type Stage = {
  id: string;
  label: string;
  /** Human-readable form of the predicate, shown in the demo. */
  rule: string;
  when?: (ctx: Ctx) => boolean;
};

export const rails: { value: Rail; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "crypto", label: "Crypto" },
  { value: "stock", label: "Stock" },
  { value: "fund", label: "Fund" },
];

export const registry: Stage[] = [
  { id: "amount", label: "Amount", rule: "always" },
  { id: "rail", label: "Choose how to give", rule: "always" },
  { id: "details", label: "Your details", rule: "ctx.guest", when: (c) => c.guest },
  { id: "card", label: "Card or wallet", rule: 'rail === "card"', when: (c) => c.rail === "card" },
  { id: "frequency", label: "One-off or monthly", rule: 'rail === "card"', when: (c) => c.rail === "card" },
  { id: "source", label: "Exchange or self-custody", rule: 'rail === "crypto"', when: (c) => c.rail === "crypto" },
  { id: "network", label: "Network", rule: 'rail === "crypto"', when: (c) => c.rail === "crypto" },
  { id: "brokerage", label: "Brokerage", rule: 'rail === "stock"', when: (c) => c.rail === "stock" },
  { id: "shares", label: "Asset and shares", rule: 'rail === "stock"', when: (c) => c.rail === "stock" },
  { id: "authorization", label: "Letter of authorization", rule: 'rail === "stock"', when: (c) => c.rail === "stock" },
  { id: "fund", label: "Donor-advised fund", rule: 'rail === "fund"', when: (c) => c.rail === "fund" },
  { id: "review", label: "Review", rule: "always" },
  { id: "processing", label: "Processing", rule: "always" },
  { id: "receipt", label: "Receipt", rule: "always" },
];

export const resolveStages = (ctx: Ctx, stages: Stage[] = registry) =>
  stages.filter((s) => !s.when || s.when(ctx));

/**
 * After the context changes, where should the user be? Stay on the same stage
 * if it still exists; otherwise land on the stage now at the same position,
 * never past the end. The user never loses progress they can keep.
 */
export function reconcileCurrent(prevId: string, prevIndex: number, next: Stage[]): string {
  if (next.some((s) => s.id === prevId)) return prevId;
  return next[Math.min(prevIndex, next.length - 1)].id;
}

/** Deep link for a position in the flow — refresh or share and you land here. */
export const deepLink = (ctx: Ctx, stageId: string) =>
  `/give?rail=${ctx.rail}${ctx.guest ? "&guest=1" : ""}&step=${stageId}`;
