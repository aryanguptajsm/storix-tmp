import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import DodoPayments from "dodopayments";
import type { CheckoutSessionCreateParams } from "dodopayments/resources/checkout-sessions";
import { PLANS, type PlanId } from "@/lib/plans";
import { checkRateLimit, writeAuditLog } from "@/lib/billing";

function getDodoClient(): DodoPayments | null {
  const apiKey =
    process.env.DODO_PAYMENTS_API_KEY || process.env.DODO_API_KEY;

  if (!apiKey) return null;

  const environment =
    (process.env.DODO_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode";

  return new DodoPayments({
    bearerToken: apiKey,
    environment,
    timeout: 15000,
  });
}

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const client = getDodoClient();

    if (!client) {
      console.error(
        "Dodo Payments API key is missing. Set DODO_PAYMENTS_API_KEY in .env.local"
      );
      return NextResponse.json(
        { error: "Payment gateway is not configured. Please contact support." },
        { status: 503 }
      );
    }

    // ── Authenticate user ──────────────────────────────────────────────────
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id || !user?.email) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to continue." },
        { status: 401 }
      );
    }

    // ── Rate limit: max 5 checkout attempts per user per 10 minutes ─────────
    const admin = getAdmin();
    if (admin) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

      const rl = await checkRateLimit(admin, user.id, "payment_attempt", 5, 600);
      if (!rl.allowed) {
        await writeAuditLog(admin, {
          userId: user.id,
          action: "payment.rate_limited",
          actor: "user",
          metadata: { ip },
          ipAddress: ip,
        });
        return NextResponse.json(
          { error: "Too many payment attempts. Please wait 10 minutes before trying again." },
          { status: 429, headers: { "Retry-After": "600" } }
        );
      }
    }

    // ── Validate request body ───────────────────────────────────────────────
    const body = await req.json();
    const { productId, planId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "A valid Product ID is required." },
        { status: 400 }
      );
    }

    // ── Server-side plan integrity check (prevent tampering) ─────────────────
    const plan = PLANS[planId as PlanId];
    if (!plan || plan.dodoProductId !== productId) {
      console.warn(
        `[Security] Plan tampering attempt: planId=${planId}, productId=${productId}, userId=${user.id}`
      );
      if (admin) {
        await writeAuditLog(admin, {
          userId: user.id,
          action: "payment.tamper_attempt",
          actor: "user",
          metadata: { planId, productId },
        });
      }
      return NextResponse.json(
        { error: "Invalid plan or product selection. Please refresh and try again." },
        { status: 400 }
      );
    }

    // ── Build the checkout session ───────────────────────────────────────────
    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "localhost:3000";
    const xProtocol = req.headers.get("x-forwarded-proto");
    const protocol = xProtocol ? xProtocol.split(",")[0].trim() : "http";
    const finalProtocol =
      host.includes("localhost") || host.includes("127.0.0.1") ? protocol : "https";
    const origin = `${finalProtocol}://${host}`;

    const sessionParams: CheckoutSessionCreateParams = {
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: `${origin}/dashboard/pro-success?plan=${planId}`,
      cancel_url: `${origin}/pricing`,
      customer: {
        email: user.email,
        name: user.user_metadata?.full_name || undefined,
      },
      metadata: {
        plan_id: planId || "pro",
        user_id: user.id,
      },
    };

    const session = await client.checkoutSessions.create(sessionParams);

    if (!session.checkout_url) {
      console.error("Dodo returned no checkout_url:", session);
      return NextResponse.json(
        { error: "Payment gateway did not return a checkout URL." },
        { status: 502 }
      );
    }

    // Log the checkout initiation for forensics
    if (admin) {
      await writeAuditLog(admin, {
        userId: user.id,
        action: "payment.checkout_initiated",
        actor: "user",
        metadata: { planId, sessionId: session.session_id },
      });
    }

    return NextResponse.json({
      url: session.checkout_url,
      sessionId: session.session_id,
    });
  } catch (error: unknown) {
    console.error("Dodo checkout session creation error:", error);

    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number; message?: string };
      return NextResponse.json(
        { error: apiError.message || "Payment provider returned an error." },
        { status: apiError.status || 500 }
      );
    }

    const msg =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during checkout.";

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
