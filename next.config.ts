import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // The whole site is prerendered to static HTML in `out/`. Fast, cheap to host,
  // and lets Lighthouse CI audit the exact files that ship.
  output: "export",
  // Emit /work/x/index.html, so any static host (and the local Lighthouse server)
  // resolves /work/x/ without rewrites.
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: { unoptimized: true },
};

const withMDX = createMDX({
  options: {
    // Curly quotes, real dashes and ellipses in every case study and note.
    remarkPlugins: ["remark-smartypants"],
    // Stable ids on headings, for anchors and the table of contents.
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
