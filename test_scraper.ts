import { ProductScraper } from "./src/lib/agents/product-scraper";

async function test() {
  const scraper = new ProductScraper("test-tag");
  try {
    const result = await scraper.scrape("https://example.com");
    console.log("Result:", result);
  } catch (e) {
    console.error("Test Failed:", e);
  } finally {
    await scraper.close();
  }
}

test();
