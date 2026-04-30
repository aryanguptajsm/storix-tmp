import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { key } = await req.json();
    if (!key) {
      return NextResponse.json({ error: "License key is required." }, { status: 400 });
    }

    const cleanKey = key.trim().toUpperCase();

    // MUST use server client to securely get the session from cookies
    const supabase = await createServerClient();
    
    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized. Access denied." }, { status: 401 });
    }

    let planToUpgrade = "free";
    
    // Create admin client for bypassing RLS if service role key is available
    const adminSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
      : supabase;

    // Secure Hardcoded Master Keys for immediate lifetime upgrades
    if (cleanKey === "STRX-PRO-2026" || cleanKey === "PRO-LIFETIME") {
      planToUpgrade = "pro";
    } else if (cleanKey === "STRX-BIZ-2026" || cleanKey === "BIZ-LIFETIME") {
      planToUpgrade = "business";
    } else {
      // 2. Find the key in the database
      const { data: license, error: licenseError } = await adminSupabase
        .from("license_keys")
        .select("*")
        .eq("key", cleanKey)
        .eq("is_used", false)
        .single();

      if (licenseError || !license) {
        return NextResponse.json({ 
          error: "Invalid or already redeemed license key." 
        }, { status: 404 });
      }
      
      planToUpgrade = license.plan_id;

      // Mark the key as used
      await adminSupabase
        .from("license_keys")
        .update({ 
          is_used: true, 
          used_by: user.id,
          used_at: new Date().toISOString()
        })
        .eq("id", license.id);
    }

    // 3. Update the user's plan securely
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .update({ plan: planToUpgrade })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile upgrade error:", profileError);
      // Fallback: try with the user's client if admin failed
      const { error: retryError } = await supabase
        .from("profiles")
        .update({ plan: planToUpgrade })
        .eq("id", user.id);
        
      if (retryError) {
        return NextResponse.json({ error: "Failed to upgrade your profile. Please contact support." }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Success! Your account has been upgraded to ${planToUpgrade.toUpperCase()}.`,
      plan: planToUpgrade
    });

  } catch (err: any) {
    console.error("Redemption error:", err);
    return NextResponse.json({ error: "Internal server error during redemption." }, { status: 500 });
  }
}
