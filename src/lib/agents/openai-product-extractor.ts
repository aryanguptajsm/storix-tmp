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

export class OpenAIProductExtractor {
  constructor(
    private readonly apiKey: string | undefined,
    private readonly model: string = process.env.OPENAI_SCRAPER_MODEL || "gpt-4o-mini",
  ) {}

  public isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  public async extractFromHtml(params: ExtractParams): Promise<AiProductExtractionResult | null> {
    if (!this.apiKey) return null;

    const html = this.prepareHtml(params.html);
    if (!html) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: [
            {
              role: "system",
              content: [
                {
                  type: "input_text",
                  text:
                    "Extract product data from retail product page HTML. Return only fields supported by the schema. Use null when a value cannot be determined reliably.",
                },
              ],
            },
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: [
                    `URL: ${params.url}`,
                    `Platform: ${params.platform}`,
                    `Existing extraction: ${JSON.stringify(params.existing)}`,
                    "HTML:",
                    html,
                  ].join("\n\n"),
                },
              ],
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "product_extraction",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["title", "price", "image", "rating", "review_count", "brand"],
                properties: {
                  title: {
                    anyOf: [{ type: "string" }, { type: "null" }],
                  },
                  price: {
                    anyOf: [{ type: "string" }, { type: "null" }],
                  },
                  image: {
                    anyOf: [{ type: "string" }, { type: "null" }],
                  },
                  rating: {
                    anyOf: [{ type: "string" }, { type: "null" }],
                  },
                  review_count: {
                    anyOf: [{ type: "string" }, { type: "null" }],
                  },
                  brand: {
                    anyOf: [{ type: "string" }, { type: "null" }],
                  },
                },
              },
            },
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenAI request failed (${response.status}): ${body}`);
      }

      const payload = (await response.json()) as {
        output_text?: string;
        output?: Array<{
          content?: Array<{
            type?: string;
            text?: string;
          }>;
        }>;
      };

      const rawText =
        payload.output_text
        || payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;

      if (!rawText) return null;

      return JSON.parse(rawText) as AiProductExtractionResult;
    } finally {
      clearTimeout(timeout);
    }
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
