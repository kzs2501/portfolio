/**
 * One checkout, many brands. A brand is data: design tokens for how it looks,
 * module flags for what it offers. The checkout component never branches on
 * brand names — onboarding a new brand is a new object, not new code.
 *
 * All brands here are fictional. Money is integer cents throughout: floats
 * can't represent most cent values exactly, and checkouts must add up.
 */
export interface Brand {
  id: string;
  name: string;
  tokens: {
    accent: string;
    accentInk: string;
    surface: string;
    ink: string;
    muted: string;
    radius: string;
    font: "sans" | "serif" | "mono";
    button: "pill" | "square";
  };
  modules: { hasTradeIn: boolean; hasFinancing: boolean; hasProtection: boolean };
  cta: string;
}

export const BRANDS: readonly [Brand, ...Brand[]] = [
  {
    id: "northwind",
    name: "Northwind Motors",
    tokens: {
      accent: "oklch(0.45 0.09 200)",
      accentInk: "#ffffff",
      surface: "#ffffff",
      ink: "oklch(0.22 0.02 220)",
      muted: "oklch(0.5 0.02 220)",
      radius: "14px",
      font: "sans",
      button: "pill",
    },
    modules: { hasTradeIn: true, hasFinancing: true, hasProtection: true },
    cta: "Reserve now",
  },
  {
    id: "halden",
    name: "Halden",
    tokens: {
      accent: "oklch(0.42 0.12 330)",
      accentInk: "#ffffff",
      surface: "oklch(0.98 0.01 330)",
      ink: "oklch(0.24 0.03 330)",
      muted: "oklch(0.5 0.03 330)",
      radius: "2px",
      font: "serif",
      button: "square",
    },
    modules: { hasTradeIn: false, hasFinancing: true, hasProtection: false },
    cta: "Continue to payment",
  },
  {
    id: "vesper",
    name: "Vesper Auto",
    tokens: {
      accent: "oklch(0.8 0.14 75)",
      accentInk: "oklch(0.2 0.02 75)",
      surface: "oklch(0.22 0.012 260)",
      ink: "oklch(0.95 0.005 260)",
      muted: "oklch(0.72 0.01 260)",
      radius: "8px",
      font: "mono",
      button: "square",
    },
    modules: { hasTradeIn: true, hasFinancing: false, hasProtection: true },
    cta: "Place deposit",
  },
];

export const PRICES = {
  vehicle: 3_249_500,
  destination: 119_500,
  tradeInCredit: 850_000,
  hasProtection: 129_900,
} as const;

export interface LineItem {
  id: string;
  label: string;
  cents: number;
}

/** The summary is derived from the brand's modules — no `if (brand === …)` anywhere. */
export function buildSummary(brand: Brand): { items: LineItem[]; totalCents: number } {
  const items: LineItem[] = [
    { id: "vehicle", label: "2026 Sedan, Touring trim", cents: PRICES.vehicle },
    { id: "destination", label: "Destination & handling", cents: PRICES.destination },
  ];
  if (brand.modules.hasTradeIn) items.push({ id: "trade-in", label: "Trade-in credit", cents: -PRICES.tradeInCredit });
  if (brand.modules.hasProtection)
    items.push({ id: "protection", label: "Protection plan, 5 yr", cents: PRICES.hasProtection });
  return { items, totalCents: items.reduce((sum, i) => sum + i.cents, 0) };
}

/** Standard amortised monthly payment, returned in whole cents. */
export function monthlyPaymentCents(principalCents: number, aprPercent: number, months: number): number {
  const r = aprPercent / 100 / 12;
  if (r === 0) return Math.round(principalCents / months);
  return Math.round((principalCents * r) / (1 - Math.pow(1 + r, -months)));
}

export const formatUsd = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
