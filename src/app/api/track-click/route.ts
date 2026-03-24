import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { productId, userId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get the product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("original_url")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Log the click
    const { error: clickError } = await supabase.from("clicks").insert({
      product_id: productId,
      user_id: userId || null,
      ip_address:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
      referrer: req.headers.get("referer") || "",
    });

    if (clickError) {
      console.error("Click tracking error:", clickError);
    }

    return NextResponse.json({
      redirectUrl: product.original_url,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Click tracking failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
