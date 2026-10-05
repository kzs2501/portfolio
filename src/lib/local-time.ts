/** Where Kshitiz is. Everything below is pure, so it's unit-testable. */
// India has no daylight saving, so the offset is a constant and safe to render on
// the server; the live clock itself only renders after hydration.
export const HOME = { city: "Bengaluru", timeZone: "Asia/Kolkata", abbr: "IST", offsetMinutes: 330 } as const;

/** "9:41 pm" in the given time zone. */
export function formatClock(date: Date, timeZone: string = HOME.timeZone): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(/\s?(am|pm)$/i, (m) => m.toLowerCase().replace(/^\s?/, " "));
}

/** Offset of a time zone from UTC, in minutes (IST → 330). */
export function zoneOffsetMinutes(date: Date, timeZone: string): number {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value;
  // "GMT+05:30", "GMT-04:00", or plain "GMT" for UTC itself.
  const m = part?.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

/** "UTC+5:30" */
export function formatUtcOffset(minutes: number): string {
  const sign = minutes < 0 ? "−" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

/**
 * How far ahead or behind home is relative to the visitor, e.g. "4h 30m ahead of
 * you". Null when the visitor is in the same offset — then there's nothing to say.
 */
export function relativeToVisitor(homeOffset: number, visitorOffset: number): string | null {
  const diff = homeOffset - visitorOffset;
  if (diff === 0) return null;
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const span = [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
  return `${span} ${diff > 0 ? "ahead of" : "behind"} you`;
}
