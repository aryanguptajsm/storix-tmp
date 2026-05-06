import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ProductScraper } from "@/lib/agents/product-scraper";
import { getProductLimit, normalizePlanId } from "@/lib/plans";
import { detectPlatformFromUrl } from "@/lib/scraper/contracts";


export async function POST(req: NextRequest) {
  try {
    // SECURITY: Authenticate the scraping request
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access. Command sequence denied." }, { status: 401 });
    }

    console.log("SCRAPING REQUEST RECEIVED");

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let normalizedUrl: string;
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: "Only HTTP and HTTPS URLs are supported" }, { status: 400 });
      }
      normalizedUrl = parsedUrl.toString();
    } catch {
      return NextResponse.json({ error: "Invalid product URL" }, { status: 400 });
    }

    console.log("URL:", normalizedUrl);

    // ─── Plan Limit Enforcement ───
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    
    const plan = normalizePlanId(profile?.plan);
    const limit = getProductLimit(plan);
    
    if ((count || 0) >= limit) {
      return NextResponse.json({ 
        error: `Deployment quota reached (${count}/${limit}). Please upgrade your signature to expand your fleet.` 
      }, { status: 403 });
    }

    console.log("Plan:", plan);
    console.log("Limit:", limit);
    console.log("Count:", count);

    // Use the robust ProductScraper Agent
    const scraper = new ProductScraper();
    const result = await scraper.scrape(normalizedUrl).finally(() => scraper.close());

    console.log("Result:", result);

    if (result.status === "failed") {
       return NextResponse.json({ 
         error: result.error_reason || "Scraping failed",
         status: result.status,
         error_type: result.error_type,
         details: result
       }, { status: 500 });
    }

    console.log("Image Status:", result.image_status);

    const platform = detectPlatformFromUrl(normalizedUrl);

    console.log("Platform:", platform);

    console.log("Returning Response...");

    return NextResponse.json({
      title: result.product_title || "Untitled Product",
      description: result.description || "",
      image: result.image_url || "",
      price: result.price || "",
      originalPrice: result.original_price || "",
      discountPercentage: result.discount || "",
      rating: result.rating || "",
      reviewCount: result.review_count || "",
      review_count: result.review_count || "",
      brand: result.brand || "",
      category: result.category || "",
      features: result.features || [],
      platform,
      originalUrl: normalizedUrl,
      status: result.status,
      error_type: result.error_type || null,
      attempts: result.attempts,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Scraping failed";
    console.log(msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
