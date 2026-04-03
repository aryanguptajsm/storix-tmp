"use client";

import React from "react";
import { 
  ShoppingBag, 
  ArrowRight, 
  Sparkles,
  Package,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreHeader } from "@/components/store/StoreHeader";
import { TrustSection } from "@/components/store/TrustSection";
import { Button } from "@/components/ui/Button";

interface Product {
  id: string;
  title: string;
  image_url: string;
  platform: string;
  price: string;
  original_price?: string;
  discount_percentage?: string;
  original_url: string;
}

interface Profile {
  store_name: string;
  store_description: string;
  username: string;
  id: string;
  theme: "default" | "midnight" | "minimalist" | "neon" | "amazon" | "flipkart";
}

interface StoreViewProps {
  profile: Profile;
  products: Product[];
}

export function StoreView({ profile, products }: StoreViewProps) {
  const handleBuyNow = (product: Product) => {

    // Open the product URL IMMEDIATELY — no waiting for the API
    window.open(product.original_url, "_blank");

    // Fire-and-forget: track the click in the background (non-blocking)
    fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        userId: profile?.id,
        redirectUrl: product.original_url,
      }),
    }).catch(() => {
      // Silently ignore tracking errors — redirect already happened
    });
  };

  return (
    <ThemeProvider initialTheme={profile.theme}>
      <div className="min-h-screen bg-[var(--store-background)] text-[var(--store-foreground)] font-sans selection:bg-[var(--store-primary)]/20 scroll-smooth">
      
      <StoreHeader storeName={profile.store_name} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 overflow-hidden bg-[var(--store-card)] border-b border-[var(--store-border)]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--store-primary)]/5 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--store-primary)]/10 rounded-full blur-[120px] animate-float pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 mb-6 md:mb-8 animate-fade-in shadow-xl">
            <Sparkles className="w-4 h-4 text-[var(--store-primary)]" />
            <span className="text-xs md:text-sm font-bold text-white/80 tracking-wide uppercase">Curated Collection</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 md:mb-8 leading-[1.1] animate-slide-up text-white">
            <span className="block">{profile.store_name}</span>
            <span className="text-gradient">Affiliate Hub</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-base md:text-xl text-white/60 mb-8 md:mb-12 animate-fade-in leading-relaxed px-4">
            {profile.store_description || "Welcome to my hand-picked collection of premium products. Browse through the best deals and essentials curated just for you."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link href="#products">
              <Button className="h-16 px-10 rounded-[2rem] bg-[var(--store-primary)] hover:bg-[var(--store-primary)]/90 text-white shadow-2xl shadow-[var(--store-primary)]/30 font-black text-xs uppercase tracking-[0.2em] gap-3 group">
                Start Shopping
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-[var(--store-card)] bg-slate-200 overflow-hidden shadow-sm">
                    <div className="w-full h-full bg-gradient-to-tr from-slate-300 to-slate-100" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] md:text-xs">Trusted by 5k+ shoppers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <div className="px-4 md:px-6">
        <TrustSection />
      </div>

      {/* Product Grid */}
      <section id="products" className="py-20 md:py-32 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-[var(--store-primary)] rounded-full" />
                <span className="text-[var(--store-primary)] font-black text-xs uppercase tracking-[0.3em]">Featured Gear</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Prime Selection</h2>
            </div>
            <p className="text-white/40 text-sm md:text-base max-w-sm md:text-right font-medium">
              Every item has been vetted for quality, performance, and value by our experts.
            </p>
          </div>
          
          <div className="flex items-center gap-6 pb-2 border-b border-[var(--store-border)] mb-12 overflow-x-auto no-scrollbar whitespace-nowrap">
             {['All Items', 'Best Sellers', 'New Arrivals'].map((tab, idx) => (
                <button key={tab} className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all pb-2 relative group ${idx === 0 ? 'text-[var(--store-primary)]' : 'text-muted hover:text-[var(--store-foreground)]'}`}>
                   {tab}
                   {idx === 0 && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--store-primary)]" />}
                </button>
             ))}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 md:py-32 bg-[var(--store-card)] rounded-[2rem] md:rounded-[4rem] border-4 border-dashed border-[var(--store-border)] animate-fade-in group">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-[var(--store-primary)]/5 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                <Package className="w-10 h-10 md:w-12 md:h-12 text-slate-300" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-4">Inventory Refueling...</h3>
              <p className="text-slate-500 text-base md:text-lg max-w-sm mx-auto font-medium px-4">Our latest discovery is currently being cataloged. Check back in a flash!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
              {products.map((product) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--store-card)] border-t border-[var(--store-border)] py-16 md:py-24 relative overflow-hidden group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[var(--store-primary)]/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center space-y-12">
          <div className="flex items-center gap-3 group/foot cursor-pointer">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center transition-all group-hover/foot:bg-[var(--store-primary)]">
               <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter leading-none">{profile.store_name}</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-muted opacity-40">The Future of Affiliate Commerce</span>
            <div className="flex items-center gap-3 text-muted font-bold text-xs uppercase tracking-widest mt-4">
              Curated with <span className="text-[var(--store-primary)] animate-pulse inline-block">❤️</span> via <span className="text-[var(--store-foreground)] font-black tracking-normal">Storix</span>
            </div>
          </div>

          <Link href="/">
            <div className="group relative">
               <div className="absolute inset-0 bg-[var(--store-primary)]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative inline-flex flex-col md:flex-row items-center gap-3 px-8 py-4 rounded-[2rem] bg-[var(--store-background)] border border-[var(--store-border)] hover:border-[var(--store-primary)]/40 hover:bg-[var(--store-primary)]/10 transition-all text-sm font-black text-muted-foreground group cursor-pointer shadow-sm">
                 <div className="flex items-center gap-3">
                   <Sparkles size={18} className="text-[var(--store-primary)] group-hover:rotate-12 transition-transform" />
                   Launch your own storefront with Storix
                 </div>
                 <ChevronRight size={18} className="hidden md:block group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </Link>

          <div className="pt-12 border-t border-[var(--store-border)] w-full flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted">© 2026 {profile.store_name} All Rights Reserved</span>
             <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest">
                <a href="#" className="hover:text-[var(--store-primary)] transition-colors">Privacy Ops</a>
                <a href="#" className="hover:text-[var(--store-primary)] transition-colors">Contact Base</a>
             </div>
          </div>
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
    </ThemeProvider>
  );
}
