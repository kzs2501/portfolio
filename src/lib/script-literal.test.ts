import { describe, expect, it } from "vitest";
import { scriptLiteral } from "./script-literal";

const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

describe("scriptLiteral", () => {
  it("can't close the script it's written into", () => {
    const literal = scriptLiteral("</script><script>alert(1)</script>");
    expect(literal).not.toMatch(/[<>]/);
    // Still the same string to JavaScript.
    expect(JSON.parse(literal)).toBe("</script><script>alert(1)</script>");
  });

  it("escapes the line separators and ampersands, and leaves ordinary values readable", () => {
    const literal = scriptLiteral(`a${LINE_SEPARATOR}b${PARAGRAPH_SEPARATOR}c&d`);
    expect(literal).not.toContain(LINE_SEPARATOR);
    expect(literal).not.toContain(PARAGRAPH_SEPARATOR);
    expect(literal).not.toContain("&");
    expect(JSON.parse(literal)).toBe(`a${LINE_SEPARATOR}b${PARAGRAPH_SEPARATOR}c&d`);
    expect(scriptLiteral("#faf7f2")).toBe('"#faf7f2"');
  });
});
