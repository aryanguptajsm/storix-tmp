import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@/lib/supabase-server";
import DodoPayments from "dodopayments";
import type { CheckoutSessionCreateParams } from "dodopayments/resources/checkout-sessions";
import { PLANS, type PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

// Singleton-like: create the Dodo client once per cold start, not per request
function getDodoClient(): DodoPayments | null {
  const apiKey =
    process.env.DODO_PAYMENTS_API_KEY ||
    process.env.DODO_API_KEY;

  if (!apiKey) return null;

  // Use DODO_ENVIRONMENT env var if set, otherwise default to test_mode
  // Set DODO_ENVIRONMENT=live_mode only after Dodo approves your account for live payments
  const environment =
    (process.env.DODO_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode";

  return new DodoPayments({
    bearerToken: apiKey,
    environment,
    timeout: 15000,
  });
}

export async function POST(req: Request) {
  try {
    const client = getDodoClient();

    if (!client) {
      console.error(
        "Dodo Payments API key is missing. " +
        "Set DODO_PAYMENTS_API_KEY or DODO_API_KEY in .env.local"
      );
      return NextResponse.json(
        { error: "Payment gateway is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { productId, planId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "A valid Product ID is required." },
        { status: 400 }
      );
    }

    // Secure validation: Ensure planId and productId are consistent with our source of truth
    const plan = PLANS[planId as PlanId];
    if (!plan || (plan.dodoProductId !== productId)) {
      console.warn(`[Security] Plan tampering attempt detected: planId=${planId}, productId=${productId}`);
      return NextResponse.json(
        { error: "Invalid plan or product selection. Please refresh and try again." },
        { status: 400 }
      );
    }

    // Get logged-in user email for pre-filling checkout
    const supabase = await createSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build the return URL securely
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const xProtocol = req.headers.get("x-forwarded-proto");
    const protocol = xProtocol ? xProtocol.split(',')[0].trim() : "http"; // Robust protocol detection
    
    // In production, force HTTPS unless explicitly on localhost
    const finalProtocol = (host.includes("localhost") || host.includes("127.0.0.1")) ? protocol : "https";
    const origin = `${finalProtocol}://${host}`;

    // Build properly typed checkout session params
    const sessionParams: CheckoutSessionCreateParams = {
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      return_url: `${origin}/dashboard/billing?success=true`,
      cancel_url: `${origin}/pricing`,
    };


    // Add customer info if available
    if (user?.email) {
      sessionParams.customer = {
        email: user.email,
        name: user.user_metadata?.full_name || undefined,
      };
    } else {
      // Enforcement: We MUST have a user to link the subscription
      return NextResponse.json(
        { error: "Authentication required. Please sign in to continue." },
        { status: 401 }
      );
    }

    // Double check user_id is present for metadata (critical for webhook)
    if (!user?.id) {
       return NextResponse.json(
         { error: "Authentication required. Please sign in to continue." },
         { status: 401 }
       );
    }
    
    sessionParams.metadata = {
      plan_id: planId || "pro",
      user_id: user.id
    };

    const session = await client.checkoutSessions.create(sessionParams);

    if (!session.checkout_url) {
      console.error("Dodo returned no checkout_url:", session);
      return NextResponse.json(
        { error: "Payment gateway did not return a checkout URL." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      url: session.checkout_url,
      sessionId: session.session_id,
    });
  } catch (error: unknown) {
    console.error("Dodo checkout session creation error:", error);

    // Extract structured error info from Dodo SDK errors
    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number; message?: string };
      return NextResponse.json(
        {
          error:
            apiError.message ||
            "Payment provider returned an error. Please try again.",
        },
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
