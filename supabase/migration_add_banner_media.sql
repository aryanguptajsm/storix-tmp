-- Add store_banners array column to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_banners TEXT[] DEFAULT '{}';
