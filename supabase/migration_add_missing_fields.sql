-- Migration to add missing columns from the scraper feature update
-- These columns were queried in the frontend but not added to the remote database.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percentage TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS review_count TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ai_content TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS article_type TEXT DEFAULT 'review';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS content_status TEXT DEFAULT 'pending';
