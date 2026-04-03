import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { productId, userId, redirectUrl } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Fire-and-forget: log the click without blocking the response
    // The client already has the redirectUrl, so we don't need to fetch it here
    const supabase = await createClient();

    // Non-blocking DB insert — we respond immediately
    supabase
      .from("clicks")
      .insert({
        product_id: productId,
        user_id: userId || null,
        ip_address:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
        referrer: req.headers.get("referer") || "",
      })
      .then(({ error }) => {
        if (error) console.error("Click tracking error:", error);
      });

    // Respond instantly — the client already has the redirect URL
    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          // No caching for tracking endpoint
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Click tracking failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
