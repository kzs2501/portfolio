import { describe, expect, it } from "vitest";
import type { SearchEntry } from "@/lib/search-sections";
import { buildIndex, MAX_HITS, searchWriting } from "./search";

const entry = (id: string, section: string, text: string): SearchEntry => ({
  id,
  href: `/notes/n/#${id}`,
  page: "Redirect races the webhook",
  kind: "Note",
  section,
  text,
});

const ENTRIES = [
  entry(
    "retries",
    "Retries that can’t charge twice",
    "Each attempt carries an idempotency key, so a retry is the same request.",
  ),
  entry("truth", "The webhook is the truth", "Every delivery is stored with its idempotency key and deduplicated."),
  entry("dialog", "A dialog for free", "A native dialog traps focus and closes on Escape."),
  entry("briefly", "Idempotency, briefly", "Why a key makes a request safe to repeat."),
  ...["one", "two", "three", "four"].map((name) => entry(name, `Keys, part ${name}`, `Another key, the ${name}th.`)),
];
const index = buildIndex(ENTRIES);
const ids = (query: string) => searchWriting(index, query).map((hit) => hit.id);

describe("searching the writing", () => {
  it("finds a word through a typo, and from its start", () => {
    expect(ids("idempotncy")).toEqual(expect.arrayContaining(["retries", "truth", "briefly"]));
    expect(ids("idemp")).toEqual(expect.arrayContaining(["retries", "truth", "briefly"]));
  });

  it("needs every word", () => {
    expect(ids("focus escape")).toEqual(["dialog"]);
    expect(ids("idempotency dialog")).toEqual([]);
  });

  it("ranks a match in a section's title above one in its text", () => {
    expect(ids("idempotency")[0]).toBe("briefly");
  });

  it("shows at most five, and nothing for a single letter", () => {
    expect(ids("key")).toHaveLength(MAX_HITS);
    expect(ids("k")).toEqual([]);
  });

  it("marks the words it matched in the excerpt", () => {
    const [hit] = searchWriting(index, "deduplicated");
    expect(hit).toMatchObject({ id: "truth", href: "/notes/n/#truth", section: "The webhook is the truth" });
    expect(hit?.excerpt.filter((segment) => segment.isMatch).map((segment) => segment.text)).toEqual(["deduplicated"]);
  });
});
