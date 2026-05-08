-- Security Fix: Enforcing Row Level Security (RLS) across all core tables

-- 1. Enable RLS on Products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Product Policies:
-- Users can read all products (needed for public storefronts)
CREATE POLICY "Products are publicly viewable" 
ON public.products FOR SELECT 
USING (true);

-- Users can only insert their own products
CREATE POLICY "Users can insert their own products" 
ON public.products FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own products
CREATE POLICY "Users can update their own products" 
ON public.products FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can only delete their own products
CREATE POLICY "Users can delete their own products" 
ON public.products FOR DELETE 
USING (auth.uid() = user_id);


-- 2. Enable RLS on Profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile Policies:
-- Profiles are publicly viewable
CREATE POLICY "Profiles are publicly viewable" 
ON public.profiles FOR SELECT 
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Database function to ensure newly created users get a profile (if not using trigger)
-- This already exists likely, but we add strict RLS.


-- 3. Enable RLS on Clicks table
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- Click Policies:
-- Clicks are public to insert (anonymous visitors track clicks)
CREATE POLICY "Anyone can insert clicks" 
ON public.clicks FOR INSERT 
WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- Only developers/owners can view their own clicks
CREATE POLICY "Users can view their own products clicks" 
ON public.clicks FOR SELECT 
USING (
  product_id IN (
    SELECT id FROM products WHERE user_id = auth.uid()
  )
);
