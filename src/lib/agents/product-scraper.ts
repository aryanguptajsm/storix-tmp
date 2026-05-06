import axios from "axios";
import * as cheerio from "cheerio";
import { chromium, Browser, Page, Response } from "playwright";
import { GeminiProductExtractor, type AiProductExtractionResult } from "./gemini-product-extractor";
import {
  classifyScrapeError,
  deriveScrapeStatus,
  detectPlatformFromUrl,
  type ScrapeAttemptLog,
  type ScrapeErrorType,
  type ScrapePlatform,
  type ScrapeStatus,
} from "@/lib/scraper/contracts";

/**
 * ProductScraper Agent
 * Specialized in extracting high-quality product images and data.
 */

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
  error_type?: ScrapeErrorType;
  status: ScrapeStatus;
  platform: ScrapePlatform;
  attempts: ScrapeAttemptLog[];
  scraped_at: string;
}

const UA_POOL = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
];

type CapturedApiPayload = {
  url: string;
  status: number;
  body: unknown;
};

type JsonObject = Record<string, unknown>;

export class ProductScraper {
  private browser: Browser | null = null;
  private affiliateTag: string;
  private aiExtractor: GeminiProductExtractor;

  constructor(affiliateTag: string = "YOUR_TAG") {
    this.affiliateTag = affiliateTag;
    this.aiExtractor = new GeminiProductExtractor(
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    );
  }

  private getRandomUA() {
    return UA_POOL[Math.floor(Math.random() * UA_POOL.length)];
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          "--disable-blink-features=AutomationControlled",
          "--disable-dev-shm-usage",
          "--no-sandbox",
        ],
      });
    }
    return this.browser;
  }

  public async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Main scrape method
   */
  public async scrape(url: string, retryCount: number = 3): Promise<ProductScrapeResult> {
    const scrapedAt = new Date().toISOString();
    let attempt = 0;
    let delay = 2000 + Math.random() * 2000; // 2-4s initial delay
    let lastHttpCode = 0;
    let lastErrorMessage = "Scraping failed";
    const platform = detectPlatformFromUrl(url);
    const attempts: ScrapeAttemptLog[] = [];

    const finalUrl = this.appendAffiliateTag(url);

    while (attempt <= retryCount) {
      try {
        await this.sleep(delay);
        const currentAttempt = attempt + 1;

        let result: Partial<ProductScrapeResult> = {
          product_url: finalUrl,
          scraped_at: scrapedAt,
        };
        let capturedHtml = "";

        // JS-heavy sites go straight to Playwright for best results
        if (this.isJsHeavy(url)) {
          attempts.push({
            attempt: currentAttempt,
            strategy: "playwright",
            message: `Playwright extraction started for ${platform}`,
            at: new Date().toISOString(),
          });
          const pwResult = await this.scrapeWithPlaywright(url);
          capturedHtml = pwResult.html;
          result = { ...result, ...pwResult.data, http_code: 200 };
          lastHttpCode = 200;
        } else {
          // Try standard fetch first (fast)
          attempts.push({
            attempt: currentAttempt,
            strategy: "http",
            message: `HTTP extraction started for ${platform}`,
            at: new Date().toISOString(),
          });
          const response = await axios.get(url, {
            headers: {
              "User-Agent": this.getRandomUA(),
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
            },
            timeout: 15000,
            validateStatus: (status) => status < 500,
          });
          capturedHtml = typeof response.data === "string" ? response.data : "";

          if (response.status === 429) {
            console.warn(`429 Too Many Requests for ${url}. Pausing 30s...`);
            attempts.push({
              attempt: currentAttempt,
              strategy: "http",
              message: "Remote site returned 429 rate limit",
              error_type: "blocked",
              at: new Date().toISOString(),
            });
            await this.sleep(30000);
            attempt++;
            delay *= 2;
            continue;
          }

          result.http_code = response.status;
          lastHttpCode = response.status;

          if (response.status === 200) {
            const $ = cheerio.load(response.data);
            const extracted = this.extractDataFromCheerio($, url);
            result = { ...result, ...extracted };

            // If cheerio found no image or title, fallback to Playwright
            if (!result.image_url || result.product_title === "Unknown Product") {
              attempts.push({
                attempt: currentAttempt,
                strategy: "playwright",
                message: "Fallback to Playwright after incomplete HTTP extraction",
                at: new Date().toISOString(),
              });
              const pwResult = await this.scrapeWithPlaywright(url);
              if (pwResult.html) capturedHtml = pwResult.html;
              result = this.mergeProductData(result, pwResult.data);
            }
          } else {
            // Non-200 response, try Playwright
            attempts.push({
              attempt: currentAttempt,
              strategy: "playwright",
              message: `Fallback to Playwright after HTTP ${response.status}`,
              at: new Date().toISOString(),
            });
            const pwResult = await this.scrapeWithPlaywright(url);
            if (pwResult.html) capturedHtml = pwResult.html;
            result = { ...result, ...pwResult.data };
          }
        }

        const aiFallbackResult = await this.runAiFallback({
          url,
          platform,
          html: capturedHtml,
          result,
          currentAttempt,
          attempts,
        });
        result = aiFallbackResult.result;

        // Validate image URL
        if (result.image_url) {
          result.image_url = this.upgradeImageResolution(result.image_url, url);
          const isValid = await this.validateImage(result.image_url);
          if (!isValid) {
            result.image_url = null;
            result.image_status = "not_found";
            result.error_reason = "Image validation failed (non-200)";
          } else {
            result.image_status = "ok";
          }
        } else {
          result.image_status = "not_found";
          result.error_reason = result.error_reason || "No image found in content";
        }

        // Auto-calculate discount if we have both prices but no discount
        if (result.price && result.original_price && !result.discount) {
          result.discount = this.calculateDiscount(result.price, result.original_price);
        }

        const status = deriveScrapeStatus({
          title: result.product_title,
          price: result.price,
          image: result.image_url,
          rating: result.rating,
          review_count: result.review_count,
          brand: result.brand,
        });

        return {
          product_title: result.product_title || "Unknown Product",
          product_url: result.product_url || finalUrl,
          image_url: result.image_url || null,
          description: result.description,
          price: result.price,
          original_price: result.original_price,
          discount: result.discount,
          rating: result.rating,
          review_count: result.review_count,
          brand: result.brand,
          category: result.category,
          features: result.features,
          image_status: result.image_status || "not_found",
          http_code: result.http_code || lastHttpCode,
          error_reason: result.error_reason,
          error_type: result.error_reason ? classifyScrapeError(result.error_reason) : undefined,
          status,
          platform,
          attempts,
          scraped_at: scrapedAt,
        };
      } catch (error: unknown) {
        attempt++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        lastErrorMessage = errorMessage;
        attempts.push({
          attempt,
          strategy: this.isJsHeavy(url) ? "playwright" : "http",
          message: errorMessage,
          error_type: classifyScrapeError(errorMessage),
          at: new Date().toISOString(),
        });
        if (attempt > retryCount) {
          return {
            product_title: "Error",
            product_url: finalUrl,
            image_url: null,
            image_status: "error",
            http_code: lastHttpCode,
            error_reason: lastErrorMessage,
            error_type: classifyScrapeError(lastErrorMessage),
            status: "failed",
            platform,
            attempts,
            scraped_at: scrapedAt,
          };
        }
        delay *= 2;
      }
    }

    return {
      product_title: "Error",
      product_url: finalUrl,
      image_url: null,
      image_status: "error",
      http_code: lastHttpCode,
      error_reason: lastErrorMessage || "Max retries exceeded",
      error_type: classifyScrapeError(lastErrorMessage || "Max retries exceeded"),
      status: "failed",
      platform,
      attempts,
      scraped_at: scrapedAt,
    };
  }

  private mergeProductData(
    base: Partial<ProductScrapeResult>,
    incoming: Partial<ProductScrapeResult>,
  ): Partial<ProductScrapeResult> {
    const merged = { ...base };
    const scalarKeys: (keyof ProductScrapeResult)[] = [
      "product_title",
      "image_url",
      "description",
      "price",
      "original_price",
      "discount",
      "rating",
      "review_count",
      "brand",
      "category",
    ];

    for (const key of scalarKeys) {
      const baseValue = merged[key];
      const incomingValue = incoming[key];
      const baseEmpty = !baseValue || baseValue === "Unknown Product";
      if (incomingValue && baseEmpty) {
        merged[key] = incomingValue as never;
      }
    }

    if ((!merged.features || merged.features.length === 0) && incoming.features?.length) {
      merged.features = incoming.features;
    }

    if (!merged.error_reason && incoming.error_reason) {
      merged.error_reason = incoming.error_reason;
    }

    return merged;
  }

  private isJsHeavy(url: string): boolean {
    const jsHeavyDomains = [/amazon/i, /flipkart/i, /ebay/i, /meesho/i, /myntra/i, /ajio/i];
    return jsHeavyDomains.some((d) => d.test(url));
  }

  private shouldUseAiFallback(result: Partial<ProductScrapeResult>): boolean {
    const missingCoreFields = [
      !result.product_title || result.product_title === "Unknown Product",
      !result.price,
      !result.image_url,
      !result.brand,
      !result.rating,
      !result.review_count,
    ].filter(Boolean).length;

    return missingCoreFields >= 2;
  }

  private mapAiResult(aiResult: AiProductExtractionResult): Partial<ProductScrapeResult> {
    return {
      product_title: aiResult.title || undefined,
      price: aiResult.price || undefined,
      image_url: aiResult.image || undefined,
      rating: aiResult.rating || undefined,
      review_count: aiResult.review_count || undefined,
      brand: aiResult.brand || undefined,
    };
  }

  private async runAiFallback(params: {
    url: string;
    platform: ScrapePlatform;
    html: string;
    result: Partial<ProductScrapeResult>;
    currentAttempt: number;
    attempts: ScrapeAttemptLog[];
  }): Promise<{ result: Partial<ProductScrapeResult> }> {
    const { url, platform, html, result, currentAttempt, attempts } = params;

    if (!html || !this.shouldUseAiFallback(result) || !this.aiExtractor.isConfigured()) {
      return { result };
    }

    attempts.push({
      attempt: currentAttempt,
      strategy: "ai_fallback",
      message: "AI fallback started for missing fields",
      at: new Date().toISOString(),
    });

    try {
      const aiResult = await this.aiExtractor.extractFromHtml({
        url,
        platform,
        html,
        existing: {
          title: result.product_title || null,
          price: result.price || null,
          image: result.image_url || null,
          rating: result.rating || null,
          review_count: result.review_count || null,
          brand: result.brand || null,
        },
      });

      if (!aiResult) {
        attempts.push({
          attempt: currentAttempt,
          strategy: "ai_fallback",
          message: "AI fallback skipped or returned no structured payload",
          error_type: "ai_error",
          at: new Date().toISOString(),
        });
        return { result };
      }

      attempts.push({
        attempt: currentAttempt,
        strategy: "ai_fallback",
        message: "AI fallback returned structured fields",
        at: new Date().toISOString(),
      });

      return { result: this.mergeProductData(result, this.mapAiResult(aiResult)) };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      attempts.push({
        attempt: currentAttempt,
        strategy: "ai_fallback",
        message,
        error_type: "ai_error",
        at: new Date().toISOString(),
      });

      if (!result.error_reason) {
        result.error_reason = `AI fallback error: ${message}`;
      }

      return { result };
    }
  }

  private appendAffiliateTag(url: string): string {
    try {
      const parsed = new URL(url);
      if (!parsed.searchParams.has("tag")) {
        parsed.searchParams.set("tag", this.affiliateTag);
      }
      return parsed.toString();
    } catch {
      return url;
    }
  }

  /** Upgrade Amazon/Flipkart image URLs to highest resolution */
  private upgradeImageResolution(imageUrl: string, pageUrl: string): string {
    try {
      if (/amazon/i.test(pageUrl) || /media-amazon/i.test(imageUrl) || /ssl-images-amazon/i.test(imageUrl)) {
        // Amazon images: replace size tokens like ._SX300_ or ._SL1500_ with max resolution
        return imageUrl
          .replace(/\._[A-Z]{2}\d+_?\./g, ".")
          .replace(/\._[A-Z]{2}\d+,\d+_?\./g, ".");
      }
      if (/flipkart/i.test(pageUrl) || /rukminim/i.test(imageUrl)) {
        // Flipkart: upgrade to 832x832 and best quality
        return imageUrl
          .replace(/\d+\/\d+/g, "832/832")
          .replace(/q=\d+/g, "q=90");
      }
    } catch {}
    return imageUrl;
  }

  /** Calculate discount percentage from two price strings */
  private calculateDiscount(currentPrice: string, originalPrice: string): string {
    try {
      const current = parseFloat(currentPrice.replace(/[^0-9.]/g, ""));
      const original = parseFloat(originalPrice.replace(/[^0-9.]/g, ""));
      if (original > current && original > 0) {
        return Math.round(((original - current) / original) * 100).toString();
      }
    } catch {}
    return "";
  }

  private async validateImage(url: string): Promise<boolean> {
    if (!url || url.startsWith("data:")) return false;
    try {
      const res = await axios.head(url, {
        headers: { "User-Agent": this.getRandomUA() },
        timeout: 5000,
      });
      return res.status === 200;
    } catch {
      // Some servers block HEAD, try small GET
      try {
        const res = await axios.get(url, {
          headers: { "User-Agent": this.getRandomUA() },
          timeout: 5000,
          responseType: "stream",
        });
        res.data.destroy(); // Close stream immediately
        return res.status === 200;
      } catch {
        return false;
      }
    }
  }

  private isRecord(value: unknown): value is JsonObject {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  private extractDataFromCheerio($: cheerio.CheerioAPI, url: string): Partial<ProductScrapeResult> {
    // 1. Try JSON-LD first — most reliable structured data source
    const jsonLdData = this.extractFromJsonLd($);

    // 2. Platform-specific extraction
    const platformData = this.extractPlatformSpecific($, url);

    // 3. Generic OG/meta fallbacks
    const metaData = this.extractMetaFallbacks($);

    // Merge with priority: platform > jsonLd > meta
    const title = platformData.product_title || jsonLdData.product_title || metaData.product_title || "Unknown Product";
    const image_url = platformData.image_url || jsonLdData.image_url || metaData.image_url || this.extractLargestImage($) || null;
    const description = platformData.description || jsonLdData.description || metaData.description || "";
    const price = platformData.price || jsonLdData.price || metaData.price || "";
    const original_price = platformData.original_price || jsonLdData.original_price || "";
    const discount = platformData.discount || jsonLdData.discount || "";
    const rating = platformData.rating || jsonLdData.rating || "";
    const review_count = platformData.review_count || jsonLdData.review_count || "";
    const brand = platformData.brand || jsonLdData.brand || "";
    const category = platformData.category || jsonLdData.category || "";
    const features = platformData.features || [];

    return { product_title: title, image_url, description, price, original_price, discount, rating, review_count, brand, category, features };
  }

  /** Extract structured data from JSON-LD scripts */
  private extractFromJsonLd($: cheerio.CheerioAPI): Partial<ProductScrapeResult> {
    const result: Partial<ProductScrapeResult> = {};
    const jsonLd = $('script[type="application/ld+json"]');

    for (const el of jsonLd.toArray()) {
      try {
        let data = JSON.parse($(el).html() || "{}");

        // Handle @graph arrays
        if (data["@graph"] && Array.isArray(data["@graph"])) {
          data = data["@graph"];
        }

        const products = this.findProductsInJson(Array.isArray(data) ? data : [data]);
        if (products.length === 0) continue;

        const product = products[0];

        if (product.name && !result.product_title) {
          result.product_title = String(product.name).trim();
        }

        if (product.image && !result.image_url) {
          const image = product.image;
          if (Array.isArray(image)) {
            const firstImage = image[0];
            result.image_url =
              typeof firstImage === "string"
                ? firstImage
                : this.isRecord(firstImage) && typeof firstImage.url === "string"
                  ? firstImage.url
                  : undefined;
          } else if (typeof image === "string") {
            result.image_url = image;
          } else if (this.isRecord(image) && typeof image.url === "string") {
            result.image_url = image.url;
          }
        }

        if (product.description && !result.description) {
          result.description = String(product.description).trim().substring(0, 500);
        }

        if (product.brand && !result.brand) {
          result.brand =
            typeof product.brand === "string"
              ? product.brand
              : this.isRecord(product.brand) && typeof product.brand.name === "string"
                ? product.brand.name
                : "";
        }

        if (product.category && !result.category) {
          result.category = String(product.category);
        }

        // Extract offers/pricing
        const offers = product.offers;
        if (offers && !result.price) {
          const offerObj = Array.isArray(offers) ? offers[0] : offers;
          if (this.isRecord(offerObj)) {
            const priceCurrency = typeof offerObj.priceCurrency === "string" ? offerObj.priceCurrency : "";
            const curr = priceCurrency === "INR" ? "₹" : priceCurrency === "USD" ? "$" : priceCurrency;
            if (offerObj.price) {
              result.price = `${curr}${String(offerObj.price)}`;
            } else if (offerObj.lowPrice) {
              result.price = `${curr}${String(offerObj.lowPrice)}`;
            }
            if (offerObj.highPrice && offerObj.lowPrice) {
              result.original_price = `${curr}${String(offerObj.highPrice)}`;
            }
          }
        }

        // Extract rating
        const aggRating = product.aggregateRating;
        if (this.isRecord(aggRating) && !result.rating) {
          result.rating = String(aggRating.ratingValue || "");
          result.review_count = String(aggRating.reviewCount || aggRating.ratingCount || "");
        }
      } catch {}
    }

    return result;
  }

  /** Recursively find Product-type objects in JSON-LD */
  private findProductsInJson(items: unknown[]): JsonObject[] {
    const products: JsonObject[] = [];
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const jsonItem = item as JsonObject;
      if (jsonItem["@type"] === "Product" || jsonItem["@type"] === "IndividualProduct") {
        products.push(jsonItem);
      }
      if (Array.isArray(item)) {
        products.push(...this.findProductsInJson(item));
        continue;
      }
      for (const value of Object.values(jsonItem)) {
        if (value && typeof value === "object") {
          products.push(...this.findProductsInJson(Array.isArray(value) ? value : [value]));
        }
      }
    }
    return products;
  }

  /** Platform-specific CSS selector extraction */
  private extractPlatformSpecific($: cheerio.CheerioAPI, url: string): Partial<ProductScrapeResult> & { features?: string[] } {
    if (/amazon/i.test(url)) return this.extractAmazon($);
    if (/flipkart/i.test(url)) return this.extractFlipkart($);
    if (/meesho/i.test(url)) return this.extractMeesho($);
    return {};
  }

  private extractAmazon($: cheerio.CheerioAPI): Partial<ProductScrapeResult> & { features?: string[] } {
    const result: Partial<ProductScrapeResult> & { features?: string[] } = {};

    // Title
    result.product_title = $("#productTitle").text().trim() || $("h1#title span").text().trim() || "";

    // Brand
    result.brand = $("#bylineInfo").text().trim().replace(/^(Visit the |Brand: )/, "") || "";

    // Image — multiple strategies
    const dynamicImage = $("#landingImage").attr("data-a-dynamic-image");
    if (dynamicImage) {
      try {
        const parsed = JSON.parse(dynamicImage);
        const keys = Object.keys(parsed);
        result.image_url = keys.sort((a, b) => (parsed[b][0] * parsed[b][1]) - (parsed[a][0] * parsed[a][1]))[0];
      } catch {}
    }
    if (!result.image_url) {
      result.image_url = $("#landingImage").attr("data-old-hires") || "";
    }
    if (!result.image_url) {
      result.image_url = $(".imgTagWrapper img").attr("src") || "";
    }
    if (result.image_url?.startsWith("data:")) result.image_url = "";

    // Price — try multiple selectors (Amazon updates these often)
    const apexPrice = $(".priceToPay .a-offscreen, .apexPriceToPay .a-offscreen").first().text().trim();
    const dealPrice = $("#priceblock_dealprice, #dealprice_feature .a-offscreen").first().text().trim();
    const ourPrice = $("#priceblock_ourprice, #corePrice_feature_div .a-offscreen").first().text().trim();
    const priceWhole = $(".a-price-whole").first().text().trim().replace(/[,.]/g, "");
    const priceFraction = $(".a-price-fraction").first().text().trim();

    if (apexPrice) result.price = apexPrice;
    else if (dealPrice) result.price = dealPrice;
    else if (ourPrice) result.price = ourPrice;
    else if (priceWhole) result.price = `₹${priceWhole}${priceFraction ? "." + priceFraction : ""}`;

    // Original price
    result.original_price = $(".basisPrice .a-offscreen").first().text().trim()
      || $(".a-price.a-text-price .a-offscreen").first().text().trim()
      || $(".priceBlockStrikePriceString").first().text().trim()
      || "";

    // Discount
    const savingsText = $(".savingsPercentage").first().text().trim();
    result.discount = savingsText.replace(/[^0-9]/g, "");

    // Rating
    const ratingText = $("span.a-icon-alt").first().text().trim() || $("#acrPopover").attr("title") || "";
    const ratingMatch = ratingText.match(/([\d.]+)/);
    if (ratingMatch) result.rating = ratingMatch[1];

    // Review count
    const reviewText = $("#acrCustomerReviewText").first().text().trim();
    const reviewMatch = reviewText.match(/([\d,]+)/);
    if (reviewMatch) result.review_count = reviewMatch[1].replace(/,/g, "");

    // Features (bullet points)
    const features: string[] = [];
    $("#feature-bullets li span.a-list-item").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 5 && text.length < 300) features.push(text);
    });
    if (features.length > 0) result.features = features.slice(0, 6);

    // Description
    result.description = $("#productDescription p").first().text().trim()
      || $('meta[name="description"]').attr("content")
      || "";

    return result;
  }

  private extractFlipkart($: cheerio.CheerioAPI): Partial<ProductScrapeResult> & { features?: string[] } {
    const result: Partial<ProductScrapeResult> & { features?: string[] } = {};

    // Title — Flipkart uses many different class patterns; use robust selectors
    result.product_title = $("h1 span.VU-ZEz").first().text().trim()
      || $("h1.yhB1nd span").first().text().trim()
      || $("h1._35KyD6").first().text().trim()
      || $("h1").first().text().trim()
      || "";

    // Brand
    result.brand = $("span.mEh187").first().text().trim()
      || $("span._2J4LW2").first().text().trim()
      || "";

    // Image — multiple class patterns
    result.image_url = $("img.DByuf4").first().attr("src")
      || $("img._396cs4").first().attr("src")
      || $("img.q6DClP").first().attr("src")
      || $("div._3kidJX img").first().attr("src")
      || $("div.CXW8mj img").first().attr("src")
      || "";

    // Price — Flipkart shuffles class names, use multiple patterns
    result.price = $("div.Nx9bqj.CxhGGd").first().text().trim()
      || $("div.Nx9bqj").first().text().trim()
      || $("div._30jeq3._16Jk6d").first().text().trim()
      || $("div._30jeq3").first().text().trim()
      || $("div.CEmiEU div").first().text().trim()
      || "";

    // Original price
    result.original_price = $("div.yRaY8j.A6\\+E6v").first().text().trim()
      || $("div.yRaY8j").first().text().trim()
      || $("div._3I9_wc._2p6lqe").first().text().trim()
      || "";

    // Discount
    const discountText = $("div.UkUFwK span").first().text().trim()
      || $("div._3Ay6Sb span").first().text().trim()
      || "";
    result.discount = discountText.replace(/[^0-9]/g, "");

    // Rating
    result.rating = $("div.XQDdHH").first().text().trim()
      || $("div._3LWZlK").first().text().trim()
      || "";

    // Review count
    const reviewText = $("span.Wphh3N span").first().text().trim()
      || $("span._2_R_DZ span").first().text().trim()
      || "";
    const reviewMatch = reviewText.match(/([\d,]+)\s*(?:Ratings|Reviews)/i);
    if (reviewMatch) result.review_count = reviewMatch[1].replace(/,/g, "");

    // Features
    const features: string[] = [];
    $("li._21Ahn- div").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 5 && text.length < 300) features.push(text);
    });
    if (features.length > 0) result.features = features.slice(0, 6);

    // Description
    result.description = $("div._1mXcCf.RmoJUa p").first().text().trim()
      || $('meta[property="og:description"]').attr("content")
      || "";

    return result;
  }

  private extractMeesho($: cheerio.CheerioAPI): Partial<ProductScrapeResult> & { features?: string[] } {
    const result: Partial<ProductScrapeResult> & { features?: string[] } = {};

    result.product_title = $("h1").first().text().trim() || $('meta[property="og:title"]').attr("content") || "";

    // Price — find elements containing ₹
    $("h4, h3, h2, span").each((_, el) => {
      const text = $(el).text().trim();
      if (text.includes("₹") && !result.price) {
        result.price = text;
      }
    });

    result.image_url = $('meta[property="og:image"]').attr("content") || "";
    result.description = $('meta[property="og:description"]').attr("content") || "";

    return result;
  }

  /** OG/meta fallback extraction */
  private extractMetaFallbacks($: cheerio.CheerioAPI): Partial<ProductScrapeResult> {
    const result: Partial<ProductScrapeResult> = {};

    result.product_title = $('meta[property="og:title"]').attr("content")
      || $("title").text().trim()
      || "";

    result.image_url = $('meta[property="og:image"]').attr("content")
      || $('meta[name="twitter:image"]').attr("content")
      || "";

    if (result.image_url?.includes("captcha")) result.image_url = "";

    result.description = $('meta[property="og:description"]').attr("content")
      || $('meta[name="description"]').attr("content")
      || "";

    // Generic product price meta tags
    const genericPrice = $('meta[property="product:price:amount"]').attr("content");
    const currency = $('meta[property="product:price:currency"]').attr("content") || "";
    if (genericPrice) {
      const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;
      result.price = `${symbol}${genericPrice}`;
    }

    return result;
  }

  /** Find the largest non-review image as a last resort */
  private extractLargestImage($: cheerio.CheerioAPI): string | null {
    let largestImg: string | null = null;
    let maxArea = 0;
    const skipPatterns = /review|captcha|spinner|loading|avatar|icon|logo|badge|button|ad-|banner/i;

    $("img").each((_, el) => {
      // Skip images inside review sections
      if ($(el).closest('#customerReviews, .review, .reviews, [data-hook="review"], .cr-widget').length > 0) return;

      const src = $(el).attr("src") || $(el).attr("data-src") || "";
      if (!src || src.startsWith("data:") || skipPatterns.test(src)) return;

      const parentClass = ($(el).parent().attr("class") || "") + ($(el).parent().attr("id") || "");
      if (skipPatterns.test(parentClass)) return;

      const width = parseInt($(el).attr("width") || "0");
      const height = parseInt($(el).attr("height") || "0");
      const area = width * height;
      if (area > maxArea && width > 100 && height > 100) {
        maxArea = area;
        largestImg = src;
      }
    });

    return largestImg;
  }

  private getPrimarySelectors(targetUrl: string): string[] {
    if (/amazon/i.test(targetUrl)) {
      return [
        "#productTitle",
        "#landingImage",
        "#corePrice_feature_div .a-offscreen",
        "#feature-bullets",
      ];
    }
    if (/flipkart/i.test(targetUrl)) {
      return [
        "h1",
        "img.DByuf4, img._396cs4, img.q6DClP",
        "div.Nx9bqj, div._30jeq3",
        "div._1AtVbE",
      ];
    }
    if (/meesho/i.test(targetUrl)) {
      return [
        "h1",
        "img",
        "[data-testid='price'], h4, h3, h2",
      ];
    }
    return [
      "h1",
      "[data-testid='product-title']",
      "[itemprop='name']",
      "[itemprop='price']",
      "img[fetchpriority='high']",
    ];
  }

  private async waitForProductSignals(page: Page, targetUrl: string): Promise<void> {
    const selectors = this.getPrimarySelectors(targetUrl);
    await Promise.any(
      selectors.map((selector) =>
        page.waitForSelector(selector, { state: "visible", timeout: 12000 }),
      ),
    ).catch(() => {});

    await page
      .waitForFunction(
        () => {
          const readyStateOk = document.readyState === "complete" || document.readyState === "interactive";
          const bodyTextLength = document.body?.innerText?.trim().length ?? 0;
          const hasJsonLd = document.querySelectorAll('script[type="application/ld+json"]').length > 0;
          return readyStateOk && (bodyTextLength > 200 || hasJsonLd);
        },
        { timeout: 10000 },
      )
      .catch(() => {});
  }

  private async autoScroll(page: Page): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        let idleTicks = 0;
        const maxIdleTicks = 4;
        const step = Math.max(window.innerHeight * 0.8, 500);
        let previousHeight = document.body.scrollHeight;

        const timer = setInterval(() => {
          window.scrollBy(0, step);
          totalHeight += step;

          const currentHeight = document.body.scrollHeight;
          if (currentHeight === previousHeight) {
            idleTicks += 1;
          } else {
            idleTicks = 0;
            previousHeight = currentHeight;
          }

          const reachedBottom = window.innerHeight + window.scrollY >= currentHeight - 4;
          const guardReached = totalHeight > 20000;

          if ((reachedBottom && idleTicks >= maxIdleTicks) || guardReached) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 350);
      });
    });
  }

  private shouldCaptureApiResponse(response: Response): boolean {
    const url = response.url();
    const resourceType = response.request().resourceType();
    const contentType = response.headers()["content-type"] || "";
    const isJson = /application\/json|application\/graphql-response\+json|text\/json/i.test(contentType);
    const looksRelevant = /product|products|pdp|item|sku|details|graphql|api/i.test(url);
    return response.ok() && ["xhr", "fetch"].includes(resourceType) && isJson && looksRelevant;
  }

  private async captureApiPayload(response: Response): Promise<CapturedApiPayload | null> {
    if (!this.shouldCaptureApiResponse(response)) return null;

    try {
      const text = await response.text();
      if (!text || text.length > 1_000_000) return null;
      const body = JSON.parse(text);
      return {
        url: response.url(),
        status: response.status(),
        body,
      };
    } catch {
      return null;
    }
  }

  private findCandidateProductNode(input: unknown, depth: number = 0): JsonObject | null {
    if (!input || typeof input !== "object" || depth > 6) return null;

    if (Array.isArray(input)) {
      for (const item of input) {
        const found = this.findCandidateProductNode(item, depth + 1);
        if (found) return found;
      }
      return null;
    }

    const obj = input as JsonObject;
    const directType = typeof obj["__typename"] === "string" ? obj["__typename"].toLowerCase() : "";
    const schemaType = typeof obj["@type"] === "string" ? obj["@type"].toLowerCase() : "";
    const looksProductLike =
      directType.includes("product")
      || schemaType.includes("product")
      || (("title" in obj || "name" in obj) && ("price" in obj || "offers" in obj || "images" in obj || "image" in obj));

    if (looksProductLike) {
      return obj;
    }

    for (const value of Object.values(obj)) {
      const found = this.findCandidateProductNode(value, depth + 1);
      if (found) return found;
    }

    return null;
  }

  private extractFromApiPayloads(payloads: CapturedApiPayload[]): Partial<ProductScrapeResult> {
    const result: Partial<ProductScrapeResult> = {};

    for (const payload of payloads) {
      const product = this.findCandidateProductNode(payload.body);
      if (!product) continue;

      if (!result.product_title) {
        result.product_title = String(product.title || product.name || product.productTitle || "").trim();
      }

      if (!result.description) {
        result.description = String(
          product.description || product.shortDescription || product.summary || "",
        ).trim();
      }

      const brandObject = this.isRecord(product.brand) ? product.brand : null;
      if (!result.brand) {
        result.brand = String(
          (brandObject?.name as string | undefined) || product.brand || product.manufacturer || "",
        ).trim();
      }

      const categoryObject = this.isRecord(product.category) ? product.category : null;
      if (!result.category) {
        result.category = String(
          (categoryObject?.name as string | undefined) || product.category || product.department || "",
        ).trim();
      }

      const priceObject = this.isRecord(product.price) ? product.price : null;
      const priceValue =
        priceObject?.formattedValue
        || priceObject?.displayValue
        || priceObject?.value
        || product.offerPrice
        || product.sellingPrice
        || product.salePrice
        || product.currentPrice;
      if (!result.price && priceValue) {
        result.price = String(priceValue).trim();
      }

      const listPriceObject = this.isRecord(product.listPrice) ? product.listPrice : null;
      const originalPriceValue =
        product.mrp
        || listPriceObject?.formattedValue
        || listPriceObject?.value
        || product.originalPrice
        || product.strikePrice;
      if (!result.original_price && originalPriceValue) {
        result.original_price = String(originalPriceValue).trim();
      }

      const ratingObject = this.isRecord(product.rating) ? product.rating : null;
      const ratingValue =
        ratingObject?.average
        || ratingObject?.value
        || product.averageRating
        || product.rating;
      if (!result.rating && ratingValue) {
        result.rating = String(ratingValue).trim();
      }

      const reviewCountValue =
        ratingObject?.count
        || product.reviewCount
        || product.ratingsCount
        || product.totalReviews;
      if (!result.review_count && reviewCountValue) {
        result.review_count = String(reviewCountValue).replace(/[^\d]/g, "");
      }

      const imageCandidates = [
        product.image,
        product.primaryImage,
        Array.isArray(product.images) ? product.images[0] : undefined,
        Array.isArray(product.media) ? product.media[0] : undefined,
        Array.isArray(product.gallery) ? product.gallery[0] : undefined,
      ];
      if (!result.image_url) {
        for (const candidate of imageCandidates) {
          const url = typeof candidate === "string" ? candidate : candidate?.url || candidate?.src;
          if (url && !String(url).startsWith("data:")) {
            result.image_url = String(url);
            break;
          }
        }
      }

      if ((!result.features || result.features.length === 0) && Array.isArray(product.features)) {
        result.features = product.features
          .map((feature) => String(feature?.text || feature?.value || feature || "").trim())
          .filter((feature) => feature.length > 4)
          .slice(0, 8);
      }
    }

    return result;
  }

  private async extractDataFromDom(page: Page, targetUrl: string): Promise<Partial<ProductScrapeResult>> {
    const domSnapshot = await page.evaluate((url) => {
      const cleanText = (value?: string | null) => value?.replace(/\s+/g, " ").trim() || "";
      const firstText = (selectors: string[]) => {
        for (const selector of selectors) {
          const text = cleanText(document.querySelector(selector)?.textContent);
          if (text) return text;
        }
        return "";
      };
      const firstAttr = (selectors: string[], attr: string) => {
        for (const selector of selectors) {
          const value = cleanText(document.querySelector(selector)?.getAttribute(attr));
          if (value && !value.startsWith("data:")) return value;
        }
        return "";
      };
      const firstMeta = (selectors: string[]) => {
        for (const selector of selectors) {
          const value = cleanText(document.querySelector(selector)?.getAttribute("content"));
          if (value) return value;
        }
        return "";
      };
      const collectFeatures = (selectors: string[]) => {
        const items = new Set<string>();
        for (const selector of selectors) {
          for (const el of Array.from(document.querySelectorAll(selector))) {
            const text = cleanText(el.textContent);
            if (text.length > 4 && text.length < 300) items.add(text);
          }
        }
        return Array.from(items).slice(0, 8);
      };

      const titleSelectors = /amazon/i.test(url)
        ? ["#productTitle", "h1#title span", "h1 span"]
        : /flipkart/i.test(url)
          ? ["h1 span.VU-ZEz", "h1.yhB1nd span", "h1._35KyD6", "h1"]
          : ["[data-testid='product-title']", "[itemprop='name']", "h1"];
      const priceSelectors = /amazon/i.test(url)
        ? [".priceToPay .a-offscreen", ".apexPriceToPay .a-offscreen", "#corePrice_feature_div .a-offscreen", ".a-price .a-offscreen"]
        : /flipkart/i.test(url)
          ? ["div.Nx9bqj.CxhGGd", "div.Nx9bqj", "div._30jeq3._16Jk6d", "div._30jeq3"]
          : ["[data-testid='price']", "[itemprop='price']", ".price", ".sale-price"];
      const originalPriceSelectors = /amazon/i.test(url)
        ? [".basisPrice .a-offscreen", ".a-price.a-text-price .a-offscreen", ".priceBlockStrikePriceString"]
        : /flipkart/i.test(url)
          ? ["div.yRaY8j.A6\\+E6v", "div.yRaY8j", "div._3I9_wc._2p6lqe"]
          : [".original-price", ".compare-at-price", ".strike-price"];
      const imageSelectors = /amazon/i.test(url)
        ? ["#landingImage", "#imgTagWrapperId img", "#main-image-container img"]
        : /flipkart/i.test(url)
          ? ["img.DByuf4", "img._396cs4", "img.q6DClP", "div.CXW8mj img"]
          : ["img[fetchpriority='high']", "main img", "[data-testid='product-image'] img", "img"];

      return {
        product_title: firstText(titleSelectors),
        price: firstText(priceSelectors),
        original_price: firstText(originalPriceSelectors),
        description: firstText(["#productDescription p", "[data-testid='product-description']", "[itemprop='description']"])
          || firstMeta(["meta[property='og:description']", "meta[name='description']"]),
        image_url: firstAttr(imageSelectors, "src")
          || firstAttr(imageSelectors, "data-src")
          || firstMeta(["meta[property='og:image']", "meta[name='twitter:image']"]),
        brand: firstText(["#bylineInfo", "[data-testid='brand']", "[itemprop='brand']", ".brand"]),
        rating: firstText(["#acrPopover", "span.a-icon-alt", "div.XQDdHH", "div._3LWZlK", "[data-testid='rating']"]),
        review_count: firstText(["#acrCustomerReviewText", "span.Wphh3N span", "span._2_R_DZ span", "[data-testid='review-count']"]),
        features: collectFeatures([
          "#feature-bullets li span.a-list-item",
          "li._21Ahn- div",
          "[data-testid='feature-bullet']",
          "[itemprop='description'] li",
        ]),
      };
    }, targetUrl);

    if (domSnapshot.rating) {
      const ratingMatch = domSnapshot.rating.match(/([\d.]+)/);
      domSnapshot.rating = ratingMatch?.[1] || domSnapshot.rating;
    }

    if (domSnapshot.review_count) {
      const reviewMatch = domSnapshot.review_count.match(/([\d,]+)/);
      domSnapshot.review_count = reviewMatch?.[1]?.replace(/,/g, "") || domSnapshot.review_count;
    }

    return domSnapshot;
  }

  private async scrapeWithPlaywright(targetUrl: string): Promise<{ data: Partial<ProductScrapeResult>; html: string }> {
    const browser = await this.initBrowser();
    const context = await browser.newContext({
      userAgent: this.getRandomUA(),
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();
    const capturedApiPayloads: CapturedApiPayload[] = [];
    const captureTasks: Promise<void>[] = [];

    try {
      if (!targetUrl) throw new Error("Scrape Target URL is undefined");

      // Block heavy resources for speed
      await page.route(/\.(woff2?|ttf|eot|mp4|mp3|avi|mov)$/i, (route) => route.abort());
      page.on("response", (response) => {
        const task = this.captureApiPayload(response)
          .then((payload) => {
            if (payload) capturedApiPayloads.push(payload);
          })
          .catch(() => {});
        captureTasks.push(task);
      });

      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {});
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
      await this.waitForProductSignals(page, targetUrl);
      await this.autoScroll(page);
      await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => {});
      await Promise.allSettled(captureTasks);

      const apiExtracted = this.extractFromApiPayloads(capturedApiPayloads);
      const domExtracted = await this.extractDataFromDom(page, targetUrl);
      const content = await page.content();
      const $ = cheerio.load(content);
      const htmlExtracted = this.extractDataFromCheerio($, targetUrl);
      const extracted = this.mergeProductData(
        this.mergeProductData(apiExtracted, domExtracted),
        htmlExtracted,
      );

      await context.close();
      return { data: extracted, html: content };
    } catch (e: unknown) {
      await context.close();
      const msg = e instanceof Error ? e.message : String(e);
      return { data: { error_reason: `Playwright error: ${msg}` }, html: "" };
    }
  }
}
