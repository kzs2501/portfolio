import { describe, expect, it } from "vitest";
import { formatClock, formatUtcOffset, relativeToVisitor, zoneOffsetMinutes } from "./local-time";

const at = new Date("2026-10-05T16:11:00Z"); // 21:41 in Bengaluru

describe("local time", () => {
  it("formats the clock in Bengaluru, with a lower-case, non-breaking am/pm", () => {
    expect(formatClock(at)).toBe("9:41 pm");
  });

  it("formats other zones too", () => {
    expect(formatClock(at, "UTC")).toBe("4:11 pm");
  });

  it("reads zone offsets, including half-hour and negative ones", () => {
    expect(zoneOffsetMinutes(at, "Asia/Kolkata")).toBe(330);
    expect(zoneOffsetMinutes(at, "UTC")).toBe(0);
    expect(zoneOffsetMinutes(at, "America/New_York")).toBe(-240); // EDT in October
  });

  it("formats offsets as UTC±h[:mm]", () => {
    expect(formatUtcOffset(330)).toBe("UTC+5:30");
    expect(formatUtcOffset(-240)).toBe("UTC−4");
    expect(formatUtcOffset(0)).toBe("UTC+0");
  });

  it("describes the gap relative to the visitor", () => {
    expect(relativeToVisitor(330, 0)).toBe("5h 30m ahead of you");
    expect(relativeToVisitor(330, -240)).toBe("9h 30m ahead of you");
    expect(relativeToVisitor(330, 540)).toBe("3h 30m behind you"); // Tokyo
    expect(relativeToVisitor(330, 300)).toBe("30m ahead of you");
  });

  it("says nothing when the visitor shares the offset", () => {
    expect(relativeToVisitor(330, 330)).toBeNull();
  });
});
