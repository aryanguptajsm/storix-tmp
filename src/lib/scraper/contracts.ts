export type ScrapeStatus = "success" | "partial" | "failed";

export type ScrapePlatform =
  | "amazon"
  | "flipkart"
  | "meesho"
  | "myntra"
  | "ajio"
  | "ebay"
  | "generic";

export type ScrapeErrorType =
  | "timeout"
  | "blocked"
  | "selector_missing"
  | "network_error"
  | "ai_error"
  | "unknown";

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

export function detectPlatformFromUrl(url: string): ScrapePlatform {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("amazon")) return "amazon";
    if (hostname.includes("flipkart")) return "flipkart";
    if (hostname.includes("meesho")) return "meesho";
    if (hostname.includes("myntra")) return "myntra";
    if (hostname.includes("ajio")) return "ajio";
    if (hostname.includes("ebay")) return "ebay";
  } catch {
    return "generic";
  }

  return "generic";
}

export function classifyScrapeError(message: string): ScrapeErrorType {
  const normalized = message.toLowerCase();

  if (normalized.includes("timeout")) return "timeout";
  if (
    normalized.includes("429")
    || normalized.includes("403")
    || normalized.includes("captcha")
    || normalized.includes("blocked")
    || normalized.includes("access denied")
  ) {
    return "blocked";
  }
  if (
    normalized.includes("selector")
    || normalized.includes("not found")
    || normalized.includes("no image found")
    || normalized.includes("missing")
  ) {
    return "selector_missing";
  }
  if (
    normalized.includes("network")
    || normalized.includes("econnreset")
    || normalized.includes("enotfound")
    || normalized.includes("socket")
  ) {
    return "network_error";
  }
  if (normalized.includes("openai") || normalized.includes("ai")) return "ai_error";

  return "unknown";
}

export function deriveScrapeStatus(fields: CoreScrapedFields): ScrapeStatus {
  const values = [
    fields.title,
    fields.price,
    fields.image,
    fields.rating,
    fields.review_count,
    fields.brand,
  ];
  const presentCount = values.filter((value) => Boolean(value && String(value).trim())).length;

  if (presentCount === values.length) return "success";

  const hasMeaningfulCore =
    Boolean(fields.title && String(fields.title).trim())
    || Boolean(fields.price && String(fields.price).trim())
    || Boolean(fields.image && String(fields.image).trim());

  if (hasMeaningfulCore || presentCount > 0) return "partial";
  return "failed";
}
