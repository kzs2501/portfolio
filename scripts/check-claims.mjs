// Fails while any claim in content-review/ is still unticked.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = new URL("../content-review/", import.meta.url).pathname;

// The checklist is private and gitignored, so a fresh clone or CI won't have it.
if (!existsSync(dir)) {
  console.log("No content-review/ folder (it's local-only) — skipping the claims check.");
  process.exit(0);
}
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
