"use client";
import React from "react";
import {
  ShoppingBag,
  Package,
  ArrowUp,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreHeader } from "@/components/store/StoreHeader";
import { EmailCaptureWidget } from "@/components/store/EmailCaptureWidget";
import { PoweredByBadge } from "@/components/store/PoweredByBadge";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { Button } from "@/components/ui/Button";
import { Product } from "@/lib/types";
import type { Theme } from "@/components/ThemeProvider";
import {
  hasPlanFeature,
  isPaidPlan,
  isPremiumTheme,
  normalizePlanId,
} from "@/lib/plans";

interface Profile {
  store_name: string;
  store_description?: string | null;
  username: string;
  id: string;
  theme?: string | null;
  store_logo?: string | null;
  plan?: string | null;
}

interface StoreViewProps {
  profile: Profile;
  products: Product[];
}

export function StoreView({ profile, products }: StoreViewProps) {
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("All Items");
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBuyNow = (product: Product) => {
    window.open(product.original_url, "_blank");
    fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        userId: profile?.id,
        redirectUrl: product.original_url,
      }),
    }).catch(() => {});
  };

  const plan = normalizePlanId(profile.plan);
  const isPro = isPaidPlan(plan);
  const finalTheme = !isPro && isPremiumTheme(profile.theme || "default") ? "default" : (profile.theme || "default");
  const canShowEmailCapture = hasPlanFeature(plan, "emailCapture");
  const canShowWhatsApp = hasPlanFeature(plan, "whatsappSync");
  const canRemoveBranding = hasPlanFeature(plan, "removeBranding");
  const storeUrl = typeof window === "undefined" ? "" : window.location.href;

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const searchMatch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.platform?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const tabMatch = activeTab === "All Items" || 
                    (activeTab === "Best Sellers" && p.discount_percentage) || 
                    (activeTab === "New Arrivals");
    return searchMatch && tabMatch;
  });

  return (
    <ThemeProvider initialTheme={finalTheme as Theme}>
      <div className="min-h-screen bg-[var(--store-background)] text-[var(--store-foreground)] font-sans selection:bg-[var(--store-primary)]/30 selection:text-white scroll-smooth overflow-x-hidden">
        
        <StoreHeader 
          storeName={profile.store_name} 
          storeLogo={profile.store_logo} 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="pt-28 md:pt-36">
          {/* ─── Retail Banner Section ─── */}
          <section className="px-3 md:px-8 mb-8 md:mb-12">
            <div className="max-w-[1400px] mx-auto">
               <div className="relative h-[260px] sm:h-[300px] md:h-[450px] rounded-xl md:rounded-2xl overflow-hidden bg-[#0A0A0E] border border-white/10 group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                  <div className="absolute inset-0 mesh-layered opacity-30" />
                  
                  {/* Banner Content */}
                  <div className="relative z-20 h-full flex flex-col justify-center px-6 sm:px-10 md:px-16 max-w-2xl">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-[var(--store-primary)] text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] px-3 py-1 rounded-sm w-fit mb-4"
                    >
                      Featured Collection
                    </motion.div>
                    <motion.h1 
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl sm:text-4xl md:text-7xl font-black text-white tracking-tighter mb-3 md:mb-6 leading-[0.95]"
                    >
                      Premier <br className="sm:hidden" />Selection.
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ delay: 0.2 }}
                      className="text-xs md:text-lg text-white mb-6 md:mb-10 font-medium"
                    >
                      {profile.store_description || "Premium products curated for quality and price."}
                    </motion.p>
                    <Link href="#products">
                      <Button className="h-10 md:h-12 px-8 rounded-sm bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-white/90">
                        Shop Now
                      </Button>
                    </Link>
                  </div>

                  {/* Visual Element */}
                  <div className="absolute top-0 right-0 w-1/2 h-full hidden md:block">
                     <div className="absolute inset-0 bg-gradient-to-l from-black to-transparent z-10" />
                     <div className="absolute bottom-0 right-10 w-64 h-64 bg-[var(--store-primary)]/20 rounded-full blur-[100px]" />
                     <ShoppingBag size={300} className="absolute top-1/2 right-10 -translate-y-1/2 text-white/[0.03] rotate-12" />
                  </div>
               </div>
            </div>
          </section>

          {/* ─── Main Content Grid ─── */}
          <section id="products" className="px-3 md:px-8 pb-32">
            <div className="max-w-[1400px] mx-auto flex flex-col lg:grid lg:grid-cols-[240px_1fr] gap-6 md:gap-8">
              
              {/* Sidebar Filters */}
              <aside className="hidden lg:flex flex-col gap-8 sticky top-36 h-fit">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Categories</h4>
                  <div className="flex flex-col gap-4">
                    {['All Items', 'Best Sellers', 'New Arrivals'].map((tab) => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`text-xs font-bold text-left transition-colors ${
                          activeTab === tab ? 'text-[var(--store-primary)]' : 'text-white/40 hover:text-white'
                        }`}
                      >
                        {tab}
                        {activeTab === tab && <motion.div layoutId="activeTabDesktop" className="h-0.5 w-4 bg-[var(--store-primary)] mt-1 rounded-full" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Platforms</h4>
                  <div className="flex flex-col gap-4">
                    {['Amazon', 'Flipkart', 'AliExpress'].map((plat) => (
                      <label key={plat} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 rounded-sm border border-white/10 group-hover:border-[var(--store-primary)]/40 transition-colors" />
                        <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">{plat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-6 rounded-lg bg-[var(--store-primary)]/5 border border-[var(--store-primary)]/10">
                   <ShieldCheck className="text-[var(--store-primary)] mb-3" size={20} />
                   <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1.5">Secure Shop</h5>
                   <p className="text-[9px] text-white/40 leading-relaxed font-medium">All links are verified and scanned for safety protocols.</p>
                </div>
              </aside>

              {/* Product Grid Area */}
              <div className="flex-1">
                {/* Mobile Tab Scroller */}
                <div className="flex lg:hidden items-center gap-4 overflow-x-auto no-scrollbar pb-6 mb-8 border-b border-white/5 scroll-smooth snap-x">
                  {['All Items', 'Best Sellers', 'New Arrivals'].map((tab) => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)}
                      className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap px-6 py-2.5 rounded-full border transition-all snap-center ${
                        activeTab === tab 
                          ? 'bg-[var(--store-primary)] border-[var(--store-primary)] text-white shadow-lg shadow-primary/20' 
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-32 rounded-lg border-2 border-dashed border-white/5">
                    <Package className="w-12 h-12 text-white/10 mx-auto mb-6" />
                    <h3 className="text-2xl font-black mb-2 tracking-tight">No match found</h3>
                    <p className="text-white/30 text-sm font-medium">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <motion.div layout className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onBuyNow={handleBuyNow}
                          priority={index < 8}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        </main>

        {canShowEmailCapture && (
          <section className="px-3 md:px-8 pb-12">
            <div className="max-w-[1400px] mx-auto">
              <EmailCaptureWidget storeOwnerId={profile.id} variant="inline" />
            </div>
          </section>
        )}

        {/* Back to Top Feature */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-[100] w-12 h-12 rounded-md bg-white text-black shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ─── Compact Retail Footer ─── */}
        <footer className="bg-black border-t border-white/5 py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-[var(--store-primary)]" />
                  <span className="text-xl font-black tracking-tighter text-white">{profile.store_name}</span>
                </div>
                <p className="text-white/30 text-xs leading-relaxed font-medium">
                  Professional affiliate storefront powered by Storix AI protocols.
                </p>
              </div>
              <div>
                <h6 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Store</h6>
                <div className="flex flex-col gap-4 text-xs font-bold text-white/40">
                   <Link href="#products" className="hover:text-white transition-colors">All Products</Link>
                   <Link href="#products" className="hover:text-white transition-colors">Daily Deals</Link>
                   <Link href="#products" className="hover:text-white transition-colors">Platform Specials</Link>
                </div>
              </div>
              <div>
                <h6 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Security</h6>
                <div className="flex flex-col gap-4 text-xs font-bold text-white/40">
                   <span className="flex items-center gap-2"><ShieldCheck size={12} className="text-emerald-500" /> Link Protocol</span>
                   <span className="flex items-center gap-2"><Zap size={12} className="text-amber-500" /> Fast Sync</span>
                </div>
              </div>
              <div className="p-6 rounded-lg bg-white/[0.02] border border-white/5">
                <h6 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">Join Storix</h6>
                <Link href="/">
                   <Button size="sm" className="w-full h-9 rounded-sm bg-white text-black font-black text-[9px] uppercase tracking-widest">Create Store</Button>
                </Link>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold text-white/10 uppercase tracking-[0.4em]">
              <p>© 2026 {profile.store_name} Store</p>
              {!canRemoveBranding && (
                <p className="hover:text-white transition-colors cursor-pointer">Powered by Storix</p>
              )}
            </div>
          </div>
        </footer>

        {canShowWhatsApp && (
          <WhatsAppButton storeName={profile.store_name} storeUrl={storeUrl} />
        )}
        {!canRemoveBranding && <PoweredByBadge />}
      </div>
    </ThemeProvider>
  );
}
