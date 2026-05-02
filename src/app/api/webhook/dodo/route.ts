import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { PLANS, PlanId } from "@/lib/plans";


/**
 * Verifies the Standard Webhooks (Svix) signature from Dodo Payments
 */
function verifySignature(body: string, headers: Headers, secret: string): boolean {
  const msgId = headers.get("webhook-id");
  const msgTimestamp = headers.get("webhook-timestamp");
  const msgSignature = headers.get("webhook-signature");

  if (!msgId || !msgTimestamp || !msgSignature) return false;

  // Verify timestamp to prevent replay attacks (5 minute window)
  const now = Math.floor(Date.now() / 1000);
  const timestamp = parseInt(msgTimestamp, 10);
  if (isNaN(timestamp) || Math.abs(now - timestamp) > 300) {
    console.error("[Dodo Webhook] Timestamp out of tolerance window");
    return false;
  }

  const signedContent = `${msgId}.${msgTimestamp}.${body}`;
  
  // Dodo/Svix secrets are base64 encoded, sometimes prefixed with "whsec_"
  const secretKey = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let decodedSecret: Buffer;
  try {
    decodedSecret = Buffer.from(secretKey, "base64");
  } catch (e) {
    console.error("[Dodo Webhook] Failed to decode secret key");
    return false;
  }

  const computedSignature = crypto
    .createHmac("sha256", decodedSecret)
    .update(signedContent)
    .digest("base64");

  const signatures = msgSignature.split(" ");
  for (const part of signatures) {
    const [version, signature] = part.split(",");
    if (version !== "v1") continue;
    
    try {
      const sigBuffer = Buffer.from(signature, "base64");
      const computedBuffer = Buffer.from(computedSignature, "base64");
      
      if (sigBuffer.length === computedBuffer.length && crypto.timingSafeEqual(sigBuffer, computedBuffer)) {
        return true;
      }
    } catch (e) {
      continue;
    }
  }

  return false;
}

// Helper for lazy initialization of Supabase Admin
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase configurations for admin operations. Check SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const secret = process.env.DODO_WEBHOOK_SECRET;

    if (!secret || secret === "whsec_your_secret_here_from_dodo_dashboard") {
      console.error("[Dodo Webhook] DODO_WEBHOOK_SECRET is not configured correctly.");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // AUTHENTICATE: Verify the signature
    if (!verifySignature(rawBody, req.headers, secret)) {
      console.error("[Dodo Webhook] Invalid signature or timestamp.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event_type;
    const data = payload.data;

    console.log(`[Dodo Webhook] Verified Event: ${eventType} (ID: ${payload.event_id})`);

    // Only process events that should affect user's plan
    const relevantEvents = [
      "subscription.active",
      "subscription.updated",
      "payment.succeeded" // Fallback for one-time payments if any
    ];

    if (relevantEvents.includes(eventType)) {
      // Extract metadata (passed during checkout creation)
      const metadata = data.metadata || {};
      const userId = metadata.user_id;
      let planId = metadata.plan_id;

      // Validate userId
      if (!userId) {
        console.warn("[Dodo Webhook] No user_id found in metadata. Cannot update plan.");
        return NextResponse.json({ error: "Missing user_id in metadata" }, { status: 200 }); // Still return 200 to acknowledge receipt
      }

      // Default to "pro" if planId is missing but event is valid (safety)
      if (!planId) {
         console.warn("[Dodo Webhook] plan_id missing in metadata, defaulting to 'pro'");
         planId = "pro";
      }

      // Validate planId against our PLANS definition
      if (!(planId in PLANS)) {
         console.error(`[Dodo Webhook] Received invalid planId: ${planId}`);
         return NextResponse.json({ error: "Invalid planId" }, { status: 400 });
      }

      console.log(`[Dodo Webhook] Provisioning ${planId} for user ${userId}`);
      
      const supabaseAdmin = getSupabaseAdmin();
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ 
          plan: planId,
          // Store payment info for audit/support
          last_payment_id: data.payment_id || data.subscription_id,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) {
        console.error(`[Dodo Webhook] Supabase update error:`, error);
        // We return 500 because Dodo should retry if our DB is down
        return NextResponse.json({ error: "Internal database error" }, { status: 500 });
      }
      
      console.log(`[Dodo Webhook] Successfully updated profile ${userId} to ${planId}`);
    } else if (eventType === "subscription.canceled" || eventType === "subscription.expired") {
       // Optional: Handle cancellation by downgrading to free
       const userId = data.metadata?.user_id;
       if (userId) {
          console.log(`[Dodo Webhook] Downgrading user ${userId} due to ${eventType}`);
          const supabaseAdmin = getSupabaseAdmin();
          await supabaseAdmin
            .from("profiles")
            .update({ plan: "free" })
            .eq("id", userId);
       }
    }

    // Always respond with 200 to Dodo if we reached here
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`[Dodo Webhook] Processing Error:`, err.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}

