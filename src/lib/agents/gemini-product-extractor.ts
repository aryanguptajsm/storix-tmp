import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScrapePlatform } from "@/lib/scraper/contracts";

export interface AiProductExtractionResult {
  title: string | null;
  price: string | null;
  image: string | null;
  rating: string | null;
  review_count: string | null;
  brand: string | null;
}

interface ExtractParams {
  url: string;
  platform: ScrapePlatform;
  html: string;
  existing: AiProductExtractionResult;
}

export class GeminiProductExtractor {
  private readonly model;

  constructor(
    apiKey: string | undefined,
    modelName: string = process.env.GEMINI_SCRAPER_MODEL || "gemini-1.5-flash",
  ) {
    if (!apiKey) {
      this.model = null;
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });
  }

  public isConfigured(): boolean {
    return Boolean(this.model);
  }

  public async extractFromHtml(params: ExtractParams): Promise<AiProductExtractionResult | null> {
    if (!this.model) return null;

    const html = this.prepareHtml(params.html);
    if (!html) return null;

    const prompt = `
Extract product fields from this retail product HTML and return only valid JSON.

Rules:
- Use null when a field is missing or not reliable.
- Do not invent values.
- Prefer the product hero image over thumbnails.
- Keep the exact visible price format when possible.

Return this exact JSON shape:
{
  "title": string | null,
  "price": string | null,
  "image": string | null,
  "rating": string | null,
  "review_count": string | null,
  "brand": string | null
}

URL: ${params.url}
Platform: ${params.platform}
Existing extraction: ${JSON.stringify(params.existing)}

HTML:
${html}
`.trim();

    const result = await this.model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Gemini scraper fallback returned non-JSON output");
    }

    return JSON.parse(jsonMatch[0]) as AiProductExtractionResult;
  }

  private prepareHtml(html: string): string {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 15_000);
  }
}
