import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as Search from "./search";

const ENTRY = {
  id: "notes/n#retries",
  href: "/notes/n/#retries",
  page: "Redirect races the webhook",
  kind: "Note",
  section: "Retries",
  text: "Each attempt carries an idempotency key.",
};

let search: typeof Search;
beforeEach(async () => {
  // The index is fetched once per page; each test starts as a fresh page would.
  vi.resetModules();
  search = await import("./search");
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the writing's index, as the palette sees it (PF-06)", () => {
  it("says it's loading from the moment a fetch starts, and when it's ready", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(Response.json([ENTRY])));
    const seen: string[] = [];
    search.writingStore.subscribe(() => seen.push(search.writingStore.getSnapshot().status));
    expect(search.writingStore.getSnapshot().status).toBe("idle");
    const loading = search.loadSearch();
    expect(search.writingStore.getSnapshot().status).toBe("loading");
    await loading;
    expect(seen).toEqual(["loading", "ready"]);
  });

  it("after a failure, says it's loading again while the retry runs", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("no", { status: 404 })));
    await expect(search.loadSearch()).rejects.toThrow("404");
    expect(search.writingStore.getSnapshot().status).toBe("failed");

    vi.stubGlobal("fetch", () => Promise.resolve(Response.json([ENTRY])));
    const retry = search.loadSearch();
    expect(search.writingStore.getSnapshot().status).toBe("loading");
    await retry;
    const state = search.writingStore.getSnapshot();
    expect(state.status).toBe("ready");
    if (state.status === "ready") expect(search.searchWriting(state.index, "idempotency")).toHaveLength(1);
  });
});
