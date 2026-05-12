import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { PLANS, normalizePlanId, type PlanId } from "@/lib/plans";

type JsonRecord = Record<string, unknown>;


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
  } catch {
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
    } catch {
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

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function extractMetadata(data: JsonRecord): JsonRecord {
  const directMetadata = asRecord(data.metadata);
  if (directMetadata) return directMetadata;

  const checkoutSession = asRecord(data.checkout_session);
  const checkoutMetadata = checkoutSession ? asRecord(checkoutSession.metadata) : null;
  if (checkoutMetadata) return checkoutMetadata;

  const subscription = asRecord(data.subscription);
  const subscriptionMetadata = subscription ? asRecord(subscription.metadata) : null;
  if (subscriptionMetadata) return subscriptionMetadata;

  const payment = asRecord(data.payment);
  const paymentMetadata = payment ? asRecord(payment.metadata) : null;
  if (paymentMetadata) return paymentMetadata;

  return {};
}

function extractAuditFields(data: JsonRecord) {
  const subscription = asRecord(data.subscription);
  const payment = asRecord(data.payment);

  return {
    subscriptionId:
      getString(data.subscription_id) ||
      getString(subscription?.subscription_id) ||
      getString(subscription?.id) ||
      null,
    paymentId:
      getString(data.payment_id) ||
      getString(payment?.payment_id) ||
      getString(payment?.id) ||
      null,
  };
}

async function updateUserPlan(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  planId: PlanId,
  audit: { subscriptionId: string | null; paymentId: string | null }
) {
  const updatePayload: Record<string, string> = {
    plan: planId,
    updated_at: new Date().toISOString(),
  };

  if (audit.subscriptionId) {
    updatePayload.subscription_id = audit.subscriptionId;
  }
  if (audit.paymentId) {
    updatePayload.last_payment_id = audit.paymentId;
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update(updatePayload)
    .eq("id", userId);

  if (!error) {
    return null;
  }

  console.warn("[Dodo Webhook] Audit payload failed, retrying with plan only.", error);

  const fallback = await supabaseAdmin
    .from("profiles")
    .update({ plan: planId })
    .eq("id", userId);

  return fallback.error;
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

    const payload = JSON.parse(rawBody) as {
      event_type?: unknown;
      event_id?: unknown;
      data?: unknown;
    };
    const eventType =
      typeof payload.event_type === "string" ? payload.event_type : "";
    const data = asRecord(payload.data) || {};

    console.log(`[Dodo Webhook] Verified Event: ${eventType} (ID: ${payload.event_id})`);

    // Only process events that should affect user's plan
    const relevantEvents = [
      "subscription.active",
      "subscription.updated",
      "payment.succeeded" // Fallback for one-time payments if any
    ];

    if (relevantEvents.includes(eventType)) {
      // Extract metadata (passed during checkout creation)
      const metadata = extractMetadata(data);
      const userId = typeof metadata.user_id === "string" ? metadata.user_id : undefined;
      let planId = typeof metadata.plan_id === "string" ? metadata.plan_id : undefined;

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
      if (typeof planId !== "string" || !(planId in PLANS)) {
         console.error(`[Dodo Webhook] Received invalid planId: ${planId}`);
         return NextResponse.json({ error: "Invalid planId" }, { status: 400 });
      }

      const normalizedPlanId = normalizePlanId(planId);
      const audit = extractAuditFields(data);
      console.log(`[Dodo Webhook] Provisioning ${normalizedPlanId} for user ${userId}`);
      
      const supabaseAdmin = getSupabaseAdmin();
      const error = await updateUserPlan(
        supabaseAdmin,
        userId,
        normalizedPlanId,
        audit
      );

      if (error) {
        console.error(`[Dodo Webhook] Supabase update error:`, error);
        // We return 500 because Dodo should retry if our DB is down
        return NextResponse.json({ error: "Internal database error" }, { status: 500 });
      }
      
      console.log(`[Dodo Webhook] Successfully updated profile ${userId} to ${normalizedPlanId}`);
    } else if (eventType === "subscription.canceled" || eventType === "subscription.expired") {
       // Optional: Handle cancellation by downgrading to free
       const userId = extractMetadata(data).user_id;
       if (userId) {
          console.log(`[Dodo Webhook] Downgrading user ${userId} due to ${eventType}`);
          const supabaseAdmin = getSupabaseAdmin();
          await supabaseAdmin
            .from("profiles")
          .update({ plan: "free" as PlanId })
          .eq("id", userId);
       }
    }

    // Always respond with 200 to Dodo if we reached here
    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown webhook processing error";
    console.error(`[Dodo Webhook] Processing Error:`, message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
