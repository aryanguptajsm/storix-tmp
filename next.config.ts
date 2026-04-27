import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: "https", hostname: "**.amazon.com" },
      { protocol: "https", hostname: "**.media-amazon.com" },
      { protocol: "https", hostname: "**.ssl-images-amazon.com" },
      { protocol: "https", hostname: "**.etsystatic.com" },
      { protocol: "https", hostname: "**.ebayimg.com" },
      { protocol: "https", hostname: "**.targetimg1.com" },
      { protocol: "https", hostname: "**.walmartimages.com" },
      { protocol: "https", hostname: "**.alicdn.com" },
      { protocol: "https", hostname: "**.flipkart.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.imgix.net" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  devIndicators: false,

  // Exclude heavy server-only packages from the Next.js bundle
  // This prevents the bundler from tracing into their deeply nested node_modules
  serverExternalPackages: [
    "playwright",
    "cheerio",
    "open-graph-scraper",
    "axios",
    "csv-parse",
    "csv-stringify",
  ],

  turbopack: {
    root: path.resolve("."),
    ignoreIssue: [
      { path: "**/node_modules/@opentelemetry/**" },
      { path: "node_modules/next/node_modules/@opentelemetry" },
      { path: "**/node_modules/@emotion/**" },
      { path: "**/node_modules/@swc/**" },
      { path: "node_modules/@opentelemetry" },
      { path: ".next-internal/**" },
      { path: "**/.next-internal/**" },
      { path: ".next/**" },
      { path: "**/.next/**" },
      { path: ".config/**" },
      { path: "**/node_modules/playwright/**" },
      { path: "**/node_modules/playwright-core/**" },
    ],
  },

  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "sonner",
      "lucide-react",
      "recharts",
      "@supabase/supabase-js",
    ],
    memoryBasedWorkersCount: true,
  },

  // Only use standalone output for production builds — it causes
  // extra filesystem tracing during dev which triggers "slow filesystem" warnings
  ...(isProd ? { output: "standalone" as const } : {}),
};

export default nextConfig;
