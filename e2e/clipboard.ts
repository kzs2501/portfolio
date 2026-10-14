import type { BrowserContext, Page } from "@playwright/test";

/**
 * Lets a test read back what the page copied, on every engine.
 *
 * Chromium can grant real clipboard permissions under automation, so there we read
 * the actual system clipboard. WebKit and Firefox can't, so we record what the page
 * passes to navigator.clipboard.writeText instead — which still proves the app copies
 * the right text. Call before page.goto (it installs an init script).
 */
export async function clipboardReader(page: Page, context: BrowserContext, browserName: string) {
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    return () => page.evaluate(() => navigator.clipboard.readText());
  }
  await page.addInitScript(() => {
    const copied: string[] = [];
    Object.defineProperty(window, "capturedClipboardWrites", { value: copied });
    Object.defineProperty(navigator.clipboard, "writeText", {
      value: (text: string) => {
        copied.push(text);
        return Promise.resolve();
      },
    });
  });
  return () =>
    page.evaluate(
      () => (window as unknown as { capturedClipboardWrites: string[] }).capturedClipboardWrites.at(-1) ?? "",
    );
}
