// ============================================================
// STORIX PRODUCTION SCRAPER — TYPE CONTRACTS
// ============================================================

export type ScrapeStatus = "success" | "partial" | "failed";

export type ScrapePlatform =
  | "amazon"
  | "flipkart"
  | "meesho"
  | "myntra"
  | "ajio"
  | "shopify"
  | "ebay"
  | "generic";

export type ScrapeErrorType =
  | "timeout"
  | "blocked"
  | "selector_missing"
  | "network_error"
  | "ai_error"
  | "unknown";

export type ExtractionStrategy = "api_intercept" | "json_ld" | "next_data" | "dom" | "meta" | "ai_fallback";

export interface ScrapeAttemptLog {
  attempt: number;
  strategy: "http" | "playwright" | "ai_fallback";
  message: string;
  error_type?: ScrapeErrorType;
  at: string;
}

export interface CoreScrapedFields {
  title?: string | null;
  price?: string | null;
  image?: string | null;
  rating?: string | null;
  review_count?: string | null;
  brand?: string | null;
}

/** Normalized product output — the public contract */
export interface ScrapedProduct {
  title: string;
  price: string;
  currency: string;
  images: string[];          // All valid gallery images, deduplicated
  thumbnail: string;         // Primary image (highest resolution)
  description: string;
  rating: string;
  reviews: string;
  variants: ProductVariant[];
  availability: string;
  brand: string;
  source: ScrapePlatform;
  url: string;
  // Internal enrichments (kept for backwards compat)
  original_price?: string;
  discount?: string;
  category?: string;
  features?: string[];
}

export interface ProductVariant {
  name: string;
  value: string;
  available?: boolean;
  price?: string;
}

/** Internal accumulator used during extraction pipeline */
export interface ExtractionAccumulator {
  product_title?: string;
  price?: string;
  original_price?: string;
  discount?: string;
  currency?: string;
  image_url?: string;
  images?: string[];
  description?: string;
  rating?: string;
  review_count?: string;
  brand?: string;
  category?: string;
  features?: string[];
  variants?: ProductVariant[];
  availability?: string;
  error_reason?: string;
}

export interface CapturedApiPayload {
  url: string;
  status: number;
  body: unknown;
}

export type JsonObject = Record<string, unknown>;

// ── Selector maps keyed per platform ──────────────────────────────────────────

export interface PlatformSelectorMap {
  title: string[];
  price: string[];
  originalPrice: string[];
  discount: string[];
  image: string[];
  rating: string[];
  reviewCount: string[];
  brand: string[];
  description: string[];
  features: string[];
  /** Selectors to wait for before scraping */
  waitFor: string[];
}
