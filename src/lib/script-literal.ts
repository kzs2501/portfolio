/**
 * A string as a JavaScript literal that's safe to write into an inline `<script>`.
 * JSON.stringify makes a valid literal, but leaves `<`, `>` and `&` as they are, so a
 * value containing `</script>` would end the script early, and U+2028/U+2029, which
 * older engines read as line breaks. Escaping them keeps the value inside its string.
 */
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

export const scriptLiteral = (value: string) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replaceAll(LINE_SEPARATOR, "\\u2028")
    .replaceAll(PARAGRAPH_SEPARATOR, "\\u2029");
