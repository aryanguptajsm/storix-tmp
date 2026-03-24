/**
 * Affiliate link utilities
 * Parses and preserves affiliate tags from major platforms
 */

export interface AffiliateInfo {
  platform: string;
  originalUrl: string;
  cleanUrl: string;
  affiliateTag: string | null;
}

const PLATFORM_PATTERNS: Record<string, { regex: RegExp; tagParam: string }> = {
  amazon: {
    regex: /amazon\.(com|in|co\.uk|de|fr|es|it|ca|com\.au|co\.jp)/i,
    tagParam: "tag",
  },
  flipkart: {
    regex: /flipkart\.com/i,
    tagParam: "affid",
  },
  meesho: {
    regex: /meesho\.com/i,
    tagParam: "ref",
  },
};

export function parseAffiliateUrl(url: string): AffiliateInfo {
  try {
    const parsed = new URL(url);
    let platform = "other";
    let affiliateTag: string | null = null;

    for (const [name, config] of Object.entries(PLATFORM_PATTERNS)) {
      if (config.regex.test(parsed.hostname)) {
        platform = name;
        affiliateTag = parsed.searchParams.get(config.tagParam);
        break;
      }
    }

    return {
      platform,
      originalUrl: url,
      cleanUrl: parsed.origin + parsed.pathname,
      affiliateTag,
    };
  } catch {
    return {
      platform: "unknown",
      originalUrl: url,
      cleanUrl: url,
      affiliateTag: null,
    };
  }
}

export function buildTrackableUrl(
  originalUrl: string,
  clickId: string
): string {
  try {
    const parsed = new URL(originalUrl);
    parsed.searchParams.set("stx_click", clickId);
    return parsed.toString();
  } catch {
    return originalUrl;
  }
}
