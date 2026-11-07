import type { Metadata, Viewport } from "next";
import { Martian_Mono, Newsreader, Schibsted_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/content/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CommandPalette } from "@/components/command-palette/palette";
import "./globals.css";
import { PAPER, THEME_STORAGE_KEY } from "@/lib/design-tokens";
import { routes } from "@/lib/routes";
import { scriptLiteral } from "@/lib/script-literal";
import { previewImageFor } from "@/app/_lib/content-page";

// Headings, the name and the controls. The home page's heading is its largest paint.
const grotesk = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted-grotesk", display: "swap" });
// Reading text. Its optical-size axis would double the file, and it never sets a
// heading, so it goes without.
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap" });
// Its italic, for emphasis and quotes in articles, which are seldom in the first screen.
// Not preloaded, so it doesn't share the first round trips with the heading's font; and
// optional, so text never reflows when it arrives (layout shift): a first view that misses
// it sets emphasis in the fallback serif, sized to Newsreader's metrics, and the next page
// has the italic from the cache.
const newsreaderItalic = Newsreader({
  subsets: ["latin"],
  style: "italic",
  variable: "--font-newsreader-italic",
  display: "optional",
  preload: false,
});
// Not preloaded: only small labels use it, and preloading it would compete with the
// heading's font for bandwidth on slow mobile connections (LCP).
const mono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_GB",
    images: [previewImageFor(routes.home(), site.title)],
  },
  twitter: { card: "summary_large_image" },
  // Pages add their canonical URL to this (`alternatesFor`); the 404 page has none.
  alternates: { types: { "application/rss+xml": "/notes/rss.xml" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: PAPER.light },
    { media: "(prefers-color-scheme: dark)", color: PAPER.dark },
  ],
};

/**
 * Runs before first paint, so a dark-mode visitor never sees a white flash. With a
 * saved preference it also points both theme-color metas at that theme, so the
 * phone's browser chrome matches the page rather than the OS setting.
 */
const themeScript = `(function(){try{var s=localStorage.getItem(${scriptLiteral(THEME_STORAGE_KEY)});var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light";if(s){document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.setAttribute("content",d?${scriptLiteral(PAPER.dark)}:${scriptLiteral(PAPER.light)})})})}}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // We set scroll-behavior: smooth for in-page links (contents, anchors).
      // This tells Next 16 to switch it off during route changes, so a new page
      // opens at the top instead of smooth-scrolling up from the old position.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${grotesk.variable} ${newsreader.variable} ${newsreaderItalic.variable} ${mono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-ink px-4 py-2 text-sm text-paper transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
        <CommandPalette />
        {/* Only exists on Vercel; locally it would 404 and cost Lighthouse points. */}
        {process.env["VERCEL"] && <Analytics />}
      </body>
    </html>
  );
}
