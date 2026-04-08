-- Migration to add AI content support to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ai_content TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS article_type TEXT DEFAULT 'review';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS content_status TEXT DEFAULT 'pending'; -- 'pending', 'generated', 'failed'
