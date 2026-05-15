// ============================================================
// STORIX PRODUCTION SCRAPER — UTILITY FUNCTIONS
// ============================================================

import type { ExtractionAccumulator, JsonObject, ScrapePlatform } from "./types";

// ── User Agent Pool ───────────────────────────────────────────────────────────

export const UA_POOL = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
];

export const getRandomUA = () => UA_POOL[Math.floor(Math.random() * UA_POOL.length)];

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Platform Detection ────────────────────────────────────────────────────────

export function detectPlatform(url: string): ScrapePlatform {
  try {
    const h = new URL(url).hostname.toLowerCase();
    if (h.includes("amazon")) return "amazon";
    if (h.includes("flipkart")) return "flipkart";
    if (h.includes("meesho")) return "meesho";
    if (h.includes("myntra")) return "myntra";
    if (h.includes("ajio")) return "ajio";
    if (h.includes("ebay")) return "ebay";
    if (h.includes("myshopify") || h.includes("shopify")) return "shopify";
  } catch {}
  return "generic";
}

// ── Invalid Image Patterns ────────────────────────────────────────────────────

const INVALID_IMAGE_PATTERNS = [
  /\bicon\b/i,
  /\bsprite\b/i,
  /\bloader\b/i,
  /\bplaceholder\b/i,
  /\btransparent\b/i,
  /\bavatar\b/i,
  /\bblank\b/i,
  /\blogo\b/i,
  /loading\.gif/i,
  /1x1/i,
  /pixel/i,
  /spinner/i,
  /captcha/i,
  /badge/i,
  /\.svg(\?|$)/i,
];

const PRODUCT_IMAGE_DOMAINS = [
  /m\.media-amazon\.com/i,
  /images-amazon\.com/i,
  /ssl-images-amazon\.com/i,
  /rukminim\d*\.flixcart\.com/i,
  /images\.meesho\.com/i,
  /assets\.ajio\.com/i,
  /cdn\.shopify\.com/i,
  /images\.unsplash\.com/i,
];

export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("http")) return false;
  if (url.startsWith("data:")) return false;
  if (url.length < 10) return false;
  if (INVALID_IMAGE_PATTERNS.some((p) => p.test(url))) return false;
  return true;
}

export function scoreImageUrl(url: string): number {
  let score = 0;
  // Prefer known product CDNs
  if (PRODUCT_IMAGE_DOMAINS.some((p) => p.test(url))) score += 100;
  // Prefer high resolution hints
  if (/\d{3,4}x\d{3,4}/i.test(url)) score += 50;
  if (/[_-](large|xl|xxl|hd|1080|800|600)/i.test(url)) score += 30;
  // Prefer JPG/PNG/WebP
  if (/\.(jpg|jpeg|png|webp)/i.test(url)) score += 20;
  // Penalise thumbnails
  if (/thumb|small|mini|tiny|_s\.|_t\./i.test(url)) score -= 40;
  return score;
}

/**
 * Remove duplicates, filter invalid, sort by quality score.
 * Returns deduplicated array, best image first.
 */
export function normalizeImages(urls: (string | undefined | null)[]): string[] {
  const seen = new Set<string>();
  const valid: { url: string; score: number }[] = [];

  for (const raw of urls) {
    if (!raw) continue;
    const url = stripTrackingParams(raw.trim());
    if (!url || seen.has(url)) continue;
    if (!isValidImageUrl(url)) continue;
    seen.add(url);
    valid.push({ url, score: scoreImageUrl(url) });
  }

  return valid.sort((a, b) => b.score - a.score).map((v) => v.url);
}

// ── URL Cleaning ──────────────────────────────────────────────────────────────

const TRACKING_PARAMS = [
  "ref", "ref_", "pf_rd_r", "pf_rd_p", "pd_rd_w", "pd_rd_r", "pd_rd_wg",
  "sprefix", "qid", "sr", "crid", "keywords", "dchild", "linkId", "fbclid",
  "gclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "_encoding", "smid", "th",
];

export function stripTrackingParams(url: string): string {
  try {
    const parsed = new URL(url);
    for (const p of TRACKING_PARAMS) {
      parsed.searchParams.delete(p);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

// ── Amazon Image Resolution Upgrade ──────────────────────────────────────────

export function upgradeAmazonImage(url: string): string {
  // Remove Amazon's size tokens like ._SX300_SY300_ → full res
  return url
    .replace(/\._[A-Z]{2}\d+(?:,\d+)*_(?:\.[A-Z]{2}\d+_)*\./g, ".")
    .replace(/\._[A-Z]+\d+_\./g, ".");
}

export function upgradeFlipkartImage(url: string): string {
  return url.replace(/\/\d+\/\d+\//g, "/832/832/").replace(/q=\d+/, "q=90");
}

export function upgradeImageResolution(url: string, platform: ScrapePlatform): string {
  if (platform === "amazon" || /media-amazon|ssl-images-amazon/i.test(url)) {
    return upgradeAmazonImage(url);
  }
  if (platform === "flipkart" || /rukminim/i.test(url)) {
    return upgradeFlipkartImage(url);
  }
  return url;
}

// ── Price Utilities ───────────────────────────────────────────────────────────

export function calculateDiscount(price: string, originalPrice: string): string {
  try {
    const curr = parseFloat(price.replace(/[^0-9.]/g, ""));
    const orig = parseFloat(originalPrice.replace(/[^0-9.]/g, ""));
    if (orig > curr && orig > 0) {
      return Math.round(((orig - curr) / orig) * 100).toString();
    }
  } catch {}
  return "";
}

export function detectCurrency(price: string): string {
  if (price.includes("₹") || price.includes("INR")) return "INR";
  if (price.includes("$") || price.includes("USD")) return "USD";
  if (price.includes("€") || price.includes("EUR")) return "EUR";
  if (price.includes("£") || price.includes("GBP")) return "GBP";
  return "INR"; // Default for Indian platforms
}

// ── JSON Utilities ────────────────────────────────────────────────────────────

export function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Attempt to fix common malformed JSON issues
    try {
      const fixed = text
        .replace(/,(\s*[}\]])/g, "$1")  // trailing commas
        .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');  // unquoted keys
      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
}

export function isRecord(v: unknown): v is JsonObject {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

// ── Accumulator Merge ─────────────────────────────────────────────────────────

const SCALAR_KEYS: (keyof ExtractionAccumulator)[] = [
  "product_title", "price", "original_price", "discount", "currency",
  "image_url", "description", "rating", "review_count", "brand",
  "category", "availability",
];

/**
 * Merge two accumulators, giving priority to the base.
 * Only fills empty/undefined fields from the incoming source.
 */
export function mergeAccumulators(
  base: ExtractionAccumulator,
  incoming: ExtractionAccumulator,
): ExtractionAccumulator {
  const merged = { ...base };

  for (const key of SCALAR_KEYS) {
    const baseVal = merged[key];
    const inVal = (incoming as Record<string, unknown>)[key];
    const isEmpty = !baseVal || baseVal === "Unknown Product";
    if (inVal && isEmpty) {
      (merged as Record<string, unknown>)[key] = inVal;
    }
  }

  if ((!merged.features || merged.features.length === 0) && incoming.features?.length) {
    merged.features = incoming.features;
  }
  if ((!merged.variants || merged.variants.length === 0) && incoming.variants?.length) {
    merged.variants = incoming.variants;
  }

  // Always merge images from all sources
  const allImages = [...(merged.images || []), ...(incoming.images || [])];
  if (allImages.length > 0) {
    merged.images = normalizeImages(allImages);
  }

  return merged;
}

// ── Scrape Quality ────────────────────────────────────────────────────────────

export function deriveScrapeStatus(acc: ExtractionAccumulator): "success" | "partial" | "failed" {
  const hasTitle = Boolean(acc.product_title && acc.product_title !== "Unknown Product");
  const hasImage = Boolean(acc.image_url || (acc.images && acc.images.length > 0));
  const hasPrice = Boolean(acc.price);

  if (hasTitle && hasImage && hasPrice) return "success";
  if (hasTitle || hasImage || hasPrice) return "partial";
  return "failed";
}
