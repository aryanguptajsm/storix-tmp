import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { PLANS, normalizePlanId, type PlanId } from "@/lib/plans";
import { generateLicenseKey, writeAuditLog } from "@/lib/billing";

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

      if (
        sigBuffer.length === computedBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, computedBuffer)
      ) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase configurations for admin operations. Check SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function extractMetadata(data: JsonRecord): JsonRecord {
  const direct = asRecord(data.metadata);
  if (direct) return direct;

  for (const key of ["checkout_session", "subscription", "payment"]) {
    const nested = asRecord(asRecord(data[key])?.metadata);
    if (nested) return nested;
  }

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
    amount:
      getNumber(data.amount) ||
      getNumber(payment?.amount) ||
      0,
    currency:
      getString(data.currency) ||
      getString(payment?.currency) ||
      "USD",
  };
}

/**
 * Atomically updates the user's plan with subscription + payment IDs.
 */
async function updateUserPlan(
  admin: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  planId: PlanId,
  audit: { subscriptionId: string | null; paymentId: string | null }
) {
  const updatePayload: Record<string, string> = {
    plan: planId,
    updated_at: new Date().toISOString(),
  };

  if (audit.subscriptionId) updatePayload.subscription_id = audit.subscriptionId;
  if (audit.paymentId) updatePayload.last_payment_id = audit.paymentId;

  const { error } = await admin.from("profiles").update(updatePayload).eq("id", userId);

  if (!error) return null;

  console.warn("[Dodo Webhook] Retrying plan update with minimal payload:", error);
  const { error: fallbackError } = await admin
    .from("profiles")
    .update({ plan: planId })
    .eq("id", userId);

  return fallbackError;
}

/**
 * Records a payment event to the immutable payments ledger.
 * Returns the inserted payment row ID (for license association).
 */
async function recordPayment(
  admin: ReturnType<typeof getSupabaseAdmin>,
  params: {
    userId: string;
    transactionId: string;
    planId: string;
    amount: number;
    currency: string;
    eventType: string;
    rawPayload: unknown;
  }
): Promise<string | null> {
  try {
    // Upsert so duplicate webhook deliveries don't cause duplicate records
    const { data, error } = await admin
      .from("payments")
      .upsert(
        {
          user_id: params.userId,
          provider: "dodo",
          transaction_id: params.transactionId,
          plan_id: params.planId,
          amount: params.amount,
          currency: params.currency.toUpperCase(),
          status: "succeeded",
          event_type: params.eventType,
          raw_payload: params.rawPayload,
        },
        { onConflict: "transaction_id", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    if (error) {
      console.error("[Dodo Webhook] Failed to record payment:", error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error("[Dodo Webhook] Payment insert exception:", err);
    return null;
  }
}

/**
 * Generates a license key, stores only the hash in DB, returns the raw key for emailing.
 */
async function issueLicenseKey(
  admin: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  planId: string,
  paymentRowId: string | null
): Promise<string | null> {
  try {
    const { rawKey, keyHash, keyPrefix } = generateLicenseKey();

    // Calculate expiry: subscription-based = 1 year from now; free = null
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { error } = await admin.from("licenses").insert({
      user_id: userId,
      plan_id: planId,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      expires_at: expiresAt.toISOString(),
      payment_id: paymentRowId || null,
      is_active: true,
    });

    if (error) {
      console.error("[Dodo Webhook] Failed to store license:", error);
      return null;
    }

    // rawKey is returned so the caller can send it in an email/notification.
    // We NEVER store it anywhere after this point.
    return rawKey;
  } catch (err) {
    console.error("[Dodo Webhook] License issue exception:", err);
    return null;
  }
}

// ─── Webhook Handler ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const secret = process.env.DODO_WEBHOOK_SECRET;

    if (!secret || secret === "whsec_your_secret_here_from_dodo_dashboard") {
      console.error("[Dodo Webhook] DODO_WEBHOOK_SECRET is not configured correctly.");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // AUTHENTICATE: Verify the Svix/Dodo signature
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

    console.log(
      `[Dodo Webhook] Verified Event: ${eventType} (ID: ${payload.event_id})`
    );

    const supabaseAdmin = getSupabaseAdmin();

    // ── Handle successful payment / subscription activation ──────────────────
    const successEvents = [
      "subscription.active",
      "subscription.renewed",
      "subscription.updated",
      "payment.succeeded",
    ];

    if (successEvents.includes(eventType)) {
      const metadata = extractMetadata(data);
      const userId = getString(metadata.user_id);
      let planId = getString(metadata.plan_id);

      if (!userId) {
        console.warn("[Dodo Webhook] No user_id in metadata.");
        await writeAuditLog(supabaseAdmin, {
          action: "webhook.missing_user_id",
          actor: "webhook",
          metadata: { eventType, eventId: payload.event_id },
        });
        return NextResponse.json({ error: "Missing user_id" }, { status: 200 });
      }

      if (!planId) {
        console.warn("[Dodo Webhook] plan_id missing, defaulting to 'pro'");
        planId = "pro";
      }

      if (!(planId in PLANS)) {
        console.error(`[Dodo Webhook] Invalid planId: ${planId}`);
        return NextResponse.json({ error: "Invalid planId" }, { status: 400 });
      }

      const normalizedPlanId = normalizePlanId(planId);
      const audit = extractAuditFields(data);

      console.log(
        `[Dodo Webhook] Provisioning ${normalizedPlanId} for user ${userId}`
      );

      // 1. Update the user's plan (atomic DB operation)
      const planUpdateError = await updateUserPlan(
        supabaseAdmin,
        userId,
        normalizedPlanId,
        audit
      );

      if (planUpdateError) {
        console.error("[Dodo Webhook] Plan update error:", planUpdateError);
        await writeAuditLog(supabaseAdmin, {
          userId,
          action: "plan.upgrade_failed",
          actor: "webhook",
          metadata: { eventType, planId: normalizedPlanId, error: planUpdateError },
        });
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        );
      }

      // 2. Record payment in the ledger (use subscriptionId as transactionId for subscriptions)
      const transactionId =
        audit.subscriptionId ||
        audit.paymentId ||
        `${eventType}-${payload.event_id}`;

      const paymentRowId = await recordPayment(supabaseAdmin, {
        userId,
        transactionId,
        planId: normalizedPlanId,
        amount: audit.amount,
        currency: audit.currency,
        eventType,
        rawPayload: payload,
      });

      // 3. Issue a license key (only on new subscriptions, not renewals)
      let rawLicenseKey: string | null = null;
      if (
        eventType === "subscription.active" ||
        eventType === "payment.succeeded"
      ) {
        rawLicenseKey = await issueLicenseKey(
          supabaseAdmin,
          userId,
          normalizedPlanId,
          paymentRowId
        );

        if (rawLicenseKey) {
          console.log(
            `[Dodo Webhook] License issued for user ${userId}: ${rawLicenseKey.slice(0, 9)}...`
          );
          // TODO: Queue an email to the user with rawLicenseKey
          // Email services: Resend, SendGrid, etc.
          // The raw key must ONLY go to the user's inbox — never logged
        }
      }

      // 4. Write success audit log
      await writeAuditLog(supabaseAdmin, {
        userId,
        action: "plan.upgraded",
        actor: "webhook",
        metadata: {
          eventType,
          planId: normalizedPlanId,
          transactionId,
          paymentRowId,
          licenseIssued: !!rawLicenseKey,
          amount: audit.amount,
          currency: audit.currency,
        },
      });

      console.log(
        `[Dodo Webhook] ✓ Successfully provisioned ${normalizedPlanId} for user ${userId}`
      );
    } else if (
      eventType === "subscription.canceled" ||
      eventType === "subscription.expired"
    ) {
      // Downgrade to free on cancellation
      const userId = getString(extractMetadata(data).user_id);
      if (userId) {
        console.log(
          `[Dodo Webhook] Downgrading user ${userId} due to ${eventType}`
        );

        await supabaseAdmin
          .from("profiles")
          .update({ plan: "free" as PlanId, updated_at: new Date().toISOString() })
          .eq("id", userId);

        // Deactivate licenses
        await supabaseAdmin
          .from("licenses")
          .update({ is_active: false })
          .eq("user_id", userId)
          .eq("is_active", true);

        await writeAuditLog(supabaseAdmin, {
          userId,
          action: "plan.downgraded",
          actor: "webhook",
          metadata: { eventType, reason: "subscription_cancelled" },
        });
      }
    } else {
      // Log all unhandled events for forensic visibility
      console.log(`[Dodo Webhook] Unhandled event type: ${eventType}`);
      await writeAuditLog(supabaseAdmin, {
        action: `webhook.unhandled.${eventType}`,
        actor: "webhook",
        metadata: { eventId: payload.event_id },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown webhook processing error";
    console.error("[Dodo Webhook] Processing Error:", message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
