import { describe, expect, it } from "vitest";
import { brands, buildSummary, formatUSD, monthlyPaymentCents, PRICES } from "./brands";

const byId = (id: string) => brands.find((b) => b.id === id)!;

describe("brand-driven checkout", () => {
  it("includes only the modules a brand enables", () => {
    const ids = (id: string) => buildSummary(byId(id)).items.map((i) => i.id);
    expect(ids("northwind")).toEqual(["vehicle", "destination", "trade-in", "protection"]);
    expect(ids("halden")).toEqual(["vehicle", "destination"]);
    expect(ids("vesper")).toEqual(["vehicle", "destination", "trade-in", "protection"]);
  });

  it("totals line items exactly, in integer cents", () => {
    const { totalCents } = buildSummary(byId("northwind"));
    expect(totalCents).toBe(PRICES.vehicle + PRICES.destination - PRICES.tradeInCredit + PRICES.protection);
    expect(Number.isInteger(totalCents)).toBe(true);
  });

  it("subtracts trade-in credit rather than adding it", () => {
    const tradeIn = buildSummary(byId("vesper")).items.find((i) => i.id === "trade-in")!;
    expect(tradeIn.cents).toBeLessThan(0);
  });

  it("computes an amortised monthly payment", () => {
    // $20,000 at 6% APR over 60 months = $386.66/mo
    expect(monthlyPaymentCents(2_000_000, 6, 60)).toBe(38_666);
  });

  it("handles a zero-interest promotion without dividing by zero", () => {
    expect(monthlyPaymentCents(1_200_000, 0, 12)).toBe(100_000);
  });

  it("formats cents as dollars", () => {
    expect(formatUSD(3_249_500)).toBe("$32,495.00");
    expect(formatUSD(-850_000)).toBe("-$8,500.00");
  });

  it("gives every brand a distinct id and every token a value", () => {
    expect(new Set(brands.map((b) => b.id)).size).toBe(brands.length);
    for (const b of brands) for (const v of Object.values(b.tokens)) expect(v).toBeTruthy();
  });
});
