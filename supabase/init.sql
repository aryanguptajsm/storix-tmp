-- Storix Core Schema Definition

-- 1. Profiles Table (Acts as Store wrapper + User Profile)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE, -- Used for subdomain routing (e.g., username.storix.in)
    store_name TEXT,
    store_description TEXT,
    theme TEXT DEFAULT 'default',
    plan TEXT DEFAULT 'free',
    subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    platform TEXT, -- e.g., 'amazon', 'flipkart'
    price TEXT,
    original_price TEXT,
    discount_percentage TEXT,
    original_url TEXT NOT NULL,
    affiliate_url TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Clicks Analytics Table
CREATE TABLE IF NOT EXISTS public.clicks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Page Blocks (For future drag-and-drop support)
CREATE TABLE IF NOT EXISTS public.page_blocks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    block_type TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    content JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies (as defined in security_fix.sql, plus additions)

-- Profiles
CREATE POLICY "Profiles are publicly viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Products
CREATE POLICY "Products are publicly viewable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Users can insert their own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- Clicks (Public insert, owner view)
CREATE POLICY "Anyone can insert clicks" ON public.clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own products clicks" ON public.clicks FOR SELECT USING (
  product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
);

-- Page Blocks
CREATE POLICY "Blocks are publicly viewable" ON public.page_blocks FOR SELECT USING (true);
CREATE POLICY "Users manage own blocks" ON public.page_blocks FOR ALL USING (auth.uid() = user_id);

-- Triggers for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, store_name)
  VALUES (new.id, split_part(new.email, '@', 1), split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
