import { describe, expect, it } from "vitest";
import { BRANDS, buildSummary, formatUsd, monthlyPaymentCents, PRICES } from "./brand-tokens";

function byId(id: string) {
  const brand = BRANDS.find((candidate) => candidate.id === id);
  if (!brand) throw new Error(`No brand ${id}`);
  return brand;
}

describe("brand-driven checkout", () => {
  it("includes only the modules a brand enables", () => {
    const ids = (id: string) => buildSummary(byId(id)).items.map((i) => i.id);
    expect(ids("northwind")).toEqual(["vehicle", "destination", "trade-in", "protection"]);
    expect(ids("halden")).toEqual(["vehicle", "destination"]);
    expect(ids("vesper")).toEqual(["vehicle", "destination", "trade-in", "protection"]);
  });

  it("totals line items exactly, in integer cents", () => {
    const { totalCents } = buildSummary(byId("northwind"));
    expect(totalCents).toBe(PRICES.vehicle + PRICES.destination - PRICES.tradeInCredit + PRICES.hasProtection);
    expect(Number.isInteger(totalCents)).toBe(true);
  });

  it("subtracts trade-in credit rather than adding it", () => {
    const tradeIn = buildSummary(byId("vesper")).items.find((item) => item.id === "trade-in");
    expect(tradeIn?.cents).toBeLessThan(0);
  });

  it("computes an amortised monthly payment", () => {
    // $20,000 at 6% APR over 60 months = $386.66/mo
    expect(monthlyPaymentCents(2_000_000, 6, 60)).toBe(38_666);
  });

  it("handles a zero-interest promotion without dividing by zero", () => {
    expect(monthlyPaymentCents(1_200_000, 0, 12)).toBe(100_000);
  });

  it("formats cents as dollars", () => {
    expect(formatUsd(3_249_500)).toBe("$32,495.00");
    expect(formatUsd(-850_000)).toBe("-$8,500.00");
  });

  it("gives every brand a distinct id and every token a value", () => {
    expect(new Set(BRANDS.map((b) => b.id)).size).toBe(BRANDS.length);
    for (const b of BRANDS) for (const v of Object.values(b.tokens)) expect(v).toBeTruthy();
  });
});
