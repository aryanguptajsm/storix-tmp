// ============================================================
// STORIX SCRAPER — CONTRACT HELPERS
// Backwards-compatible exports used across the app.
// Full type definitions now live in ./types.ts
// ============================================================

export type { ScrapeStatus, ScrapePlatform, ScrapeErrorType, ScrapeAttemptLog, CoreScrapedFields } from "./types";

export function detectPlatformFromUrl(url: string): import("./types").ScrapePlatform {
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

export function classifyScrapeError(message: string): import("./types").ScrapeErrorType {
  const n = message.toLowerCase();
  if (n.includes("timeout")) return "timeout";
  if (n.includes("429") || n.includes("403") || n.includes("captcha") || n.includes("blocked") || n.includes("access denied")) return "blocked";
  if (n.includes("selector") || n.includes("not found") || n.includes("no image") || n.includes("missing")) return "selector_missing";
  if (n.includes("network") || n.includes("econnreset") || n.includes("enotfound") || n.includes("socket")) return "network_error";
  if (n.includes("ai") || n.includes("gemini") || n.includes("openai")) return "ai_error";
  return "unknown";
}

export function deriveScrapeStatus(fields: import("./types").CoreScrapedFields): import("./types").ScrapeStatus {
  const vals = [fields.title, fields.price, fields.image, fields.rating, fields.review_count, fields.brand];
  const present = vals.filter((v) => Boolean(v && String(v).trim())).length;
  if (present === vals.length) return "success";
  const core = Boolean(fields.title?.trim()) || Boolean(fields.price?.trim()) || Boolean(fields.image?.trim());
  if (core || present > 0) return "partial";
  return "failed";
}
