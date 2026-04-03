import React from "react";
import { createClient } from "@/lib/supabase-server";
import { StoreView } from "@/components/store/StoreView";
import { Button } from "@/components/ui/Button";
import { ShoppingBag } from "lucide-react";
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

  // Single profile fetch — id is reused for products query (no double roundtrip)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, store_name, store_description, username, theme")
    .eq("username", normalizedUsername)
    .single();

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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 max-w-lg w-full shadow-2xl">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary">
            <ShoppingBag size={40} />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
            Store Not Found
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            The coordinates <span className="text-primary font-bold">/{username}</span> don't match any active storefront in our database.
          </p>
          <Link href="/">
            <Button size="lg" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 text-base font-bold">
              Back to Home Base
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <StoreView profile={profile} products={products} />;
}
