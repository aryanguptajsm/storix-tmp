-- License Key System Initialization
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- This script creates the core infrastructure for tiered subscription redemption.

-- 1. Create the license_keys table
CREATE TABLE IF NOT EXISTS public.license_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'pro', 'business')),
    is_used BOOLEAN DEFAULT FALSE,
    used_by UUID REFERENCES public.profiles(id),
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_license_keys_key ON public.license_keys(key);
CREATE INDEX IF NOT EXISTS idx_license_keys_unused ON public.license_keys(is_used) WHERE is_used = FALSE;

-- 3. Security: Row Level Security (RLS)
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

-- Allow users to verify unused keys during the redemption process
DROP POLICY IF EXISTS "Public can verify unused keys" ON public.license_keys;
CREATE POLICY "Public can verify unused keys" 
ON public.license_keys 
FOR SELECT 
USING (is_used = FALSE);

-- Allow service role to update keys (API uses service role for profile upgrades)
-- Usually service role bypasses RLS, but explicit policies are safer.

-- 4. Initial Tactical Payload: Sample Mock Keys
-- These keys can be used to test the redemption flow:
INSERT INTO public.license_keys (key, plan_id) 
VALUES 
    ('STRX-PRO-BETA', 'pro'),
    ('STRX-BIZ-BETA', 'business'),
    ('STRX-TEST-FREE', 'free')
ON CONFLICT (key) DO NOTHING;

-- Verification Query:
-- SELECT * FROM public.license_keys;
