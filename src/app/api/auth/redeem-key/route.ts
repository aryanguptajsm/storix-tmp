import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { key } = await req.json();
    if (!key) {
      return NextResponse.json({ error: "License key is required." }, { status: 400 });
    }

    const supabase = createClient();
    
    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized. Access denied." }, { status: 401 });
    }

    // 2. Find the key in the database
    // Note: We use the admin client logic here conceptually. 
    // Since we don't have service role key in env, we hope the RLS allows read if key matches.
    const { data: license, error: licenseError } = await supabase
      .from("license_keys")
      .select("*")
      .eq("key", key.toUpperCase())
      .eq("is_used", false)
      .single();

    if (licenseError || !license) {
      return NextResponse.json({ 
        error: "Invalid or already redeemed license key." 
      }, { status: 404 });
    }

    // 3. Update the user's plan
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ plan: license.plan_id })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: "Failed to upgrade your profile." }, { status: 500 });
    }

    // 4. Mark the key as used
    // In a real production app, this should be a transaction.
    await supabase
      .from("license_keys")
      .update({ 
        is_used: true, 
        used_by: user.id,
        used_at: new Date().toISOString()
      })
      .eq("id", license.id);

    return NextResponse.json({ 
      success: true, 
      message: `Success! Your account has been upgraded to ${license.plan_id.toUpperCase()}.`,
      plan: license.plan_id
    });

  } catch (err: any) {
    console.error("Redemption error:", err);
    return NextResponse.json({ error: "Internal server error during redemption." }, { status: 500 });
  }
}
