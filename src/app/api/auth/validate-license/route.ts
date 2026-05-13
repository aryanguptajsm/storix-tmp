import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { hashLicenseKey, checkRateLimit, writeAuditLog } from "@/lib/billing";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase admin config");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdmin();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ valid: false, error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: max 10 validation attempts per user per 60 seconds
    const rl = await checkRateLimit(admin, user.id, "license_validate", 10, 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { valid: false, error: "Too many validation attempts. Please wait before trying again." },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        }
      );
    }

    const { key } = await req.json();
    if (!key || typeof key !== "string") {
      return NextResponse.json({ valid: false, error: "License key is required." }, { status: 400 });
    }

    const normalized = key.trim().toUpperCase();
    const keyHash = hashLicenseKey(normalized);

    // Lookup by hash — raw key never touches the server at comparison time
    const { data: license, error } = await admin
      .from("licenses")
      .select("id, plan_id, expires_at, is_active, user_id")
      .eq("key_hash", keyHash)
      .single();

    if (error || !license) {
      await writeAuditLog(admin, {
        userId: user.id,
        action: "license.validation_failed",
        actor: "user",
        metadata: { keyPrefix: normalized.slice(0, 9), ip },
        ipAddress: ip,
      });
      return NextResponse.json({ valid: false, error: "Invalid license key." }, { status: 404 });
    }

    if (!license.is_active) {
      return NextResponse.json({ valid: false, error: "License key is inactive." }, { status: 403 });
    }

    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "License key has expired." }, { status: 403 });
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: "license.validated",
      actor: "user",
      metadata: { licenseId: license.id, planId: license.plan_id, ip },
      ipAddress: ip,
    });

    return NextResponse.json({
      valid: true,
      planId: license.plan_id,
      expiresAt: license.expires_at,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Validation error";
    console.error("[License Validate]", msg);
    return NextResponse.json({ valid: false, error: "Internal error" }, { status: 500 });
  }
}
