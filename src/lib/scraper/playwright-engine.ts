// ============================================================
// STORIX PRODUCTION SCRAPER — PLAYWRIGHT ENGINE
// Responsibilities:
//  - Browser lifecycle management
//  - Human-like page loading + scrolling
//  - Network API interception
//  - Coordinating all extraction strategies
// ============================================================

import axios from "axios";
import * as cheerio from "cheerio";
import { chromium, Browser, Page, Response } from "playwright";
import type {
  CapturedApiPayload,
  ExtractionAccumulator,
  ScrapePlatform,
} from "./types";
import {
  getRandomUA,
  sleep,
  detectPlatform,
  normalizeImages,
  upgradeImageResolution,
  calculateDiscount,
  detectCurrency,
  mergeAccumulators,
  deriveScrapeStatus,
  stripTrackingParams,
  isValidImageUrl,
} from "./utils";
import { getAdapter } from "./adapters";
import {
  extractFromJsonLd,
  extractFromNextData,
  extractFromApiPayloads,
  extractFromCheerio,
  buildDomExtractScript,
  type DomSnapshotResult,
} from "./extractors";

// ─────────────────────────────────────────────────────────────────────────────
// Image Validator
// ─────────────────────────────────────────────────────────────────────────────

async function validateImageUrl(url: string): Promise<boolean> {
  if (!url || url.startsWith("data:")) return false;
  try {
    const res = await axios.head(url, {
      headers: { "User-Agent": getRandomUA() },
      timeout: 6000,
      validateStatus: (s) => s < 400,
    });
    const ct = res.headers["content-type"] || "";
    return ct.startsWith("image/") || res.status < 300;
  } catch {
    // HEAD blocked — try a minimal GET
    try {
      const res = await axios.get(url, {
        headers: { "User-Agent": getRandomUA() },
        timeout: 6000,
        responseType: "stream",
      });
      (res.data as any).destroy?.();
      return res.status < 400;
    } catch {
      return false;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Capture Filter
// ─────────────────────────────────────────────────────────────────────────────

function shouldCaptureResponse(response: Response): boolean {
  const url = response.url();
  const rt = response.request().resourceType();
  const ct = response.headers()["content-type"] || "";
  const isJson = /application\/json|application\/graphql-response\+json|text\/json/i.test(ct);
  const relevant = /product|pdp|item|sku|detail|graphql|catalog|api|search\/v\d/i.test(url);
  return response.ok() && ["xhr", "fetch"].includes(rt) && isJson && relevant;
}

async function captureApiPayload(response: Response): Promise<CapturedApiPayload | null> {
  if (!shouldCaptureResponse(response)) return null;
  try {
    const text = await response.text();
    if (!text || text.length > 2_000_000) return null;
    const body = JSON.parse(text);
    return { url: response.url(), status: response.status(), body };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Playwright Page Engine
// ─────────────────────────────────────────────────────────────────────────────

async function humanScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      let idleTicks = 0;
      const maxIdle = 5;
      let prevHeight = document.body.scrollHeight;
      // Random-ish step size (700-1100px) for human simulation
      const step = 700 + Math.floor(Math.random() * 400);

      const timer = setInterval(() => {
        window.scrollBy(0, step);
        totalHeight += step;
        const curHeight = document.body.scrollHeight;
        if (curHeight === prevHeight) idleTicks++;
        else { idleTicks = 0; prevHeight = curHeight; }

        const atBottom = window.innerHeight + window.scrollY >= curHeight - 4;
        const guardHit = totalHeight > 25000;

        if ((atBottom && idleTicks >= maxIdle) || guardHit) {
          clearInterval(timer);
          window.scrollTo(0, 0); // Reset for gallery/lazy reloads
          resolve();
        }
      }, 300 + Math.floor(Math.random() * 200)); // 300-500ms intervals
    });
  });
}

async function waitForProductContent(page: Page, platform: ScrapePlatform): Promise<void> {
  const sel = getAdapter(platform);
  // Race between platform-specific selectors
  await Promise.any(
    sel.waitFor.map((s) => page.waitForSelector(s, { state: "visible", timeout: 15000 }))
  ).catch(() => {});

  // Also wait for meaningful body text + JSON-LD
  await page.waitForFunction(
    () => {
      const ready = document.readyState === "complete" || document.readyState === "interactive";
      const hasText = (document.body?.innerText?.trim().length ?? 0) > 200;
      const hasLd = document.querySelectorAll('script[type="application/ld+json"]').length > 0;
      return ready && (hasText || hasLd);
    },
    { timeout: 12000 }
  ).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Playwright Scrape
// ─────────────────────────────────────────────────────────────────────────────

export async function scrapeWithPlaywright(
  targetUrl: string,
  browser: Browser,
  platform: ScrapePlatform,
): Promise<{ acc: ExtractionAccumulator; html: string }> {
  const context = await browser.newContext({
    userAgent: getRandomUA(),
    viewport: { width: 1920, height: 1080 },
    locale: "en-US",
    timezoneId: "Asia/Kolkata",
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
    },
  });

  const page = await context.newPage();

  // Stealth: mask automation fingerprints
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    // @ts-ignore
    window.chrome = { runtime: {} };
  });

  const capturedPayloads: CapturedApiPayload[] = [];
  const captureTasks: Promise<void>[] = [];

  // Block irrelevant resources for speed
  await page.route(/\.(woff2?|ttf|eot|otf|mp4|mp3|avi|mov|pdf)$/i, (r) => r.abort());

  page.on("response", (resp) => {
    const task = captureApiPayload(resp)
      .then((p) => { if (p) capturedPayloads.push(p); })
      .catch(() => {});
    captureTasks.push(task);
  });

  try {
    // Navigate
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 35000 });
    await page.waitForLoadState("load", { timeout: 20000 }).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});

    // Stabilize + wait for product signals
    await sleep(800 + Math.random() * 400);
    await waitForProductContent(page, platform);

    // Human-like scroll to trigger lazy loads
    await humanScroll(page);

    // Wait for any final lazy network calls
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await sleep(500);
    await Promise.allSettled(captureTasks);

    // Get full page HTML for Cheerio + JSON-LD pass
    const html = await page.content();
    const $ = cheerio.load(html);

    // ── Extraction cascade ─────────────────────────────────────────────────
    const sel = getAdapter(platform);

    // 1. API intercept (highest fidelity)
    const apiAcc = extractFromApiPayloads(capturedPayloads);

    // 2. JSON-LD + __NEXT_DATA__
    const htmlAcc = extractFromCheerio($, platform);

    // 3. Live DOM snapshot (catches lazy-rendered elements)
    const domFn = buildDomExtractScript(platform, sel);
    let domSnap: DomSnapshotResult | null = null;
    try {
      domSnap = await page.evaluate(
        domFn as (args: { platform: string; sel: typeof sel }) => DomSnapshotResult,
        { platform, sel }
      );
    } catch {}

    const domAcc: ExtractionAccumulator = domSnap
      ? {
          product_title: domSnap.product_title,
          price: domSnap.price,
          original_price: domSnap.original_price,
          discount: domSnap.discount,
          image_url: domSnap.image_url,
          images: normalizeImages(domSnap.images),
          description: domSnap.description,
          rating: domSnap.rating,
          review_count: domSnap.review_count,
          brand: domSnap.brand,
          features: domSnap.features,
          variants: domSnap.variants,
          availability: domSnap.availability,
        }
      : {};

    // Merge: API > HTML (JSON-LD/NEXT_DATA/Cheerio) > DOM
    const merged = mergeAccumulators(
      mergeAccumulators(apiAcc, htmlAcc),
      domAcc,
    );

    await context.close();
    return { acc: merged, html };
  } catch (err) {
    await context.close().catch(() => {});
    const msg = err instanceof Error ? err.message : String(err);
    return { acc: { error_reason: `Playwright error: ${msg}` }, html: "" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser Manager
// ─────────────────────────────────────────────────────────────────────────────

export class BrowserManager {
  private browser: Browser | null = null;

  async get(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          "--disable-blink-features=AutomationControlled",
          "--disable-dev-shm-usage",
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-infobars",
          "--window-size=1920,1080",
          "--disable-extensions",
          "--disable-gpu",
        ],
      });
    }
    return this.browser;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Final Result Assembler
// ─────────────────────────────────────────────────────────────────────────────

export async function assembleResult(
  acc: ExtractionAccumulator,
  url: string,
  platform: ScrapePlatform,
): Promise<ExtractionAccumulator & { thumbnail: string; status: "success" | "partial" | "failed" }> {
  // Upgrade image resolution
  let thumbnail = acc.image_url || "";
  if (thumbnail) {
    thumbnail = upgradeImageResolution(stripTrackingParams(thumbnail), platform);
  }

  // Validate thumbnail
  let thumbnailValid = false;
  if (thumbnail) {
    thumbnailValid = await validateImageUrl(thumbnail);
    if (!thumbnailValid) thumbnail = "";
  }

  // Upgrade + validate remaining images
  const allImages = normalizeImages([thumbnail, ...(acc.images || [])].map((u) => {
    if (!u) return u;
    return upgradeImageResolution(stripTrackingParams(u), platform);
  }));

  // Fall back: first valid image becomes thumbnail
  if (!thumbnail) {
    for (const img of allImages) {
      if (await validateImageUrl(img)) {
        thumbnail = img;
        break;
      }
    }
  }

  // Auto-calculate discount
  let discount = acc.discount || "";
  if (!discount && acc.price && acc.original_price) {
    discount = calculateDiscount(acc.price, acc.original_price);
  }

  const currency = detectCurrency(acc.price || "");

  const finalAcc: ExtractionAccumulator = {
    ...acc,
    image_url: thumbnail || null as unknown as string,
    images: allImages,
    discount,
    currency,
  };

  const status = deriveScrapeStatus(finalAcc);

  return { ...finalAcc, thumbnail, status };
}
