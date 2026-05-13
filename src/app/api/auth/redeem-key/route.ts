import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { hashLicenseKey, checkRateLimit, writeAuditLog } from "@/lib/billing";

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Missing Supabase admin config");
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  const admin = getAdmin();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  try {
    const { key } = await req.json();
    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "License key is required." }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // Rate limit: max 5 redemption attempts per user per 5 minutes
    const rl = await checkRateLimit(admin, user.id, "license_redeem", 5, 300);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many redemption attempts. Please wait 5 minutes before trying again." },
        { status: 429, headers: { "Retry-After": "300" } }
      );
    }

    const cleanKey = key.trim().toUpperCase();
    let planToUpgrade = "";

    // ── Master keys (for internal use, demos, and support) ──────────────────
    // In production, you should move these to environment variables
    const masterKeys: Record<string, string> = {
      [process.env.MASTER_KEY_PRO || "STRX-PRO-2026"]: "pro",
      [process.env.MASTER_KEY_BIZ || "STRX-BIZ-2026"]: "business",
      "PRO-LIFETIME": "pro",
      "BIZ-LIFETIME": "business",
    };

    if (masterKeys[cleanKey]) {
      planToUpgrade = masterKeys[cleanKey];
    } else {
      // ── DB-based license key lookup (hash-only) ────────────────────────────
      const keyHash = hashLicenseKey(cleanKey);

      const { data: license, error: licenseError } = await admin
        .from("licenses")
        .select("id, plan_id, is_active, expires_at, user_id")
        .eq("key_hash", keyHash)
        .single();

      if (licenseError || !license) {
        await writeAuditLog(admin, {
          userId: user.id,
          action: "license.redeem_failed",
          actor: "user",
          metadata: { reason: "key_not_found", keyPrefix: cleanKey.slice(0, 9), ip },
          ipAddress: ip,
        });
        return NextResponse.json(
          { error: "Invalid or already redeemed license key." },
          { status: 404 }
        );
      }

      if (!license.is_active) {
        return NextResponse.json(
          { error: "This license key has already been redeemed or deactivated." },
          { status: 403 }
        );
      }

      if (license.expires_at && new Date(license.expires_at) < new Date()) {
        return NextResponse.json({ error: "This license key has expired." }, { status: 403 });
      }

      // If this key was issued for a different user, deny
      if (license.user_id && license.user_id !== user.id) {
        await writeAuditLog(admin, {
          userId: user.id,
          action: "license.redeem_unauthorized",
          actor: "user",
          metadata: { licenseId: license.id, ip },
          ipAddress: ip,
        });
        return NextResponse.json(
          { error: "This license key is not valid for your account." },
          { status: 403 }
        );
      }

      planToUpgrade = license.plan_id;

      // Mark license as inactive (single-use)
      await admin
        .from("licenses")
        .update({ is_active: false, user_id: user.id })
        .eq("id", license.id);
    }

    // ── Atomically update the user's plan ───────────────────────────────────
    const { error: profileError } = await admin
      .from("profiles")
      .update({ plan: planToUpgrade, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile upgrade error:", profileError);
      // Fallback with user client
      const { error: retryError } = await supabase
        .from("profiles")
        .update({ plan: planToUpgrade })
        .eq("id", user.id);

      if (retryError) {
        return NextResponse.json(
          { error: "Failed to upgrade your profile. Please contact support." },
          { status: 500 }
        );
      }
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: "plan.upgraded_via_key",
      actor: "user",
      metadata: { planId: planToUpgrade, ip },
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      message: `Success! Your account has been upgraded to ${planToUpgrade.toUpperCase()}.`,
      plan: planToUpgrade,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Redemption error";
    console.error("Redemption error:", msg);
    return NextResponse.json({ error: "Internal server error during redemption." }, { status: 500 });
  }
}
