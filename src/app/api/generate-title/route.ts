import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";



export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI configuration error: API key missing" },
        { status: 500 }
      );
    }

    const { title, description, tone } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const toneInstructions: Record<string, string> = {
      professional: "Use a professional, trust-building tone.",
      casual: "Use a casual, friendly, conversational tone.",
      urgency: "Create a sense of urgency and FOMO.",
      luxury: "Use premium, aspirational, luxury-focused language.",
    };

    const tonePrompt = toneInstructions[tone] || toneInstructions.professional;

    const prompt = `You are a world-class affiliate marketing copywriter. Generate 3 compelling alternative titles and a short description for the following product.

Product Title: ${title}
${description ? `Product Description: ${description}` : ""}

Tone: ${tonePrompt}

Return your response as valid JSON in this exact format:
{
  "titles": ["title1", "title2", "title3"],
  "description": "A compelling 1-2 sentence product description"
}

Rules:
- Titles should be concise (under 80 characters)
- Description should be 1-2 sentences max
- Focus on benefits, not features
- Make it click-worthy without being clickbait
- Return ONLY valid JSON, no markdown`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      titles: parsed.titles || [],
      description: parsed.description || "",
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "AI generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
