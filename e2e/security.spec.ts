/**
 * The site is static, so its security headers come from the host (`vercel.json`), not
 * from Next.js. These tests serve every page with exactly those headers and check that
 * the Content Security Policy is enforced and that nothing on the site trips it.
 */
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { loadDemos, ROUTES } from "./site";

interface HostHeader {
  key: string;
  value: string;
}

const isHostHeader = (value: unknown): value is HostHeader =>
  typeof value === "object" &&
  value !== null &&
  "key" in value &&
  "value" in value &&
  typeof value.key === "string" &&
  typeof value.value === "string";

/** The headers `vercel.json` sends with every path. */
function hostHeaders(): Record<string, string> {
  const config: unknown = JSON.parse(readFileSync("vercel.json", "utf8"));
  const rules: unknown[] =
    typeof config === "object" && config !== null && "headers" in config && Array.isArray(config.headers)
      ? config.headers
      : [];
  const everyPath = rules.find(
    (rule) => typeof rule === "object" && rule !== null && "source" in rule && rule.source === "/(.*)",
  );
  const headers: unknown[] =
    typeof everyPath === "object" && everyPath !== null && "headers" in everyPath && Array.isArray(everyPath.headers)
      ? everyPath.headers
      : [];
  return Object.fromEntries(headers.filter(isHostHeader).map(({ key, value }) => [key.toLowerCase(), value]));
}

const HOST_HEADERS = hostHeaders();

declare global {
  interface Window {
    reportCspViolation?: (violation: string) => Promise<void>;
  }
}

/**
 * Serve every response as the host would, and collect every policy violation. Listens
 * for the browser's `securitypolicyviolation` events rather than console errors: a
 * blocked call the page catches is still a violation, but logs nothing.
 */
async function asTheHostServesIt(page: Page) {
  await page.route("**/*", async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), ...HOST_HEADERS } });
  });
  const violations: string[] = [];
  await page.exposeFunction("reportCspViolation", (violation: string) => {
    violations.push(violation);
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      void window.reportCspViolation?.(
        `${event.effectiveDirective} blocked ${event.blockedURI} in ${event.sourceFile}`,
      );
    });
  });
  return violations;
}

test("vercel.json sends a content security policy and the other security headers", () => {
  expect(HOST_HEADERS["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(HOST_HEADERS["content-security-policy"]).toContain("object-src 'none'");
  expect(HOST_HEADERS["x-content-type-options"]).toBe("nosniff");
  expect(HOST_HEADERS["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});

test("no page breaks the content security policy, demos included", async ({ page }) => {
  const violations = await asTheHostServesIt(page);
  for (const route of ROUTES) {
    await page.goto(route);
    await loadDemos(page);
  }
  expect(violations).toEqual([]);
});

test("the policy is enforced: a connection to another origin is refused", async ({ page }) => {
  await asTheHostServesIt(page);
  await page.goto("/");
  // A failed fetch alone proves nothing (CORS or no network would fail it too); the
  // browser's violation event does.
  const violatedDirective = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        document.addEventListener(
          "securitypolicyviolation",
          (event) => {
            resolve(event.effectiveDirective);
          },
          { once: true },
        );
        void fetch("https://example.com", { mode: "no-cors" }).catch(() => undefined);
      }),
  );
  expect(violatedDirective).toBe("connect-src");
});
