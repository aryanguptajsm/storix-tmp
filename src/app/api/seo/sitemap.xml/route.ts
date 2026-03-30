import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Fetch all active stores with products
    const { data: profiles } = await supabase
      .from("profiles")
      .select("username, store_name, created_at")
      .not("username", "is", null);

    const { data: products } = await supabase
      .from("products")
      .select("id, user_id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://storix.in";
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Add store pages
    if (profiles) {
      for (const profile of profiles) {
        xml += `
  <url>
    <loc>${baseUrl}/store/${profile.username}</loc>
    <lastmod>${profile.created_at || now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    xml += `
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
