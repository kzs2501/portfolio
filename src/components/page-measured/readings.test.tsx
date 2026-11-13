import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Measurements } from "@/lib/web-vitals";
import { ReadingsView } from "./readings";

const CHROME: Measurements = {
  firstPath: "/",
  arrival: "navigate",
  support: { hasLcp: true, hasCls: true, hasInp: true, hasSoftNavigations: true },
  lcpMs: 412,
  ttfbMs: 38,
  inpMs: 24,
  cls: 0.003,
  softNavigations: {},
  downloaded: { bytes: 142_400, requests: 18, scriptBytes: 96_100, fromCache: 0 },
};
/** Safari and Firefox: no layout shifts, no soft navigations. */
const SAFARI: Measurements = {
  ...CHROME,
  support: { hasLcp: true, hasCls: false, hasInp: true, hasSoftNavigations: false },
};

function view(measurements: Measurements | null, { pathname = "/", hasNavigated = false } = {}) {
  render(<ReadingsView measurements={measurements} pathname={pathname} hasNavigated={hasNavigated} />);
}
/** What a row says, by its term. */
const said = (term: string) => screen.getByText(term, { selector: "dt" }).nextElementSibling?.textContent;

describe("this page, measured", () => {
  it("shows a full load's measurements, rated, beside the budgets CI holds", () => {
    view(CHROME);
    expect(said("How you got here")).toBe("A full load.");
    expect(screen.getByText("This page’s load")).toBeInTheDocument();
    expect(said("Largest paint (LCP)")).toBe("412 ms Good");
    expect(said("First byte (TTFB)")).toBe("38 ms Good");
    expect(said("Layout shift (CLS)")).toBe("0.00 Good");
    expect(said("Slowest response (INP)")).toBe("24 ms Good");
    expect(said("Downloaded")).toBe("142 KB in 18 requests, 96 KB of it script.");
    expect(screen.getByText(/CI fails if Lighthouse measures LCP over 2 s or CLS over 0\.05/u)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "the budgets" })).toHaveAttribute(
      "href",
      "https://github.com/kzs2501/portfolio/blob/main/lighthouse/desktop.json",
    );
  });

  it("rates in words, so colour is never all there is", () => {
    view({ ...CHROME, lcpMs: 3100, inpMs: 620, cls: 0.12 });
    expect(said("Largest paint (LCP)")).toBe("3.10 s Needs work");
    expect(said("Slowest response (INP)")).toBe("620 ms Poor");
    expect(said("Layout shift (CLS)")).toBe("0.12 Needs work");
  });

  it("says plainly what a browser doesn't report", () => {
    view(SAFARI);
    expect(said("Layout shift (CLS)")).toBe("Your browser doesn’t report layout shifts; Chromium-based browsers do.");
    expect(said("Largest paint (LCP)")).toBe("412 ms Good");
  });

  it("waits for what hasn't happened yet", () => {
    view({ ...CHROME, lcpMs: null, inpMs: null });
    expect(said("Largest paint (LCP)")).toBe("Not reported yet.");
    expect(said("Slowest response (INP)")).toBe("Click, tap or press a key to measure.");
  });

  it("is measuring until the first snapshot", () => {
    view(null);
    expect(screen.getByText("Measuring…")).toBeInTheDocument();
  });

  describe("a page opened in the app, without a full load", () => {
    it("gives Chrome's time from the click to the new content", () => {
      view({ ...CHROME, softNavigations: { "/about": 70.4 } }, { pathname: "/about/", hasNavigated: true });
      expect(said("How you got here")).toBe(
        "Opened in the app, without a full load: the new content painted 70 ms after your click.",
      );
      expect(screen.getByText("The page you loaded first (/)")).toBeInTheDocument();
    });

    it("says so without a number where the browser doesn't time it", () => {
      view(SAFARI, { pathname: "/about/", hasNavigated: true });
      expect(said("How you got here")).toBe(
        "Opened in the app, without a full load. Your browser doesn’t time these; Chrome does.",
      );
    });

    it("says so without a number before Chrome's timing arrives", () => {
      view(CHROME, { pathname: "/about/", hasNavigated: true });
      expect(said("How you got here")).toBe("Opened in the app, without a full load.");
    });

    it("counts a return to the first page as one, too", () => {
      view({ ...CHROME, softNavigations: { "/": 52 } }, { pathname: "/", hasNavigated: true });
      expect(said("How you got here")).toMatch(/^Opened in the app, without a full load: .* 52 ms /u);
    });
  });

  it.each([
    ["reload", "Reloaded."],
    ["back-forward", "Back or forward, loaded again."],
    ["restored", "Restored from your browser’s back/forward cache, so it showed at once."],
    ["prerendered", "Prerendered before you clicked, so it showed at once."],
  ] as const)("tells a page that arrived by %s", (arrival, sentence) => {
    view({ ...CHROME, arrival });
    expect(said("How you got here")).toBe(sentence);
  });

  it("counts what the browser's cache answered, and a single request", () => {
    view({ ...CHROME, downloaded: { bytes: 640, requests: 1, scriptBytes: 0, fromCache: 1 } });
    expect(said("Downloaded")).toBe("640 B in 1 request, 0 B of it script; 1 from your browser’s cache.");
  });
});
