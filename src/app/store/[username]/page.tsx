"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  ShoppingBag, 
  ExternalLink, 
  ArrowRight, 
  Package, 
  Sparkles,
  Zap,
  Tag,
  Share2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  image_url: string;
  platform: string;
  price: string;
  original_url: string;
  user_id: string;
}

interface Profile {
  store_name: string;
  store_description: string;
  username: string;
  id: string;
}

export default function PublicStorePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadStore() {
      const supabase = createClient();
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, store_name, store_description, username")
          .eq("username", username)
          .single();

        if (profileError || !profileData) {
          toast.error("Store not found.");
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", profileData.id)
          .order("created_at", { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (err) {
        console.error("Error loading store:", err);
        toast.error("Failed to load store data.");
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      loadStore();
    }
  }, [username]);

  const handleBuyNow = async (product: Product) => {
    setTrackingId(product.id);
    try {
      const res = await fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userId: profile?.id, // Track click for this store owner
        }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.open(data.redirectUrl, "_blank");
      } else {
        window.open(product.original_url, "_blank");
      }
    } catch (err) {
      window.open(product.original_url, "_blank");
    } finally {
      setTrackingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full animate-pulse" />
          <div className="relative animate-spin h-10 w-10 border-4 border-[#FF4D67] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Store Not Found</h1>
        <p className="text-slate-600 max-w-md mb-8">The store you are looking for might have moved or been deleted.</p>
        <Link href="/">
          <Button className="bg-[#FF4D67] hover:bg-[#E6395A] text-white rounded-full px-8">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans selection:bg-[#FF4D67]/20">
      {/* Mobile-First Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF4D67] to-[#FF8E9E] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF4D67]/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              {profile.store_name}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:bg-[#F0F2F5]">
              <Share2 size={20} />
            </Button>
            <div className="relative group">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200">
                <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-white mt-2">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#FF496E]/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 md:py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4D67]/10 text-[#FF4D67] text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={14} />
              Featured Store
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Welcome to <span className="text-[#FF4D67]">{profile.store_name}</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              {profile.store_description || "Discover our carefully curated selection of verified top-quality products just for you."}
            </p>
          </div>
          <div className="flex-1 w-full max-w-md">
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl shadow-black/5 border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#FF4D67]/10 to-[#FF4D67]/5 flex items-center justify-center">
                 <div className="flex flex-col items-center gap-3">
                   <div className="flex -space-x-4 mb-2">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-white shadow-md overflow-hidden ring-1 ring-slate-100">
                         <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-50" />
                       </div>
                     ))}
                   </div>
                   <p className="text-xs font-bold text-slate-500 text-center">Trusted by 10,000+ Shoppers</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar (Visual Only for Shopsy feel) */}
      <div className="bg-white border-y border-slate-100 sticky top-16 z-40 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 py-4 whitespace-nowrap">
          {['All Items', 'Best Sellers', 'New Arrivals', 'Offers', 'Trending'].map((cat, idx) => (
            <button 
              key={cat} 
              className={`text-sm font-bold uppercase tracking-wide transition-colors ${idx === 0 ? 'text-[#FF4D67] border-b-2 border-[#FF4D67] pb-1' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Product Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            Top Picks <Zap size={20} className="text-yellow-500 fill-yellow-500" />
          </h2>
          <div className="text-sm font-bold text-[#FF4D67] hover:underline cursor-pointer">View All</div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Inventory restocking soon...</h3>
            <p className="text-slate-300">Keep an eye on this space!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="group bg-white rounded-2xl border border-slate-100 hover:border-[#FF4D67]/30 transition-all duration-300 flex flex-col shadow-sm hover:shadow-xl hover:shadow-[#FF4D67]/5 overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] bg-[#F8F9FA] flex items-center justify-center overflow-hidden">
                   {product.image_url ? (
                     <Image
                       src={product.image_url}
                       alt={product.title}
                       fill
                       className="object-contain group-hover:scale-110 transition-transform duration-500 p-4"
                     />
                   ) : (
                     <Package className="w-12 h-12 text-slate-200" />
                   )}
                   
                   {/* Badge */}
                   <div className="absolute top-2 left-2 px-2 py-1 rounded bg-white/90 backdrop-blur shadow-sm text-[10px] font-black text-[#FF4D67] uppercase tracking-tighter z-10">
                     {product.platform} Verified
                   </div>

                   {/* Quick View Decorator */}
                   <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 leading-snug mb-3 min-h-[40px] group-hover:text-[#FF4D67] transition-colors duration-300">
                    {product.title}
                  </h3>
                  
                  <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price</span>
                        <div className="text-2xl font-black text-[#FF4D67] tracking-tight group-hover:scale-105 transition-transform origin-left duration-300">
                          {product.price || "Check Price"}
                        </div>
                      </div>
                      <div className="flex items-center text-[#24A3B5] text-[10px] font-black bg-[#24A3B5]/10 px-2.5 py-1.5 rounded-full border border-[#24A3B5]/20 animate-pulse-subtle">
                        <Tag size={10} className="mr-1" /> BEST OFFER
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full h-11 rounded-xl bg-[#FF4D67] hover:bg-[#E6395A] text-white shadow-lg shadow-[#FF4D67]/20 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest group/btn border-none transform active:scale-95 transition-all"
                      onClick={() => handleBuyNow(product)}
                      disabled={trackingId === product.id}
                    >
                      {trackingId === product.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Wait...</span>
                        </div>
                      ) : (
                        <>
                          <span>Grab Deal</span>
                          <ExternalLink size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Brands Strip */}
      <div className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-100 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
         <div className="text-xl font-black text-slate-400">AMAZON</div>
         <div className="text-xl font-black text-slate-400">FLIPKART</div>
         <div className="text-xl font-black text-slate-400">MEESHO</div>
         <div className="text-xl font-black text-slate-400">MYNTRA</div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-lg font-black text-slate-800 tracking-tight">{profile.store_name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
            Powered by <span className="text-[#A29BFE] font-black tracking-normal">Storix</span>
          </div>

          <Link href="/">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 border border-slate-200 hover:border-[#FF4D67]/30 hover:bg-[#FF4D67]/5 transition-all text-xs font-bold text-slate-600 group cursor-pointer">
              <Sparkles size={14} className="text-[#FF4D67] group-hover:rotate-12 transition-transform" />
              Build your own affiliate empire with Storix
              <ChevronRight size={14} />
            </div>
          </Link>
        </div>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function ChevronRight({ size = 16 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
