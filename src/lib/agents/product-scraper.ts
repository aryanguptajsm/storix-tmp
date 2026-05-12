// ============================================================
// STORIX PRODUCTION SCRAPER — MAIN ORCHESTRATOR
// v2.0 — Production Grade Architecture
//
// Pipeline:
//   1. Open product page (Playwright)
//   2. Wait for network idle
//   3. Perform gradual human scrolling
//   4. Intercept API/fetch/XHR responses
//   5. Extract: API → JSON-LD → __NEXT_DATA__ → DOM → Cheerio
//   6. Merge and clean results
//   7. Remove duplicate images
//   8. Validate all image URLs
//   9. Return normalized ScrapedProduct JSON
// ============================================================

import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedProduct, ScrapeAttemptLog } from "./types";
import {
  detectPlatform,
  sleep,
  getRandomUA,
  mergeAccumulators,
  deriveScrapeStatus,
  normalizeImages,
  type ExtractionAccumulator,
} from "./utils";
import { extractFromCheerio } from "extractors";
import { BrowserManager, scrapeWithPlaywright, assembleResult } from "./playwright-engine";
import { classifyScrapeError } from "./contracts";

// Keep contracts.ts working for existing code
export { classifyScrapeError, detectPlatformFromUrl, deriveScrapeStatus as deriveScrapeStatusLegacy, type ScrapeAttemptLog, type ScrapePlatform, type ScrapeStatus, type ScrapeErrorType } from "./contracts";
export type { ScrapedProduct };

// ─────────────────────────────────────────────────────────────────────────────
// Legacy-compatible result shape (wraps new ScrapedProduct)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductScrapeResult {
  product_title: string;
  product_url: string;
  image_url: string | null;
  description?: string;
  price?: string;
  original_price?: string;
  discount?: string;
  rating?: string;
  review_count?: string;
  brand?: string;
  category?: string;
  features?: string[];
  image_status: "ok" | "not_found" | "error";
  http_code: number;
  error_reason?: string;
  error_type?: string;
  status: "success" | "partial" | "failed";
  platform: string;
  attempts: ScrapeAttemptLog[];
  scraped_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// JS-heavy detection
// ─────────────────────────────────────────────────────────────────────────────

const JS_HEAVY_PATTERN = /amazon|flipkart|meesho|myntra|ajio|ebay|shopify/i;

function isJsHeavy(url: string): boolean {
  return JS_HEAVY_PATTERN.test(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductScraper — main class (drop-in replacement for existing class)
// ─────────────────────────────────────────────────────────────────────────────

export class ProductScraper {
  private bm: BrowserManager;

  constructor(_affiliateTag?: string) {
    this.bm = new BrowserManager();
  }

  public async close(): Promise<void> {
    await this.bm.close();
  }

  // ── Main scrape entry point ────────────────────────────────────────────────

  public async scrape(url: string, retries = 3): Promise<ProductScrapeResult> {
    const scrapedAt = new Date().toISOString();
    const platform = detectPlatform(url);
    const attempts: ScrapeAttemptLog[] = [];
    let lastError = "Scraping failed";
    let attemptNum = 0;
    let delay = 2000 + Math.random() * 2000;

    while (attemptNum <= retries) {
      try {
        await sleep(delay);
        const currentAttempt = attemptNum + 1;

        let acc: ExtractionAccumulator = {};
        let html = "";

        if (isJsHeavy(url)) {
          // Playwright path (primary for JS-heavy sites)
          attempts.push({
            attempt: currentAttempt,
            strategy: "playwright",
            message: `Playwright extraction started for ${platform}`,
            at: new Date().toISOString(),
          });

          const browser = await this.bm.get();
          const result = await scrapeWithPlaywright(url, browser, platform);
          acc = result.acc;
          html = result.html;
        } else {
          // Lightweight HTTP path first
          attempts.push({
            attempt: currentAttempt,
            strategy: "http",
            message: `HTTP extraction started for ${platform}`,
            at: new Date().toISOString(),
          });

          try {
            const res = await axios.get(url, {
              headers: {
                "User-Agent": getRandomUA(),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
              },
              timeout: 20000,
              validateStatus: (s) => s < 500,
            });

            if (res.status === 429) {
              attempts.push({ attempt: currentAttempt, strategy: "http", message: "429 rate-limited — pausing 30s", error_type: "blocked", at: new Date().toISOString() });
              await sleep(30000);
              attemptNum++;
              delay *= 2;
              continue;
            }

            if (res.status === 200 && typeof res.data === "string") {
              html = res.data;
              const $ = cheerio.load(html);
              acc = extractFromCheerio($, platform);
            }

            // If critical fields are missing, escalate to Playwright
            if (!acc.price || !acc.image_url || !acc.product_title) {
              attempts.push({ attempt: currentAttempt, strategy: "playwright", message: "Playwright escalation after incomplete HTTP extraction", at: new Date().toISOString() });
              const browser = await this.bm.get();
              const pw = await scrapeWithPlaywright(url, browser, platform);
              acc = mergeAccumulators(acc, pw.acc);
              if (pw.html) html = pw.html;
            }
          } catch (httpErr) {
            // HTTP failed — go straight to Playwright
            attempts.push({ attempt: currentAttempt, strategy: "playwright", message: "Playwright fallback after HTTP error", at: new Date().toISOString() });
            const browser = await this.bm.get();
            const pw = await scrapeWithPlaywright(url, browser, platform);
            acc = pw.acc;
            html = pw.html;
          }
        }

        // Finalize and validate images
        const final = await assembleResult(acc, url, platform);

        const imageStatus: "ok" | "not_found" | "error" =
          final.thumbnail ? "ok" : acc.error_reason?.includes("error") ? "error" : "not_found";

        // Log result
        attempts.push({
          attempt: currentAttempt,
          strategy: "playwright",
          message: `Extraction complete — status: ${final.status}, image: ${imageStatus}`,
          at: new Date().toISOString(),
        });

        return {
          product_title: final.product_title || "Unknown Product",
          product_url: url,
          image_url: final.thumbnail || null,
          description: final.description,
          price: final.price,
          original_price: final.original_price,
          discount: final.discount,
          rating: final.rating,
          review_count: final.review_count,
          brand: final.brand,
          category: final.category,
          features: final.features,
          image_status: imageStatus,
          http_code: 200,
          error_reason: final.error_reason,
          error_type: final.error_reason ? classifyScrapeError(final.error_reason) : undefined,
          status: final.status,
          platform,
          attempts,
          scraped_at: scrapedAt,
        };
      } catch (err) {
        attemptNum++;
        const msg = err instanceof Error ? err.message : String(err);
        lastError = msg;
        attempts.push({
          attempt: attemptNum,
          strategy: isJsHeavy(url) ? "playwright" : "http",
          message: msg,
          error_type: classifyScrapeError(msg),
          at: new Date().toISOString(),
        });
        if (attemptNum > retries) break;
        delay *= 2;
      }
    }

    return {
      product_title: "Error",
      product_url: url,
      image_url: null,
      image_status: "error",
      http_code: 0,
      error_reason: lastError,
      error_type: classifyScrapeError(lastError),
      status: "failed",
      platform,
      attempts,
      scraped_at: scrapedAt,
    };
  }
}
