import { ProductScraper } from "./src/lib/agents/product-scraper";
import { ContentAgent } from "./src/lib/agents/content-agent";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verify() {
  const url = "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm227447d95392e";
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ skipping AI generation test because GOOGLE_GENERATIVE_AI_API_KEY is missing in .env.local");
  }

  console.log("1. Starting Scrape for:", url);
  const scraper = new ProductScraper("storix-21");
  const result = await scraper.scrape(url);
  await scraper.close();

  if (result.image_status === "ok") {
    console.log("✅ Scrape Successful:", result.product_title);
  } else {
    console.warn("⚠️ Scrape partially successful (image not found or other issues):", result.error_reason);
  }

  if (apiKey && result.http_code === 200) {
    console.log("2. Starting Content Generation...");
    const agent = new ContentAgent(apiKey);
    const content = await agent.generateReview(result);
    const title = await agent.generateSEOTitle(result.product_title);

    console.log("\n🚀 Generated SEO Title:", title);
    console.log("\n📄 Generated Content (First 200 chars):", content.substring(0, 200) + "...");
    console.log("\n✅ Full Flow Verification Complete.");
  } else if (!apiKey) {
    console.log("\n💡 Scraper is verified. To verify AI content, add your Gemini API Key to .env.local");
  } else {
    console.log("\n❌ Cannot verify AI content because scrape failed.");
  }
}

verify().catch(console.error);
