import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/content/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CommandPalette } from "@/components/command-palette/palette";
import "./globals.css";
import { PAPER, THEME_STORAGE_KEY } from "@/lib/design-tokens";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
// Not preloaded: only small labels use it, and preloading it competed with the
// hero's serif for bandwidth on slow mobile connections (LCP).
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  openGraph: { type: "website", siteName: site.name, locale: "en_GB" },
  twitter: { card: "summary_large_image" },
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
const themeScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light";if(s){document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.setAttribute("content",d?${JSON.stringify(PAPER.dark)}:${JSON.stringify(PAPER.light)})})})}}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // We set scroll-behavior: smooth for in-page links (contents, anchors).
      // This tells Next 16 to switch it off during route changes, so a new page
      // opens at the top instead of smooth-scrolling up from the old position.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${serif.variable} ${mono.variable} antialiased`}
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
