import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Lets parallel builds/servers use separate output folders (e.g. NEXT_DIST_DIR=.next-home). Default: .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // PPR features are unsupported in static export (GitHub Pages demo).
  cacheComponents: !isPages,
  partialPrefetching: !isPages,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  ...(isPages
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
        ...(basePath ? { basePath, assetPrefix: basePath } : {}),
      }
    : process.env.DOCKER === "1"
      ? { output: "standalone" as const }
      : {}),
};

export default nextConfig;
