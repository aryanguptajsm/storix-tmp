import type { NextConfig } from "next";

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
    "playwright-core",
    "cheerio",
    "open-graph-scraper",
    "axios",
    "csv-parse",
    "csv-stringify",
    "standardwebhooks",
  ],

  // Turbopack configuration for faster dev builds
  turbopack: {
    resolveAlias: {
      // Prevent Turbopack from tracing into heavy packages
      "playwright": { browser: "" },
      "playwright-core": { browser: "" },
    },
  },

  experimental: {
    // Tree-shake barrel imports from these packages for faster compilation
    optimizePackageImports: [
      "framer-motion",
      "sonner",
      "lucide-react",
      "recharts",
      "@supabase/supabase-js",
      "@supabase/ssr",
    ],
    // Use memory-based worker count to auto-tune parallelism
    memoryBasedWorkersCount: true,
  },

  // Only use standalone output for production builds — it causes
  // extra filesystem tracing during dev which triggers "slow filesystem" warnings
  ...(isProd ? { output: "standalone" as const } : {}),
};

export default nextConfig;
