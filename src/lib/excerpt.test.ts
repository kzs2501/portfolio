import { describe, expect, it } from "vitest";
import { excerptOf } from "./excerpt";

const joined = (segments: { text: string }[]) => segments.map((segment) => segment.text).join("");
const marked = (segments: { text: string; isMatch: boolean }[]) =>
  segments.filter((segment) => segment.isMatch).map((segment) => segment.text);

const LONG =
  "Payments fail in many ways. A card can be declined, a network can drop, and a buyer can press pay twice. Each attempt carries an idempotency key, so a retry is the same request, and the server answers it once. Keys expire after a day.";

describe("an excerpt", () => {
  it("shows the text around the first match, cut at words, with ellipses where it was cut", () => {
    const segments = excerptOf(LONG, ["idempotency"], 80);
    expect(joined(segments)).toBe("…pay twice. Each attempt carries an idempotency key, so a retry is the same…");
    expect(marked(segments)).toEqual(["idempotency"]);
  });

  it("marks every matched word in the window, whatever its case, and only whole words", () => {
    const segments = excerptOf("Keys expire. A key is a key; monkey isn't one.", ["key", "keys"]);
    expect(marked(segments)).toEqual(["Keys", "key", "key"]);
  });

  it("shows the start of the text when the words matched only the title", () => {
    expect(joined(excerptOf(LONG, ["checkout"], 40))).toBe("Payments fail in many ways. A card can…");
  });

  it("shows short text whole", () => {
    expect(excerptOf("Ignore it.", ["ignore"])).toEqual([
      { text: "Ignore", isMatch: true },
      { text: " it.", isMatch: false },
    ]);
  });

  it("takes terms literally, not as patterns", () => {
    expect(marked(excerptOf("Use a.b here, not axb.", ["a.b"]))).toEqual(["a.b"]);
  });
});
