// Fails while any claim in content-review/ is still unticked.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = new URL("../content-review/", import.meta.url).pathname;
let open = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md")) {
  const lines = readFileSync(join(dir, file), "utf8").split("\n");
  const unticked = lines.filter((l) => /^\s*- \[ \]/.test(l));
  if (unticked.length) {
    console.log(`\n${file} — ${unticked.length} unconfirmed`);
    for (const l of unticked) console.log("  " + l.trim().replace(/^- \[ \] /, "· "));
    open += unticked.length;
  }
}
if (open) {
  console.error(`\n✗ ${open} claims still need your confirmation before launch.`);
  process.exit(1);
}
console.log("✓ Every claim confirmed.");
