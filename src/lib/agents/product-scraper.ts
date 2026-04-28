import axios, { type AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { chromium, Browser } from "playwright";

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
  image_status: "ok" | "not_found" | "error";
  http_code: number;
  error_reason?: string;
  scraped_at: string;
}

const UA_POOL = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
];

export class ProductScraper {
  private browser: Browser | null = null;
  private affiliateTag: string;

  constructor(affiliateTag: string = "YOUR_TAG") {
    this.affiliateTag = affiliateTag;
  }

  private getRandomUA() {
    return UA_POOL[Math.floor(Math.random() * UA_POOL.length)];
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
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

    // Append affiliate tag if needed
    const finalUrl = this.appendAffiliateTag(url);

    while (attempt <= retryCount) {
      try {
        await this.sleep(delay);

        // Try standard fetch first (fast)
        let response: AxiosResponse<string> | null = null;
        let fetchErrorReason: string | undefined;

        try {
          response = await axios.get<string>(url, {
            headers: { "User-Agent": this.getRandomUA() },
            timeout: 15000,
            validateStatus: () => true,
          });
          lastHttpCode = response.status;
        } catch (error: unknown) {
          fetchErrorReason = error instanceof Error ? error.message : String(error);
          lastErrorMessage = fetchErrorReason;
          lastHttpCode = axios.isAxiosError(error) ? error.response?.status || 0 : 0;
        }

        if (response?.status === 429) {
          console.warn(`429 Too Many Requests for ${url}. Pausing 30s...`);
          await this.sleep(30000);
          attempt++;
          delay *= 2; // Exponential backoff
          continue;
        }

        let result: Partial<ProductScrapeResult> = {
          product_url: finalUrl,
          http_code: lastHttpCode,
          scraped_at: scrapedAt,
        };

        // For JS-heavy or protected sites, or if standard fetch yields low quality
        // we use Playwright as a fallback or primary for certain domains
        if (!response || this.isJsHeavy(url) || response.status !== 200) {
          const pwResult = await this.scrapeWithPlaywright(url);
          result = { ...result, ...pwResult };

          if (!result.product_title && !result.image_url && result.error_reason) {
            const combinedReason = [fetchErrorReason, result.error_reason].filter(Boolean).join("; ");
            throw new Error(combinedReason || result.error_reason);
          }
        } else {
          const $ = cheerio.load(response.data);
          const extracted = this.extractDataFromCheerio($, url);
          result = { ...result, ...extracted };
        }

        // Validate image URL
        if (result.image_url) {
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
           result.error_reason = result.error_reason || fetchErrorReason || "No image found in content";
        }

        return result as ProductScrapeResult;

      } catch (error: unknown) {
        attempt++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        lastErrorMessage = errorMessage;
        if (attempt > retryCount) {
          return {
            product_title: "Error",
            product_url: finalUrl,
            image_url: null,
            image_status: "error",
            http_code: lastHttpCode,
            error_reason: lastErrorMessage,
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
      scraped_at: scrapedAt,
    };
  }

  private isJsHeavy(url: string): boolean {
    const jsHeavyDomains = [/amazon/i, /flipkart/i, /ebay/i, /meesho/i];
    return jsHeavyDomains.some((d) => d.test(url));
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

  private async validateImage(url: string): Promise<boolean> {
    if (!url || url.startsWith("data:")) return false;
    try {
      const res = await axios.head(url, { 
        headers: { "User-Agent": this.getRandomUA() },
        timeout: 5000 
      });
      return res.status === 200;
    } catch {
      // Some servers block HEAD, try small GET
      try {
        const res = await axios.get(url, { 
          headers: { "User-Agent": this.getRandomUA() }, 
          timeout: 5000,
          responseType: 'stream'
        });
        return res.status === 200;
      } catch {
        return false;
      }
    }
  }

  private extractDataFromCheerio($: cheerio.CheerioAPI, url: string): Partial<ProductScrapeResult> {
    const title = this.extractTitle($);
    const image_url = this.extractImage($, url);
    const description = this.extractDescription($);
    const priceData = this.extractPrice($, url);
    
    return { 
      product_title: title, 
      image_url,
      description,
      ...priceData
    };
  }

  private extractDescription($: cheerio.CheerioAPI): string {
    return (
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      ""
    );
  }

  private extractPrice($: cheerio.CheerioAPI, url: string): Partial<ProductScrapeResult> {
    let price = "";
    let original_price = "";
    let discount = "";
    let rating = "";

    if (/amazon/i.test(url)) {
      const priceWhole = $(".a-price-whole").first().text().trim();
      const priceFraction = $(".a-price-fraction").first().text().trim();
      if (priceWhole) price = `${priceWhole}${priceFraction ? "." + priceFraction : ""}`;
      original_price = $(".a-price.a-text-price span.a-offscreen").first().text().trim();
      discount = $(".savingsPercentage").first().text().trim().replace(/[^0-9]/g, "");
      const ratingText = $("span.a-icon-alt").first().text().trim();
      if (ratingText) {
        const match = ratingText.match(/([\d.]+)/);
        if (match) rating = match[1];
      }
    }
    
    return { price, original_price, discount, rating };
  }

  private extractTitle($: cheerio.CheerioAPI): string {
    return (
      $("#productTitle").text().trim() ||
      $("h1").first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      $("title").text().trim() ||
      "Unknown Product"
    );
  }

  private extractImage($: cheerio.CheerioAPI, url: string): string | null {
    // 1. JSON-LD
    const jsonLd = $('script[type="application/ld+json"]');
    if (jsonLd.length) {
      for (const el of jsonLd.toArray()) {
        try {
          const data = JSON.parse($(el).html() || "{}");
          const image = this.findImageInJson(data);
          if (image) return image;
        } catch {}
      }
    }

    // 2. Open Graph
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) return ogImage;

    // 3. Twitter
    const twitterImage = $('meta[name="twitter:image"]').attr("content");
    if (twitterImage) return twitterImage;

    // 4. Platform Specific
    if (/amazon/i.test(url)) {
      const dynamicImage = $("#landingImage").attr("data-a-dynamic-image");
      if (dynamicImage) {
        try {
          const parsed = JSON.parse(dynamicImage);
          const keys = Object.keys(parsed);
          // Pick the one with the highest resolution (usually the key is the URL and value is dimensions)
          // Actually, in Amazon JSON, keys are URLs, values are [w,h]
          return keys.sort((a,b) => (parsed[b][0] * parsed[b][1]) - (parsed[a][0] * parsed[a][1]))[0];
        } catch {}
      }
    }
    
    if (/flipkart/i.test(url)) {
      const fkImg = $("._396cs4 img").attr("src") || $("._2r_T1I img").attr("src");
      if (fkImg) return fkImg;
    }

    if (/ebay/i.test(url)) {
      const ebayImg = $("#icImg").attr("src") || $(".ux-image-magnify__image").attr("src");
      if (ebayImg) return ebayImg;
    }

    // 5. Generic Fallback
    let largestImg: string | null = null;
    let maxArea = 0;
    $("img").each((_, el) => {
      const src = $(el).attr("src");
      if (!src || src.startsWith("data:") || src.includes("spinner") || src.includes("loading")) return;
      
      const width = parseInt($(el).attr("width") || "0");
      const height = parseInt($(el).attr("height") || "0");
      const area = width * height;
      if (area > maxArea && width > 50 && height > 50) {
        maxArea = area;
        largestImg = src;
      }
    });

    return largestImg;
  }

  private findImageInJson(data: any): string | null {
    if (!data) return null;
    if (data["@type"] === "Product" && data.image) {
      if (Array.isArray(data.image)) return data.image[0];
      if (typeof data.image === "string") return data.image;
      if (data.image.url) return data.image.url;
    }
    if (Array.isArray(data)) {
      for (const item of data) {
        const res = this.findImageInJson(item);
        if (res) return res;
      }
    }
    if (data["@graph"] && Array.isArray(data["@graph"])) {
      return this.findImageInJson(data["@graph"]);
    }
    return null;
  }

  private async scrapeWithPlaywright(targetUrl: string): Promise<Partial<ProductScrapeResult>> {
    const browser = await this.initBrowser();
    const context = await browser.newContext({ userAgent: this.getRandomUA() });
    const page = await context.newPage();
    
    try {
      if (!targetUrl) throw new Error("Scrape Target URL is undefined");
      
      await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
      
      // Wait for image selectors if specific platforms
      if (/amazon/i.test(targetUrl)) await page.waitForSelector("#landingImage", { timeout: 5000 }).catch(() => {});

      const content = await page.content();
      const $ = cheerio.load(content);
      const extracted = this.extractDataFromCheerio($, targetUrl);
      
      await context.close();
      return extracted;
    } catch (e: any) {
      await context.close();
      const msg = e instanceof Error ? e.message : String(e);
      return { error_reason: `Playwright error: ${msg}` };
    }
  }
}
