import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import DodoPayments from "dodopayments";

export async function POST(req: Request) {
  try {
    if (!process.env.DODO_API_KEY) {
      console.error("DODO_API_KEY is not configured.");
      return NextResponse.json(
        { error: "Payment gateway is not currently available." },
        { status: 503 }
      );
    }

    const apiKey = process.env.DODO_API_KEY;
    const environment = apiKey.startsWith("test_") ? "test_mode" : "live_mode";

    const client = new DodoPayments({
      bearerToken: apiKey,
      environment: environment,
    });

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is missing." },
        { status: 400 }
      );
    }

    // Attempt to get user email if logged in, otherwise dummy
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

    const { data: { user } } = await supabase.auth.getUser();

    // Create the session
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;

    // Note: Dodo Payments might expect 'payments' or 'checkoutSessions' in their newer verisons.
    // The snippet uses 'payments.create' or 'payments' to generate payment links
    // If we only have product_cart we use checkoutSessions typically if supported
    // Since we just ran `npm install dodopayments`, lets use standard properties.
    // Utilize checkoutSessions API for creating checkout links for products/subscriptions
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: user?.email || "customer@example.com",
        name: user?.user_metadata?.full_name || "Storix User",
      },
      billing_address: {
        country: "IN",
      },
      return_url: `${origin}/dashboard/billing?success=true`,
    } as any);

    return NextResponse.json({ url: session.checkout_url || "" });

  } catch (error: any) {
    console.error("Dodo payments creation error:", error);
    
    // Bubble up API and validation errors with their correct status codes instead of a generic 500
    const statusCode = error.status || error.statusCode || 500;
    const errorMessage = error.message || "An unexpected issue occurred while initiating checkout.";
    
    return NextResponse.json(
      { error: errorMessage, details: error },
      { status: statusCode }
    );
  }
}
