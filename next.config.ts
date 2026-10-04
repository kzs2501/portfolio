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

const withMDX = createMDX({});

export default withMDX(nextConfig);
