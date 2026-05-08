import React from "react";
import { createClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import Image from "next/image";
import { StoreView } from "@/components/store/StoreView";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { StoreSearch } from "@/components/store/StoreSearch";

// Cache store pages for 60s, then background-revalidate (ISR)
// This makes repeat visits instant while still getting fresh data
export const revalidate = 60;

interface Props {
  params: Promise<{ username: string }>;
}

// Dynamic Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const normalizedUsername = username.toLowerCase();
  
  // Single profile fetch — use ilike for robustness
  const { data: profile } = await supabase
    .from("profiles")
    .select("store_name, store_description")
    .ilike("username", normalizedUsername)
    .single();

  if (!profile) {
    // If not found, check if it's a potential owner (metadata fallback)
    const cookieStore = await cookies();
    const hasSession = cookieStore.getAll().some(c => c.name.includes('auth-token') || c.name.startsWith('sb-'));
    
    const { data: { user } } = hasSession ? await supabase.auth.getUser() : { data: { user: null } };
    if (user && user.email?.split('@')[0].toLowerCase() === normalizedUsername) {
      const { data: ownProfile } = await supabase
        .from("profiles")
        .select("store_name, store_description")
        .eq("id", user.id)
        .single();
      
      if (ownProfile) {
        return {
          title: `${ownProfile.store_name} | Storix`,
          description: ownProfile.store_description,
        };
      }
    }
    return { title: "Store Not Found | Storix" };
  }

  return {
    title: `${profile.store_name} | Storix`,
    description: profile.store_description,
  };
}

export default async function PublicStorePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  
  // Normalized username for query robustness — handle encoding and special chars
  const normalizedUsername = decodeURIComponent(username).toLowerCase().trim().replace(/\/$/, "");

  // Single profile fetch — we use .ilike for case-insensitive robust lookups
  // We also select by email_prefix as a secondary fallback to catch new users who haven't set a username
  let { data: profile } = await supabase
    .from("profiles")
    .select("id, store_name, store_description, username, theme, store_logo, plan")
    .ilike("username", normalizedUsername)
    .single();

  // Check if current visitor is logged in
  const cookieStore = await cookies();
  const hasSession = cookieStore.getAll().some(c => c.name.includes('auth-token') || c.name.startsWith('sb-'));
  const { data: { user } } = hasSession ? await supabase.auth.getUser() : { data: { user: null } };

  // GREEDY FALLBACK 1: If not found, check if it's the owner's email prefix
  let isPotentialOwner = false;
  if (!profile && user) {
    const emailPrefix = user.email?.split('@')[0].toLowerCase();
    if (emailPrefix === normalizedUsername) {
      isPotentialOwner = true;
      const { data: ownProfile } = await supabase
        .from("profiles")
        .select("id, store_name, store_description, username, theme, store_logo, plan")
        .eq("id", user.id)
        .single();
      
      if (ownProfile) {
        profile = ownProfile;
      }
    }
  }

  // GREEDY FALLBACK 2: Check for username matches without special characters (resilience)
  if (!profile) {
    const cleanUsername = normalizedUsername.replace(/[^a-z0-9]/g, "");
    const { data: fuzzyProfile } = await supabase
      .from("profiles")
      .select("id, store_name, store_description, username, theme, store_logo, plan")
      .ilike("username", cleanUsername)
      .limit(1)
      .maybeSingle();
    
    if (fuzzyProfile) {
      profile = fuzzyProfile;
    }
  }

  // Only fetch products if we have a valid profile
  const productsRes = profile
    ? await supabase
        .from("products")
        .select("id, user_id, title, description, image_url, platform, price, original_price, discount_percentage, rating, review_count, brand, original_url, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (productsRes.error) {
    console.error("Public store product fetch failed:", productsRes.error);
  }

  const products = productsRes.data || [];

  // Only if profile is not found, fetch featured stores for better engagement
  let featuredStores: Array<{
    username: string;
    store_name: string;
    store_description?: string | null;
    store_logo?: string | null;
  }> = [];
  if (!profile) {
    const { data: stores } = await supabase
      .from("profiles")
      .select("username, store_name, store_description, store_logo")
      .not("username", "is", null)
      .order("created_at", { ascending: false })
      .limit(4);
    featuredStores = stores || [];
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-start py-12 md:py-20 p-6 text-center relative overflow-hidden">
        {/* Sub-grid background for the error page */}
        <div className="absolute inset-0 grid-bg-subtle opacity-20 pointer-events-none" />
        
        <div className="glass p-10 md:p-14 rounded-[3.5rem] border border-white/10 max-w-2xl w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden perspective-1000">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-[80px]" />
          
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-primary shadow-inner border border-primary/20 animate-float-slow">
            <ShoppingBag size={36} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tighter leading-none animate-fade-in-up">
            Store Not Found
          </h1>
          
          <p className="text-white/40 text-lg mb-10 leading-relaxed font-medium animate-fade-in-up animation-delay-100 px-4">
            We couldn&apos;t find an active terminal at <span className="text-primary font-black tracking-widest italic">/{username}</span>.
            {isPotentialOwner ? (
               <span className="block mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 text-white/60 text-sm">
                 <Sparkles size={16} className="inline mr-2 text-primary" />
                 This is your allocated username. Initialize your store to go live.
               </span>
            ) : (
               <span className="block mt-2">The requested store is offline or has been removed.</span>
            )}
          </p>

          {!isPotentialOwner && (
            <div className="animate-fade-in-up animation-delay-150">
              <StoreSearch />
            </div>
          )}
          
          <div className="flex flex-col gap-4 animate-fade-in-up animation-delay-200 mb-12">
            {isPotentialOwner ? (
              <Link href="/dashboard/store" className="w-full">
                <Button size="lg" className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 text-base font-black uppercase tracking-widest gap-3 hover-shine transition-all">
                  Set Up My Store
                  <Sparkles size={18} className="animate-pulse" />
                </Button>
              </Link>
            ) : (
              <Link href="/" className="w-full">
                <Button size="lg" className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white shadow-xl text-base font-bold transition-all">
                  Go Home
                </Button>
              </Link>
            )}
          </div>

          {/* Featured Stores */}
          {featuredStores.length > 0 && !isPotentialOwner && (
            <div className="animate-fade-in-up animation-delay-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Popular Stores</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredStores.map((store) => (
                  <Link key={store.username} href={`/store/${store.username}`}>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left group">
                      <div className="w-10 h-10 rounded-lg bg-surface-light mb-3 flex items-center justify-center overflow-hidden border border-white/10">
                        {store.store_logo ? (
                          <Image
                            src={store.store_logo}
                            alt={store.store_name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag size={16} className="text-white/20" />
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{store.store_name}</h4>
                      <p className="text-[10px] text-white/40 line-clamp-1 mt-1">@{store.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-10 pt-10 border-t border-white/5">
             <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">
              Powered by Storix
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <StoreView profile={profile} products={products} />;
}
