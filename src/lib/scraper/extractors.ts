// ============================================================
// STORIX PRODUCTION SCRAPER — EXTRACTION PIPELINE
// Responsibilities:
//  - JSON-LD extraction
//  - __NEXT_DATA__ / hydration state extraction
//  - API intercept payload mining
//  - DOM snapshot extraction (runs inside Playwright page.evaluate)
//  - Cheerio HTML extraction
// ============================================================

import * as cheerio from "cheerio";
import type { ExtractionAccumulator, CapturedApiPayload, JsonObject, ProductVariant, ScrapePlatform } from "./types";
import { isRecord, safeJsonParse, normalizeImages, isValidImageUrl } from "./utils";
import { getAdapter } from "./adapters";

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD Extractor
// ─────────────────────────────────────────────────────────────────────────────

function findProductNodes(items: unknown[], depth = 0): JsonObject[] {
  if (depth > 8) return [];
  const found: JsonObject[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    if (Array.isArray(item)) {
      found.push(...findProductNodes(item as unknown[], depth + 1));
      continue;
    }
    const obj = item as JsonObject;
    const type = String(obj["@type"] || "").toLowerCase();
    if (type === "product" || type === "individualproduct") {
      found.push(obj);
    }
    for (const val of Object.values(obj)) {
      if (val && typeof val === "object") {
        found.push(...findProductNodes(Array.isArray(val) ? val : [val], depth + 1));
      }
    }
  }
  return found;
}

export function extractFromJsonLd($: cheerio.CheerioAPI): ExtractionAccumulator {
  const acc: ExtractionAccumulator = {};

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      let raw = safeJsonParse($(el).html() || "{}");
      if (!raw) return;
      // Handle @graph
      if (isRecord(raw) && Array.isArray(raw["@graph"])) raw = raw["@graph"];
      const products = findProductNodes(Array.isArray(raw) ? raw : [raw]);
      if (!products.length) return;

      const p = products[0];

      if (!acc.product_title && p.name) {
        acc.product_title = String(p.name).trim();
      }

      // Images from JSON-LD
      if (p.image) {
        const imgs: string[] = [];
        const addImg = (v: unknown) => {
          if (typeof v === "string") imgs.push(v);
          else if (isRecord(v) && typeof v.url === "string") imgs.push(v.url);
        };
        Array.isArray(p.image) ? (p.image as unknown[]).forEach(addImg) : addImg(p.image);
        const normalized = normalizeImages(imgs);
        if (!acc.image_url && normalized[0]) acc.image_url = normalized[0];
        acc.images = [...(acc.images || []), ...normalized];
      }

      if (!acc.description && p.description) {
        acc.description = String(p.description).replace(/\s+/g, " ").trim().slice(0, 600);
      }

      if (!acc.brand && p.brand) {
        acc.brand = isRecord(p.brand) ? String((p.brand as JsonObject).name || "") : String(p.brand);
      }

      if (!acc.category && p.category) {
        acc.category = String(p.category);
      }

      // Offers
      if (!acc.price && p.offers) {
        const offer = Array.isArray(p.offers) ? (p.offers as JsonObject[])[0] : (isRecord(p.offers) ? p.offers : null);
        if (offer && isRecord(offer)) {
          const curr = offer.priceCurrency === "INR" ? "₹" : offer.priceCurrency === "USD" ? "$" : String(offer.priceCurrency || "");
          if (offer.price) acc.price = `${curr}${offer.price}`;
          else if (offer.lowPrice) acc.price = `${curr}${offer.lowPrice}`;
          if (offer.highPrice && offer.lowPrice) acc.original_price = `${curr}${offer.highPrice}`;
        }
      }

      // Aggregate rating
      if (!acc.rating && isRecord(p.aggregateRating)) {
        acc.rating = String(p.aggregateRating.ratingValue || "");
        acc.review_count = String(p.aggregateRating.reviewCount || p.aggregateRating.ratingCount || "");
      }
    } catch {}
  });

  return acc;
}

// ─────────────────────────────────────────────────────────────────────────────
// __NEXT_DATA__ / Hydration State Extractor
// ─────────────────────────────────────────────────────────────────────────────

function deepSearch(obj: unknown, depth = 0): JsonObject | null {
  if (!obj || typeof obj !== "object" || depth > 10) return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = deepSearch(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  const o = obj as JsonObject;
  const directType = String(o.__typename || "").toLowerCase();
  const looksProduct =
    directType.includes("product") ||
    (("name" in o || "title" in o) && ("price" in o || "offers" in o || "images" in o || "image" in o));

  if (looksProduct) return o;
  for (const val of Object.values(o)) {
    const found = deepSearch(val, depth + 1);
    if (found) return found;
  }
  return null;
}

export function extractFromNextData($: cheerio.CheerioAPI): ExtractionAccumulator {
  const acc: ExtractionAccumulator = {};

  const nextDataEl = $("#__NEXT_DATA__").html();
  const initialStateEl = $('script:contains("__INITIAL_STATE__")').first().html();
  const apolloEl = $('script:contains("__APOLLO_STATE__")').first().html();

  const sources: string[] = [];
  if (nextDataEl) sources.push(nextDataEl);
  if (initialStateEl) sources.push(initialStateEl.replace(/window\.__INITIAL_STATE__\s*=\s*/, "").replace(/;$/, ""));
  if (apolloEl) sources.push(apolloEl.replace(/window\.__APOLLO_STATE__\s*=\s*/, "").replace(/;$/, ""));

  for (const src of sources) {
    try {
      const parsed = safeJsonParse(src);
      if (!parsed) continue;
      const product = deepSearch(parsed);
      if (!product) continue;

      if (!acc.product_title && (product.name || product.title || product.productName)) {
        acc.product_title = String(product.name || product.title || product.productName || "").trim();
      }
      if (!acc.description && (product.description || product.shortDescription)) {
        acc.description = String(product.description || product.shortDescription || "").trim().slice(0, 600);
      }
      if (!acc.brand) {
        const b = product.brand || product.manufacturer;
        acc.brand = isRecord(b) ? String((b as JsonObject).name || "") : String(b || "");
      }

      // Price extraction
      if (!acc.price) {
        const priceObj = isRecord(product.price) ? product.price as JsonObject : null;
        const priceVal = priceObj?.formattedValue ?? priceObj?.displayValue ?? priceObj?.value ??
          product.offerPrice ?? product.sellingPrice ?? product.salePrice ?? product.currentPrice ?? product.finalPrice;
        if (priceVal) acc.price = String(priceVal).trim();
      }
      if (!acc.original_price) {
        const lpObj = isRecord(product.listPrice) ? product.listPrice as JsonObject : null;
        const origVal = product.mrp ?? lpObj?.formattedValue ?? lpObj?.value ??
          product.originalPrice ?? product.strikePrice ?? product.compareAtPrice;
        if (origVal) acc.original_price = String(origVal).trim();
      }

      // Rating
      if (!acc.rating) {
        const rObj = isRecord(product.rating) ? product.rating as JsonObject : null;
        const rv = rObj?.average ?? rObj?.value ?? product.averageRating ?? product.rating;
        if (rv) acc.rating = String(rv).trim();
        const rc = rObj?.count ?? product.reviewCount ?? product.ratingsCount;
        if (rc) acc.review_count = String(rc).replace(/\D/g, "");
      }

      // Images
      const imgCandidates: unknown[] = [
        product.image, product.primaryImage,
        ...(Array.isArray(product.images) ? product.images : []),
        ...(Array.isArray(product.media) ? product.media : []),
        ...(Array.isArray(product.gallery) ? product.gallery : []),
        ...(Array.isArray(product.allImages) ? product.allImages : []),
      ];
      const imgs: string[] = [];
      for (const c of imgCandidates) {
        if (!c) continue;
        const url = typeof c === "string" ? c : isRecord(c) ? String((c as JsonObject).url || (c as JsonObject).src || "") : "";
        if (url) imgs.push(url);
      }
      const normalized = normalizeImages(imgs);
      if (!acc.image_url && normalized[0]) acc.image_url = normalized[0];
      acc.images = [...(acc.images || []), ...normalized];

      // Variants
      if (!acc.variants && Array.isArray(product.variants)) {
        acc.variants = (product.variants as unknown[]).slice(0, 20).map((v: unknown): ProductVariant => {
          const vo = isRecord(v) ? v : {} as JsonObject;
          return {
            name: String(vo.attribute || vo.name || "variant"),
            value: String(vo.value || vo.title || ""),
            available: Boolean(vo.available ?? vo.inStock ?? true),
            price: vo.price ? String(vo.price) : undefined,
          };
        }).filter((v) => v.value);
      }
    } catch {}
  }

  return acc;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Intercept Payload Extractor
// ─────────────────────────────────────────────────────────────────────────────

export function extractFromApiPayloads(payloads: CapturedApiPayload[]): ExtractionAccumulator {
  const acc: ExtractionAccumulator = {};

  for (const payload of payloads) {
    try {
      const product = deepSearch(payload.body);
      if (!product) continue;

      if (!acc.product_title) {
        acc.product_title = String(product.title || product.name || product.productTitle || product.productName || "").trim();
      }
      if (!acc.description) {
        acc.description = String(product.description || product.shortDescription || product.summary || "").trim().slice(0, 600);
      }
      if (!acc.brand) {
        const b = product.brand || product.manufacturer;
        acc.brand = isRecord(b) ? String((b as JsonObject).name || "") : String(b || "");
      }
      if (!acc.category) {
        const c = product.category || product.department;
        acc.category = isRecord(c) ? String((c as JsonObject).name || "") : String(c || "");
      }

      if (!acc.price) {
        const po = isRecord(product.price) ? product.price as JsonObject : null;
        const pv = po?.formattedValue ?? po?.displayValue ?? po?.value ??
          product.offerPrice ?? product.sellingPrice ?? product.salePrice ?? product.currentPrice;
        if (pv) acc.price = String(pv).trim();
      }
      if (!acc.original_price) {
        const lp = isRecord(product.listPrice) ? product.listPrice as JsonObject : null;
        const ov = product.mrp ?? lp?.formattedValue ?? lp?.value ?? product.originalPrice ?? product.strikePrice;
        if (ov) acc.original_price = String(ov).trim();
      }

      if (!acc.rating) {
        const ro = isRecord(product.rating) ? product.rating as JsonObject : null;
        const rv = ro?.average ?? ro?.value ?? product.averageRating ?? product.rating;
        if (rv) acc.rating = String(rv).trim();
        const rc = ro?.count ?? product.reviewCount ?? product.ratingsCount ?? product.totalReviews;
        if (rc) acc.review_count = String(rc).replace(/\D/g, "");
      }

      // Images
      const imgCandidates: unknown[] = [
        product.image, product.primaryImage,
        ...(Array.isArray(product.images) ? product.images : []),
        ...(Array.isArray(product.media) ? product.media : []),
        ...(Array.isArray(product.gallery) ? product.gallery : []),
      ];
      const imgs: string[] = [];
      for (const c of imgCandidates) {
        if (!c) continue;
        const u = typeof c === "string" ? c : isRecord(c) ? String((c as JsonObject).url || (c as JsonObject).src || "") : "";
        if (u) imgs.push(u);
      }
      const normalized = normalizeImages(imgs);
      if (!acc.image_url && normalized[0]) acc.image_url = normalized[0];
      acc.images = [...(acc.images || []), ...normalized];

      // Features
      if (!acc.features?.length && Array.isArray(product.features)) {
        acc.features = (product.features as unknown[])
          .map((f: unknown) => String(isRecord(f) ? (f as JsonObject).text || (f as JsonObject).value || "" : f || "").trim())
          .filter((f) => f.length > 4)
          .slice(0, 8);
      }
    } catch {}
  }

  return acc;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM Snapshot Extractor (runs in page.evaluate)
// Serialized — cannot reference external closures
// ─────────────────────────────────────────────────────────────────────────────

export interface DomSnapshotResult {
  product_title: string;
  price: string;
  original_price: string;
  discount: string;
  image_url: string;
  images: string[];
  description: string;
  rating: string;
  review_count: string;
  brand: string;
  features: string[];
  variants: ProductVariant[];
  availability: string;
}

/**
 * This function is stringified and evaluated inside Playwright.
 * It must be entirely self-contained — no external imports.
 */
export function buildDomExtractScript(platform: ScrapePlatform, selectors: ReturnType<typeof getAdapter>) {
  return (args: { platform: string; sel: typeof selectors }): DomSnapshotResult => {
    const { sel } = args;

    const cleanText = (v?: string | null) => v?.replace(/\s+/g, " ").trim() || "";
    const firstText = (ss: string[]) => {
      for (const s of ss) {
        try {
          const el = document.querySelector(s);
          if (el) { const t = cleanText(el.textContent); if (t) return t; }
        } catch {}
      }
      return "";
    };
    const firstAttr = (ss: string[], attr: string) => {
      for (const s of ss) {
        try {
          const el = document.querySelector(s);
          const v = cleanText(el?.getAttribute(attr));
          if (v && !v.startsWith("data:") && v.startsWith("http")) return v;
        } catch {}
      }
      return "";
    };
    const firstMeta = (ss: string[]) => {
      for (const s of ss) {
        try {
          const v = cleanText(document.querySelector(s)?.getAttribute("content"));
          if (v) return v;
        } catch {}
      }
      return "";
    };

    // ── Title ──────────────────────────────────────────────────────────────
    const product_title = firstText(sel.title);

    // ── Price ──────────────────────────────────────────────────────────────
    let price = firstText(sel.price);
    // Fallback: scan any element containing ₹ or $ near the top of the page
    if (!price) {
      const candidates = Array.from(document.querySelectorAll("h3, h4, span, strong, b"));
      for (const el of candidates.slice(0, 80)) {
        const t = cleanText(el.textContent);
        if ((t.includes("₹") || t.includes("$") || t.includes("€")) && t.length < 20) {
          price = t;
          break;
        }
      }
    }

    // ── Original Price ─────────────────────────────────────────────────────
    const original_price = firstText(sel.originalPrice);

    // ── Discount ───────────────────────────────────────────────────────────
    const discountRaw = firstText(sel.discount);
    const discount = discountRaw.replace(/[^0-9]/g, "");

    // ── Images ─────────────────────────────────────────────────────────────
    const invalidPats = /icon|sprite|loader|placeholder|transparent|avatar|blank|logo|loading\.gif|1x1|pixel|captcha|spinner|badge|\.svg/i;
    const seenImgUrls = new Set<string>();
    const collectImg = (v?: string | null) => {
      if (!v || v.startsWith("data:") || !v.startsWith("http") || invalidPats.test(v)) return;
      seenImgUrls.add(v.trim());
    };

    // From adapter selectors
    for (const s of sel.image) {
      try {
        const els = Array.from(document.querySelectorAll(s));
        for (const el of els) {
          collectImg(el.getAttribute("src"));
          collectImg(el.getAttribute("data-src"));
          collectImg(el.getAttribute("data-lazy-src"));
          collectImg(el.getAttribute("data-zoom-image"));
          collectImg(el.getAttribute("data-a-dynamic-image") ? (() => {
            try {
              const parsed = JSON.parse(el.getAttribute("data-a-dynamic-image")!);
              const keys = Object.keys(parsed);
              // Sort by area (width × height), pick best
              return keys.sort((a, b) => (parsed[b][0] * parsed[b][1]) - (parsed[a][0] * parsed[a][1]))[0];
            } catch { return null; }
          })() : null);
          // srcset
          const srcset = el.getAttribute("srcset");
          if (srcset) {
            for (const part of srcset.split(",")) {
              const url = part.trim().split(" ")[0];
              collectImg(url);
            }
          }
        }
      } catch {}
    }

    // Broad fallback: scan all images in main/article, exclude review sections
    try {
      const productContainers = Array.from(
        document.querySelectorAll("main, article, [id*='product'], [class*='product'], [data-component-type*='product']")
      );
      const reviewContainers = new Set<Element>(
        Array.from(document.querySelectorAll("#customerReviews, .review, [data-hook='review'], [class*='review-section'], [class*='customer-review']"))
      );
      for (const container of (productContainers.length ? productContainers : [document.body])) {
        const imgs = Array.from(container.querySelectorAll("img")).filter((img) => {
          let p: Element | null = img;
          while (p) {
            if (reviewContainers.has(p)) return false;
            p = p.parentElement;
          }
          return true;
        });
        for (const img of imgs.slice(0, 30)) {
          collectImg(img.getAttribute("src"));
          collectImg(img.getAttribute("data-src"));
          collectImg(img.getAttribute("data-zoom-image"));
        }
      }
    } catch {}

    const images = Array.from(seenImgUrls);
    const image_url = images[0] || firstMeta(["meta[property='og:image']", "meta[name='twitter:image']"]);

    // ── Description ────────────────────────────────────────────────────────
    const description = firstText(sel.description)
      || firstMeta(["meta[property='og:description']", "meta[name='description']"]);

    // ── Rating ─────────────────────────────────────────────────────────────
    const ratingRaw = firstText(sel.rating);
    const ratingMatch = ratingRaw.match(/[\d.]+/);
    const rating = ratingMatch ? ratingMatch[0] : "";

    // ── Review Count ───────────────────────────────────────────────────────
    const reviewRaw = firstText(sel.reviewCount);
    const reviewMatch = reviewRaw.match(/[\d,]+/);
    const review_count = reviewMatch ? reviewMatch[0].replace(/,/g, "") : "";

    // ── Brand ──────────────────────────────────────────────────────────────
    const brand = firstText(sel.brand)
      .replace(/^(Visit the |Brand:\s*|by\s*)/i, "")
      .trim();

    // ── Features ───────────────────────────────────────────────────────────
    const featuresSet = new Set<string>();
    for (const s of sel.features) {
      try {
        for (const el of Array.from(document.querySelectorAll(s)).slice(0, 20)) {
          const t = cleanText(el.textContent);
          if (t.length > 4 && t.length < 300) featuresSet.add(t);
        }
      } catch {}
    }
    const features = Array.from(featuresSet).slice(0, 8);

    // ── Availability ───────────────────────────────────────────────────────
    const availabilityRaw = firstText([
      "#availability span",
      "[data-testid='availability']",
      ".in-stock, .out-of-stock",
      "[class*='availability']",
      "#add-to-cart-button",
    ]);
    const availability = availabilityRaw.toLowerCase().includes("unavailable")
      || availabilityRaw.toLowerCase().includes("out of stock")
      ? "out_of_stock"
      : availabilityRaw ? "in_stock" : "";

    // ── Variants ───────────────────────────────────────────────────────────
    const variants: ProductVariant[] = [];
    try {
      const variantContainers = Array.from(document.querySelectorAll(
        "[data-dp-url], [data-action='asin'], [data-defaultasin], li[data-value], .swatches li, [class*='variant'], [class*='swatch']"
      )).slice(0, 30);
      for (const el of variantContainers) {
        const name = cleanText(el.getAttribute("data-dp-url") ? "variant" : el.closest("label")?.textContent || el.getAttribute("data-value") || "variant");
        const value = cleanText(el.getAttribute("title") || el.getAttribute("data-value") || el.textContent);
        if (value && value.length < 60) {
          variants.push({ name, value, available: !el.classList.contains("disabled") });
        }
      }
    } catch {}

    return {
      product_title,
      price,
      original_price,
      discount,
      image_url,
      images,
      description,
      rating,
      review_count,
      brand,
      features,
      variants,
      availability,
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cheerio HTML Extractor (used when full page HTML is available)
// ─────────────────────────────────────────────────────────────────────────────

export function extractFromCheerio($: cheerio.CheerioAPI, platform: ScrapePlatform): ExtractionAccumulator {
  const sel = getAdapter(platform);
  const acc: ExtractionAccumulator = {};

  // JSON-LD first (highest fidelity)
  const jsonLd = extractFromJsonLd($);
  Object.assign(acc, jsonLd);

  // __NEXT_DATA__ / hydration payloads
  const nextData = extractFromNextData($);
  // Only fill missing fields
  for (const [k, v] of Object.entries(nextData)) {
    if (!(acc as Record<string, unknown>)[k] && v) (acc as Record<string, unknown>)[k] = v;
  }

  const firstText = (ss: string[]) => {
    for (const s of ss) {
      try {
        const t = $(s).first().text().replace(/\s+/g, " ").trim();
        if (t) return t;
      } catch {}
    }
    return "";
  };
  const firstAttr = (ss: string[], attr: string) => {
    for (const s of ss) {
      try {
        const v = ($(s).first().attr(attr) || "").trim();
        if (v && !v.startsWith("data:") && v.startsWith("http")) return v;
      } catch {}
    }
    return "";
  };

  if (!acc.product_title) {
    acc.product_title = firstText(sel.title) || $("title").text().trim() || "";
  }

  if (!acc.price) {
    acc.price = firstText(sel.price)
      || $('meta[property="product:price:amount"]').attr("content") || "";
  }

  if (!acc.original_price) {
    acc.original_price = firstText(sel.originalPrice);
  }

  if (!acc.brand) {
    acc.brand = firstText(sel.brand).replace(/^(Visit the |Brand:\s*|by\s*)/i, "").trim();
  }

  if (!acc.description) {
    acc.description = firstText(sel.description)
      || $('meta[property="og:description"]').attr("content")
      || $('meta[name="description"]').attr("content")
      || "";
  }

  // Platform-specific image logic (Amazon dynamic-image JSON)
  if (platform === "amazon" && !acc.image_url) {
    const dynImg = $("#landingImage").attr("data-a-dynamic-image");
    if (dynImg) {
      try {
        const parsed = JSON.parse(dynImg);
        const keys = Object.keys(parsed);
        acc.image_url = keys.sort((a, b) => (parsed[b][0] * parsed[b][1]) - (parsed[a][0] * parsed[a][1]))[0];
        acc.images = [...(acc.images || []), acc.image_url];
      } catch {}
    }
    if (!acc.image_url) acc.image_url = firstAttr(sel.image, "data-old-hires");
  }

  if (!acc.image_url) {
    acc.image_url = firstAttr(sel.image, "src")
      || firstAttr(sel.image, "data-src")
      || $('meta[property="og:image"]').attr("content")
      || $('meta[name="twitter:image"]').attr("content")
      || "";
  }

  // Collect additional images from srcsets
  const imgUrls: string[] = [];
  sel.image.forEach((s) => {
    $(s).each((_, el) => {
      const src = $(el).attr("src");
      const dataSrc = $(el).attr("data-src");
      const srcset = $(el).attr("srcset");
      if (src && isValidImageUrl(src)) imgUrls.push(src);
      if (dataSrc && isValidImageUrl(dataSrc)) imgUrls.push(dataSrc);
      if (srcset) {
        for (const part of srcset.split(",")) {
          const u = part.trim().split(" ")[0];
          if (isValidImageUrl(u)) imgUrls.push(u);
        }
      }
    });
  });
  acc.images = normalizeImages([...(acc.images || []), ...imgUrls]);

  if (!acc.rating) {
    const ratingRaw = firstText(sel.rating) || $('[itemprop="ratingValue"]').attr("content") || "";
    const m = ratingRaw.match(/[\d.]+/);
    acc.rating = m ? m[0] : "";
  }

  if (!acc.review_count) {
    const rawCount = firstText(sel.reviewCount);
    const m = rawCount.match(/[\d,]+/);
    acc.review_count = m ? m[0].replace(/,/g, "") : "";
  }

  if (!acc.features?.length) {
    const features: string[] = [];
    sel.features.forEach((s) => {
      $(s).each((_, el) => {
        const t = $(el).text().replace(/\s+/g, " ").trim();
        if (t.length > 4 && t.length < 300) features.push(t);
      });
    });
    acc.features = [...new Set(features)].slice(0, 8);
  }

  return acc;
}
