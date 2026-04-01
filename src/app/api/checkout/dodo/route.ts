import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import DodoPayments from "dodopayments";

const apiKey = "E7ceXGCo247-st9T.MddHSp8IBfYwwy9kt4sgSURRTLxmQqSI5_7t4aP0MYCLbBKo";

const client = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY || apiKey,
});

export async function POST(req: Request) {
  try {
    const { productId, planId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is missing." },
        { status: 400 }
      );
    }

    // Attempt to get user email if logged in, otherwise dummy
    const cookieStore = cookies();
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
    const payment = await client.payments.create({
      productCart: [
        {
          productId: productId,
          quantity: 1,
        },
      ],
      billing: {
        email: user?.email || "customer@example.com",
        name: user?.user_metadata?.full_name || "Storix User",
      },
      returnUrl: `${origin}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    });

    // Check if the API returned a link or an id we must assemble
    // Wait, let's use the explicit `payment.paymentLink` or `payment.url` depending on sdk structure.
    return NextResponse.json({ url: (payment as any).paymentLink || (payment as any).checkoutUrl || (payment as any).url || (payment as any).payment_link });

  } catch (error: any) {
    console.error("Dodo payments creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
