-- Migration to add missing columns from the scraper feature update
-- These columns were queried in the frontend but not added to the remote database.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percentage TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS review_count TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
