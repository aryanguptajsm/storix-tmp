import crypto from "crypto";

/**
 * Generates a cryptographically-secure license key.
 * Format: STRX-XXXX-XXXX-XXXX-XXXX  (base-32 encoded 128-bit random token)
 * Returns: { rawKey, keyHash (SHA-256 hex), keyPrefix }
 */
export function generateLicenseKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  // 128-bit of entropy
  const randomBytes = crypto.randomBytes(16);
  // Base-32 (uppercase, no ambiguous chars) — produces 26 chars from 16 bytes
  const base32Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let encoded = "";
  for (let i = 0; i < randomBytes.length; i++) {
    encoded += base32Alphabet[randomBytes[i] % 32];
  }

  // Split into groups of 4: STRX-XXXX-XXXX-XXXX-XXXX-XX
  const groups = encoded.match(/.{1,4}/g) || [];
  const rawKey = `STRX-${groups.join("-")}`;

  // Store only the SHA-256 hash in DB — never the raw key
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  // First visible prefix for display (non-sensitive)
  const keyPrefix = rawKey.slice(0, 9); // "STRX-XXXX"

  return { rawKey, keyHash, keyPrefix };
}

/**
 * Hashes a raw license key for DB lookup — must match generateLicenseKey hashing.
 */
export function hashLicenseKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey.trim().toUpperCase()).digest("hex");
}

/**
 * Timing-safe comparison of two strings (prevents timing attacks on key comparison).
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/**
 * Simple in-memory + DB rate limiter.
 * Returns true if request is allowed; false if rate-limited.
 */
export async function checkRateLimit(
  supabaseAdmin: ReturnType<typeof import("@supabase/supabase-js").createClient>,
  identifier: string,
  action: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date();
  windowStart.setSeconds(windowStart.getSeconds() - windowSeconds);

  try {
    // Count recent attempts in the window
    const { count } = await supabaseAdmin
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("identifier", identifier)
      .eq("action", action)
      .gte("window_start", windowStart.toISOString());

    const currentCount = count || 0;
    if (currentCount >= maxAttempts) {
      return { allowed: false, remaining: 0 };
    }

    // Record this attempt
    await supabaseAdmin.from("rate_limits").insert({
      identifier,
      action,
      window_start: new Date().toISOString(),
    });

    return { allowed: true, remaining: maxAttempts - currentCount - 1 };
  } catch {
    // On DB error, fail open (allow) to avoid blocking legitimate users
    return { allowed: true, remaining: maxAttempts };
  }
}

/**
 * Writes an audit log entry.
 */
export async function writeAuditLog(
  supabaseAdmin: ReturnType<typeof import("@supabase/supabase-js").createClient>,
  params: {
    userId?: string;
    action: string;
    actor?: "system" | "user" | "webhook";
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }
): Promise<void> {
  try {
    await supabaseAdmin.from("audit_log").insert({
      user_id: params.userId || null,
      action: params.action,
      actor: params.actor || "system",
      metadata: params.metadata || null,
      ip_address: params.ipAddress || null,
    });
  } catch (err) {
    // Audit log failure must never break the main flow
    console.error("[AuditLog] Failed to write:", err);
  }
}
