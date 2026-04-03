import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import DodoPayments from "dodopayments";
import type { CheckoutSessionCreateParams } from "dodopayments/resources/checkout-sessions";

// Singleton-like: create the Dodo client once per cold start, not per request
function getDodoClient(): DodoPayments | null {
  // The SDK looks for DODO_PAYMENTS_API_KEY by default.
  // We also support DODO_API_KEY for backward compatibility.
  const apiKey =
    process.env.DODO_PAYMENTS_API_KEY ||
    process.env.DODO_API_KEY;

  if (!apiKey) return null;

  const environment = apiKey.startsWith("test_") ? "test_mode" : "live_mode";

  return new DodoPayments({
    bearerToken: apiKey,
    environment,
    timeout: 15000, // 15s timeout — fail fast instead of hanging
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

    // Get logged-in user email for pre-filling checkout
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build the return URL securely
    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;

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
      metadata: {
        plan_id: planId || "pro",
        user_id: user?.id || "",
      },
    };

    // Add customer info if available
    if (user?.email) {
      sessionParams.customer = {
        email: user.email,
        name: user.user_metadata?.full_name || undefined,
      };
    }

    // Add billing address default for Indian customers
    sessionParams.billing_address = {
      country: "IN",
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
