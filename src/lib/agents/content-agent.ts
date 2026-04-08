import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product } from "../types";

/**
 * ContentAgent: Expert Affiliate Marketing Assistant
 * Custom-built to generate high-quality, SEO-optimized reviews and articles.
 */
export class ContentAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API Key is required for ContentAgent.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using Flash for speed/cost, Pro for depth
  }

  /**
   * Generates a long-form product review based on scraped data.
   */
  async generateReview(product: Partial<Product>): Promise<string> {
    const prompt = `
You are AI Agent, an expert affiliate marketing assistant specializing in online products.
Your primary purpose is to create high-quality content for blog posts and long-form web content. 
Your tone is clear, factual, and educational — prioritize accuracy and depth.

RULES:
1. Always disclose affiliate links at the bottom.
2. Never make false claims. Be honest about product limitations.
3. Use clean Markdown with proper headers (h1, h2, h3), bullet points, and bold text.
4. Scale: Long-form (500+ words).
5. Structure:
   - Compelling Headline
   - Introduction (The Hook)
   - Key Features Analysis
   - Real-world Performance (Based on specs)
   - Pros & Cons (Balanced)
   - Is it worth it? (Final Verdict)
   - Affiliate Disclosure Footer

PRODUCT DATA:
- Title: ${product.title}
- Original Description: ${product.description || "N/A"}
- Price: ${product.price || "N/A"}
- Platform: ${product.platform || "N/A"}
- Source URL: ${product.original_url}

Begin the high-quality review now:
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Ensure the disclosure is there if the AI forgot (Safety Fallback)
      const disclosure = "\n\n---\n**Affiliate Disclosure:** *This content may contain affiliate links. If you purchase through these links, we may earn a commission at no extra cost to you. We only recommend products we believe provide real value.*";
      
      if (!text.toLowerCase().includes("affiliate disclosure")) {
        text += disclosure;
      }

      return text;
    } catch (error: any) {
      console.error("ContentAgent Generation Error:", error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  /**
   * Generates a short, punchy SEO title.
   */
  async generateSEOTitle(productTitle: string): Promise<string> {
    const prompt = `Generate a high-converting, SEO-optimized title for an affiliate product review: "${productTitle}". 
    The title should be under 60 characters and include a benefit or unique angle. Return ONLY the title text.`;
    
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().replace(/"/g, '').trim();
    } catch {
      return productTitle;
    }
  }
}
