# kshitizsonakiya — portfolio

Source for my portfolio: three case studies, a few technical notes, four interactive
demos that rebuild the ideas behind private production work from scratch, with fake data,
and a page for [admit-one](https://github.com/Punisher666/admit-one), an open-source
ticketing checkout.

**Stack:** Next.js 16 (App Router, static export) · React 19 · TypeScript (strict) ·
Tailwind CSS 4 · MDX · Vitest · Playwright + axe · Lighthouse CI.

## What's worth a look

- **Demos as pure logic plus a thin UI.** Each demo's behaviour lives in a plain,
  unit-tested module, such as [`stage-registry/stage-registry.ts`](src/demos/stage-registry/stage-registry.ts)
  and [`single-flight/single-flight.ts`](src/demos/single-flight/single-flight.ts). The React
  layer only renders it. The tests assert the claims the case studies make, e.g.
  "however many requests 401, the refresh endpoint is called once."
- **Demos cost nothing until you approach them.** [`Demo`](src/components/demo.tsx)
  reserves its height (no layout shift) and dynamically imports the demo when it comes
  within 300px of the viewport.
- **A hand-built ⌘K palette.** Native `<dialog>` with `showModal()` for the focus trap,
  inert background and Escape handling; the ARIA combobox pattern inside; the dialog's
  code loads on first use or on hovering the trigger. See
  [`command-palette/`](src/components/command-palette).
- **Motion from the platform, not a library.** React's `<ViewTransition>` animates
  route changes and demo state, and the theme switch reveals from the toggle button. All
  of it switches off under `prefers-reduced-motion`, and every demo has a keyboard Step
  mode.
- **A theme without the flash.** A tiny inline script resolves the theme before first
  paint; components read it with `useSyncExternalStore`, so there's no hydration
  mismatch.
- **Integer cents.** The checkout demo never touches floating-point money.
- **Feel, from published guidelines.** Motion follows Emil Kowalski's and Vercel's
  interface rules: ease-out, under 300ms, transform and opacity only, and none at all
  on things used constantly (the palette opens instantly). Details include:
  - case-study titles that morph into their headline;
  - a reading-progress rule and a header that firms up on scroll, both pure CSS
    scroll-driven animations behind `@supports`;
  - a contents sidebar whose active section is computed from geometry, not event
    order;
  - copyable heading anchors;
  - curly typography enforced by a test;
  - a live IST clock that tells remote visitors the time difference.

## Quality gates

| Check                  | What it enforces                                                                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`             | 51 unit tests: demo logic, palette ranking, contents extraction, local time, content typography                                                                                               |
| `npm run test:e2e`     | 44 browser tests: axe (WCAG 2.2 AA) on every route in light and dark, keyboard paths, 375px layout, reduced motion, demo behaviour, navigation scroll, contents, anchors, clipboard, timezone |
| `npm run lhci`         | Lighthouse ≥ 95 in every category, CLS ≤ 0.05                                                                                                                                                 |
| `npm run test:e2e:all` | The same browser suite on Chromium, WebKit (Safari's engine) and Firefox — 132 tests                                                                                                          |
| CI                     | All of the above on every push and pull request (browser tests on Chromium)                                                                                                                   |

Desktop Lighthouse: 100 / 100 / 100 / 100 on every audited page. Mobile (`npx lhci autorun --config=lighthouserc.mobile.json`: simulated slow 4G and 4× CPU, 5 runs per page): performance 96–99 and 100 for the other three, with LCP between 2.1s and 2.8s depending on the run.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
npm start          # serve out/ locally
```

## Layout

```
src/
  app/              routes: home, /work/[slug], /notes/[slug], /projects/[slug], /about, OG images, RSS
  content/          the typed content index + case-study, note and project MDX
  components/       layout, ledger primitives, demo loader, ⌘K palette
  demos/            each demo: <name>.ts (pure logic) + <name>.test.ts + demo.tsx
e2e/                Playwright + axe
```

## Content review

Before launch, every factual claim in the case studies is checked against a private,
gitignored checklist (`content-review/`, kept only on my machine). `npm run check:claims`
fails until each one is confirmed, and `npm run prelaunch` runs it together with lint,
type-check, tests and the build. On a fresh clone the check is skipped.

## Deploying

Static output, so any host works. On Vercel: import the repo, set
`NEXT_PUBLIC_SITE_URL` to the production URL, and deploy. Vercel Analytics is enabled
automatically on Vercel builds only.
