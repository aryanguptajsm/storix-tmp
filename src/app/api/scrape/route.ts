import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Try OGS first
    let title = "";
    let description = "";
    let image = "";
    let price = "";
    let rating = "";
    let platform = "other";

    try {
      const ogs = (await import("open-graph-scraper")).default;
      const { result } = await ogs({ url });
      title = result.ogTitle || "";
      description = result.ogDescription || "";
      image =
        result.ogImage?.[0]?.url ||
        result.ogImage?.[0]?.url ||
        "";
    } catch {
      // OGS failed, try basic fetch
    }

    // Deep scrape for Amazon
    const parsedUrl = new URL(url);
    if (/amazon\.(com|in|co\.uk|de|fr)/i.test(parsedUrl.hostname)) {
      platform = "amazon";
      try {
        const { data: html } = await axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          timeout: 10000,
        });
        const cheerio = await import("cheerio");
        const $ = cheerio.load(html);

        if (!title) title = $("#productTitle").text().trim();
        if (!image) image = $("#landingImage").attr("src") || "";

        // Price
        const priceWhole = $(".a-price-whole").first().text().trim();
        const priceFraction = $(".a-price-fraction").first().text().trim();
        if (priceWhole) {
          price = `${priceWhole}${priceFraction ? "." + priceFraction : ""}`;
        }

        // Rating
        const ratingText = $("span.a-icon-alt").first().text().trim();
        if (ratingText) {
          const match = ratingText.match(/([\d.]+)/);
          if (match) rating = match[1];
        }
      } catch {
        // Amazon deep scrape failed
      }
    } else if (/flipkart\.com/i.test(parsedUrl.hostname)) {
      platform = "flipkart";
    } else if (/meesho\.com/i.test(parsedUrl.hostname)) {
      platform = "meesho";
    }

    // Fallback: basic meta extraction
    if (!title) {
      try {
        const { data: html } = await axios.get(url, {
          timeout: 10000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        const cheerio = await import("cheerio");
        const $ = cheerio.load(html);
        title = $("title").text().trim() || $('meta[property="og:title"]').attr("content") || "";
        description =
          $('meta[name="description"]').attr("content") ||
          $('meta[property="og:description"]').attr("content") ||
          "";
        image =
          $('meta[property="og:image"]').attr("content") || "";
      } catch {
        // Fallback also failed
      }
    }

    return NextResponse.json({
      title: title || "Untitled Product",
      description: description || "",
      image: image || "",
      price,
      rating,
      platform,
      originalUrl: url,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Scraping failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
