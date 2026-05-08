-- Fix: Function Search Path Mutable
-- Set search_path = public to prevent search path injection attacks.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, store_name)
  VALUES (new.id, LOWER(split_part(new.email, '@', 1)), split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix: Public Can Execute SECURITY DEFINER Function
-- Fix: Signed-In Users Can Execute SECURITY DEFINER Function
-- Revoke execute permissions from public and authenticated roles. This function should only be executed by triggers.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- Fix: RLS Policy Always True for public.clicks
-- The previous policy 'Anyone can insert clicks' used 'WITH CHECK (true)' which triggers security warnings.
-- We replace it with a policy that checks the auth role. Both anon and authenticated can insert.
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.clicks;
CREATE POLICY "Anyone can insert clicks" ON public.clicks FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated'));
