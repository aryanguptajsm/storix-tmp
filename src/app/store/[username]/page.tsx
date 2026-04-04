import React from "react";
import { createClient } from "@/lib/supabase-server";
import { StoreView } from "@/components/store/StoreView";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

// Cache rendered pages for 60s (ISR) — drastically speeds up repeat visits
export const revalidate = 60;

interface Props {
  params: { username: string };
}

// Dynamic Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("store_name, store_description")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) return { title: "Store Not Found" };

  return {
    title: `${profile.store_name} | Storix`,
    description: profile.store_description,
  };
}

export default async function PublicStorePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  
  // Normalized username for query robustness
  const normalizedUsername = username.toLowerCase();

  // Single profile fetch — we use .ilike for case-insensitive robust lookups
  let { data: profile } = await supabase
    .from("profiles")
    .select("id, store_name, store_description, username, theme, store_logo")
    .ilike("username", normalizedUsername)
    .single();

  // Check if current visitor is logged in
  const { data: { user } } = await supabase.auth.getUser();

  // GREEDY FALLBACK: If not found, check if the current logged-in user's email prefix matches
  // This helps when a user hasn't set a username yet but visits their expected URL
  let isPotentialOwner = false;
  if (!profile && user) {
    const emailPrefix = user.email?.split('@')[0].toLowerCase();
    if (emailPrefix === normalizedUsername) {
      isPotentialOwner = true;
      // Fetch their profile by ID to see if it exists but has a different/no username
      const { data: ownProfile } = await supabase
        .from("profiles")
        .select("id, store_name, store_description, username, theme, store_logo")
        .eq("id", user.id)
        .single();
      
      if (ownProfile) {
        // We found the owner's profile! We can show them their store even if the username doesn't match yet
        // and prompt them to "Confirm this URL"
        profile = ownProfile;
      }
    }
  }

  // Only fetch products if we have a valid profile
  const productsRes = profile
    ? await supabase
        .from("products")
        .select("id, title, image_url, platform, price, original_price, discount_percentage, original_url")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const products = productsRes.data || [];

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#09090F] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Sub-grid background for the error page */}
        <div className="absolute inset-0 grid-bg-subtle opacity-20 pointer-events-none" />
        
        <div className="glass p-10 md:p-14 rounded-[3.5rem] border border-white/10 max-w-xl w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden perspective-1000 hover-tilt preserve-3d">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-[80px]" />
          
          <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-primary shadow-inner border border-primary/20 animate-float-slow">
            <ShoppingBag size={44} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tighter leading-none animate-fade-in-up">
            Store Not Found
          </h1>
          
          <p className="text-white/40 text-lg mb-10 leading-relaxed font-medium animate-fade-in-up animation-delay-100 px-4">
            The coordinates <span className="text-primary font-bold">/{username}</span> don't match any active storefront in our database.
          </p>
          
          <div className="flex flex-col gap-4 animate-fade-in-up animation-delay-200 preserve-3d">
            {isPotentialOwner ? (
              <Link href="/dashboard/store" className="w-full">
                <Button size="lg" className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 text-base font-black uppercase tracking-widest gap-3 hover-shine hover-tilt transition-all">
                  Claim This URL Now
                  <Sparkles size={18} className="animate-pulse" />
                </Button>
              </Link>
            ) : (
              <Link href="/" className="w-full">
                <Button size="lg" className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white shadow-xl text-base font-bold transition-all hover-lift">
                  Back to Home Base
                </Button>
              </Link>
            )}
            
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] mt-6">
              Verified by Storix Fleet Command
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <StoreView profile={profile} products={products} />;
}
