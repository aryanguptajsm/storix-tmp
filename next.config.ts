import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Allow cross-origin access to Next.js dev resources (e.g., webpack-hmr)
  allowedDevOrigins: ["10.209.100.227", "localhost"],

  // Only compress in production — it adds overhead in dev
  compress: isProd,

  images: {
    // Cache images for 30 days (was 60 seconds — way too short)
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Allow modern formats for better compression
    formats: ["image/avif", "image/webp"],
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
      { protocol: "https", hostname: "**.flixcart.com" },
      { protocol: "https", hostname: "**.rukminim.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.imgix.net" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  devIndicators: false,
  typedRoutes: false,

  // Exclude heavy server-only packages from the Next.js bundle.
  // This prevents the bundler from tracing into deeply nested node_modules
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

  experimental: {
    // Tree-shake barrel imports for faster compilation
    optimizePackageImports: [
      "framer-motion",
      "sonner",
      "lucide-react",
      "recharts",
      "@supabase/supabase-js",
      "@supabase/ssr",
      "three",
      "dodopayments",
    ],
    // Use memory-based worker count to auto-tune parallelism
    memoryBasedWorkersCount: true,
    // Inline CSS for critical path — removes render-blocking stylesheet requests
    inlineCss: true,
  },

  // Disable powered-by header for security
  poweredByHeader: false,

  // Strict mode for better hydration error detection in dev
  reactStrictMode: true,

  // Keep API responses uncached. Let Next.js manage its own static asset and
  // image cache headers so development resources keep working correctly.
  async headers() {
    return [
      {
        // Allow API routes to be called cross-origin where needed
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },

  // Only use standalone output for production — it causes extra filesystem
  // tracing during dev which triggers "slow filesystem" warnings
  ...(isProd ? { output: "standalone" as const } : {}),
};

export default nextConfig;
