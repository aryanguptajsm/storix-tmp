import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ContentAgent } from "@/lib/agents/content-agent";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { productId, articleType = "review" } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // 1. Fetch the product data
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found or access denied." }, { status: 404 });
    }

    // 2. Initialize the Content Agent
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "System configuration error: AI Service unavailable." }, { status: 500 });
    }

    const agent = new ContentAgent(apiKey);

    // 3. Mark as pending
    await supabase
      .from("products")
      .update({ content_status: "pending" })
      .eq("id", productId);

    // 4. Generate content
    try {
      const generatedContent = await agent.generateReview(product);
      const seoTitle = await agent.generateSEOTitle(product.title);

      // 5. Update Supabase with generated content
      const { error: updateError } = await supabase
        .from("products")
        .update({
          ai_content: generatedContent,
          title: seoTitle || product.title, // Optionally update to SEO title
          content_status: "generated",
          article_type: articleType
        })
        .eq("id", productId);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        content: generatedContent,
        title: seoTitle
      });

    } catch (genError: any) {
      await supabase
        .from("products")
        .update({ content_status: "failed" })
        .eq("id", productId);
        
      throw genError;
    }

  } catch (error: any) {
    console.error("Content Generation API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to generate content",
      details: error
    }, { status: 500 });
  }
}
