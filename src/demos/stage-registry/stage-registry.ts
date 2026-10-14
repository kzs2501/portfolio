/**
 * A toy version of a config-driven checkout. Every stage lives in one registry;
 * a stage declares *when* it applies, and the flow is whatever survives the
 * filter. Adding a payment rail means adding entries here — not touching the
 * flow, the navigation, or any other rail.
 */
export type Rail = "card" | "crypto" | "stock" | "fund";
/** What the flow depends on: the payment rail, and whether the donor is signed in. */
export interface FlowContext {
  rail: Rail;
  isGuest: boolean;
}

export interface Stage {
  id: string;
  label: string;
  /** Human-readable form of the predicate, shown in the demo. */
  rule: string;
  when?: (context: FlowContext) => boolean;
}

export const RAILS: readonly { value: Rail; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "crypto", label: "Crypto" },
  { value: "stock", label: "Stock" },
  { value: "fund", label: "Fund" },
];

export const STAGE_REGISTRY: readonly Stage[] = [
  { id: "amount", label: "Amount", rule: "always" },
  { id: "rail", label: "Choose how to give", rule: "always" },
  { id: "details", label: "Your details", rule: "isGuest", when: (context) => context.isGuest },
  { id: "card", label: "Card or wallet", rule: 'rail === "card"', when: (context) => context.rail === "card" },
  { id: "frequency", label: "One-off or monthly", rule: 'rail === "card"', when: (context) => context.rail === "card" },
  {
    id: "source",
    label: "Exchange or self-custody",
    rule: 'rail === "crypto"',
    when: (context) => context.rail === "crypto",
  },
  { id: "network", label: "Network", rule: 'rail === "crypto"', when: (context) => context.rail === "crypto" },
  { id: "brokerage", label: "Brokerage", rule: 'rail === "stock"', when: (context) => context.rail === "stock" },
  { id: "shares", label: "Asset and shares", rule: 'rail === "stock"', when: (context) => context.rail === "stock" },
  {
    id: "authorization",
    label: "Letter of authorization",
    rule: 'rail === "stock"',
    when: (context) => context.rail === "stock",
  },
  { id: "fund", label: "Donor-advised fund", rule: 'rail === "fund"', when: (context) => context.rail === "fund" },
  { id: "review", label: "Review", rule: "always" },
  { id: "processing", label: "Processing", rule: "always" },
  { id: "receipt", label: "Receipt", rule: "always" },
];

export const resolveStages = (context: FlowContext, stages: readonly Stage[] = STAGE_REGISTRY) =>
  stages.filter((stage) => !stage.when || stage.when(context));

/**
 * After the context changes, where should the user be? Stay on the same stage
 * if it still exists; otherwise land on the stage now at the same position,
 * never past the end. The user never loses progress they can keep.
 */
export function reconcileCurrent(prevId: string, prevIndex: number, next: readonly Stage[]): string {
  if (next.some((stage) => stage.id === prevId)) return prevId;
  // Every flow has stages (amount and rail always apply); keep the old id if not.
  return next[Math.min(prevIndex, next.length - 1)]?.id ?? prevId;
}

/** Deep link for a position in the flow — refresh or share and you land here. */
export const deepLink = (context: FlowContext, stageId: string) =>
  `/give?rail=${context.rail}${context.isGuest ? "&guest=1" : ""}&step=${stageId}`;
