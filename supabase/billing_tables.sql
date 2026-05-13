-- ============================================================
-- Storix Billing Tables Migration
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Payments table — immutable ledger of all payment events
CREATE TABLE IF NOT EXISTS public.payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL DEFAULT 'dodo',          -- 'dodo' | 'stripe' etc.
  transaction_id  TEXT NOT NULL UNIQUE,                  -- provider's payment/subscription ID
  plan_id         TEXT NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  status          TEXT NOT NULL DEFAULT 'succeeded',     -- succeeded | failed | refunded
  event_type      TEXT,                                  -- raw webhook event name
  raw_payload     JSONB,                                 -- full webhook payload for audit
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can only read their own payment records
CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (via webhook)
CREATE POLICY "Service role can manage payments"
  ON public.payments FOR ALL
  USING (auth.role() = 'service_role');


-- 2. Licenses table — hashed license keys (never store raw keys here)
CREATE TABLE IF NOT EXISTS public.licenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id     TEXT NOT NULL,
  key_hash    TEXT NOT NULL UNIQUE,     -- SHA-256 hash of the raw key (hex)
  key_prefix  TEXT NOT NULL,           -- First 8 chars of the key for display (e.g. "STRX-A1B2")
  expires_at  TIMESTAMPTZ,             -- NULL = lifetime / until cancelled
  payment_id  UUID REFERENCES public.payments(id),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own licenses"
  ON public.licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage licenses"
  ON public.licenses FOR ALL
  USING (auth.role() = 'service_role');


-- 3. Audit log — append-only event log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,           -- e.g. 'plan.upgraded', 'payment.succeeded', 'license.generated'
  actor       TEXT NOT NULL DEFAULT 'system', -- 'system' | 'user' | 'webhook'
  metadata    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- No user-facing reads on audit log (admin only via service role)
CREATE POLICY "Service role can manage audit log"
  ON public.audit_log FOR ALL
  USING (auth.role() = 'service_role');


-- 4. License key validation — soft rate limit table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier  TEXT NOT NULL,   -- user_id or IP for anonymous
  action      TEXT NOT NULL,   -- 'payment_attempt' | 'license_validate'
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  count       INTEGER NOT NULL DEFAULT 1,
  UNIQUE(identifier, action, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits FOR ALL
  USING (auth.role() = 'service_role');


-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON public.licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_key_hash ON public.licenses(key_hash);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier, action);
