# kshitizsonakiya — portfolio

Source for my portfolio: three case studies, a few technical notes, and four interactive
demos that rebuild the ideas behind private production work from scratch, with fake data.

**Stack:** Next.js 16 (App Router, static export) · React 19 · TypeScript (strict) ·
Tailwind CSS 4 · MDX · Vitest · Playwright + axe · Lighthouse CI.

## What's worth a look

- **Demos as pure logic plus a thin UI.** Each demo's behaviour lives in a plain,
  unit-tested module, such as [`stage-registry/registry.ts`](src/demos/stage-registry/registry.ts)
  and [`single-flight/timeline.ts`](src/demos/single-flight/timeline.ts). The React
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

## Quality gates

| Check | What it enforces |
|---|---|
| `npm test` | 37 unit tests over the demo logic and palette ranking |
| `npm run test:e2e` | axe (WCAG 2.2 AA) on every route in light and dark; keyboard paths; no horizontal scroll at 375px; demo behaviour; reduced motion |
| `npm run lhci` | Lighthouse ≥ 95 in every category, CLS ≤ 0.05 |
| CI | All of the above on every push and pull request |

Desktop Lighthouse: 100 / 100 / 100 / 100 on every audited page.

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
  app/              routes: home, /work/[slug], /notes/[slug], /about, OG images, RSS
  content/          the typed content index + case-study and note MDX
  components/       layout, ledger primitives, demo loader, ⌘K palette
  demos/            each demo: logic.ts + logic.test.ts + demo.tsx
content-review/     every factual claim on the site, as a checklist (never published)
e2e/                Playwright + axe
```

## Content review

Every factual claim in the case studies is listed in [`content-review/`](content-review).
`npm run check:claims` fails until each is confirmed, and `npm run prelaunch` runs it
together with lint, type-check, tests and the build.

## Deploying

Static output, so any host works. On Vercel: import the repo, set
`NEXT_PUBLIC_SITE_URL` to the production URL, and deploy. Vercel Analytics is enabled
automatically on Vercel builds only.
