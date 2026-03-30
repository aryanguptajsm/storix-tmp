import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { email, storeOwnerId, source } = await req.json();

    if (!email || !storeOwnerId) {
      return NextResponse.json(
        { error: "Email and store owner ID are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if email already captured for this store
    const { data: existing } = await supabase
      .from("email_captures")
      .select("id")
      .eq("store_owner_id", storeOwnerId)
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed" });
    }

    const { error } = await supabase
      .from("email_captures")
      .insert({
        store_owner_id: storeOwnerId,
        email: email.toLowerCase(),
        source: source || "inline",
      });

    if (error) {
      console.error("Email capture insert error:", error);
      // If table doesn't exist yet, return graceful response
      if (error.code === "42P01") {
        return NextResponse.json({ success: true, message: "Feature coming soon" });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email capture error:", error);
    return NextResponse.json(
      { error: "Failed to capture email" },
      { status: 500 }
    );
  }
}
