import { describe, expect, it } from "vitest";
import { apcaContrast, isInSrgbGamut, oklchToSrgb, toHex, wcagRatio } from "./contrast";

const WHITE = [1, 1, 1] as const;
const BLACK = [0, 0, 0] as const;
const GREY_888 = [0x88 / 255, 0x88 / 255, 0x88 / 255] as const;

describe("contrast", () => {
  // Reference values: WCAG's definition, and APCA's own test values for 0.0.98G-4g.
  it("matches WCAG's ratios", () => {
    expect(wcagRatio(BLACK, WHITE)).toBeCloseTo(21, 5);
    expect(wcagRatio(GREY_888, WHITE)).toBeCloseTo(3.54, 2);
    expect(wcagRatio(WHITE, GREY_888)).toBeCloseTo(3.54, 2);
  });

  it("matches APCA's reference values, in both polarities", () => {
    expect(apcaContrast(BLACK, WHITE)).toBeCloseTo(106.04, 1);
    expect(apcaContrast(WHITE, BLACK)).toBeCloseTo(107.88, 1);
    expect(apcaContrast(GREY_888, WHITE)).toBeCloseTo(63.06, 1);
  });

  it("converts OKLCH as CSS does", () => {
    // oklch(1 0 0) is white, oklch(0 0 0) black, and oklch(0.6279 0.2577 29.23) is #ff0000.
    expect(toHex(oklchToSrgb([1, 0, 0]))).toBe("#ffffff");
    expect(toHex(oklchToSrgb([0, 0, 0]))).toBe("#000000");
    expect(toHex(oklchToSrgb([0.6279, 0.2577, 29.23]))).toBe("#ff0000");
  });

  it("knows which colours sRGB can show", () => {
    expect(isInSrgbGamut([0.6279, 0.2577, 29.23])).toBe(true);
    // Display P3's red, well past sRGB's.
    expect(isInSrgbGamut([0.6487, 0.2995, 28.96])).toBe(false);
    expect(isInSrgbGamut([0.5, 0, 0])).toBe(true);
  });
});
