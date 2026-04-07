"use client";
import React from "react";
import {
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Package,
  ArrowUp,
  Search,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreHeader } from "@/components/store/StoreHeader";
import { TrustSection } from "@/components/store/TrustSection";
import { Button } from "@/components/ui/Button";
import { Product } from "@/lib/types";

interface Profile {
  store_name: string;
  store_description: string;
  username: string;
  id: string;
  theme: "default" | "midnight" | "minimalist" | "neon" | "amazon" | "flipkart";
  store_logo?: string | null;
}

interface StoreViewProps {
  profile: Profile;
  products: Product[];
}

export function StoreView({ profile, products }: StoreViewProps) {
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("All Items");

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

  const isPro = profile.plan && profile.plan !== "free";
  const finalTheme = !isPro && isPremiumTheme(profile.theme) ? "default" : profile.theme;

  return (
    <ThemeProvider initialTheme={finalTheme}>
      <div className="min-h-screen bg-[var(--store-background)] text-[var(--store-foreground)] font-sans selection:bg-[var(--store-primary)]/30 selection:text-white scroll-smooth overflow-x-hidden">
        
        <StoreHeader storeName={profile.store_name} storeLogo={profile.store_logo} />

        {/* ─── Hero Section ─── */}
        <section className="relative pt-32 md:pt-48 pb-20 md:pb-36 px-4 md:px-8 overflow-hidden">
          {/* Advanced Background Engineering */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 mesh-layered opacity-20" />
            <div className="absolute inset-0 dot-grid opacity-[0.15]" />
            <div className="scan-line opacity-10" />
            
            {/* Dynamic Ambient Orbs */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[var(--store-primary)]/15 rounded-full blur-[140px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.05, 0.15, 0.05],
                x: [0, -40, 0],
                y: [0, 60, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px]" 
            />
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10 mb-10 shadow-2xl relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--store-primary)]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-[var(--store-primary)] animate-glow-pulse" />
                  <div className="absolute inset-0 blur-md bg-[var(--store-primary)]/60 animate-pulse" />
                </div>
                <span className="text-[10px] md:text-xs font-black text-white/80 tracking-[0.4em] uppercase">Intelligence Node Online</span>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="flex flex-col items-center gap-4 mb-8 md:mb-14 px-4"
            >
              <span className="text-[clamp(2.5rem,12vw,7.5rem)] font-black tracking-[-0.07em] leading-[0.85] text-white text-shadow-glow break-words max-w-full">
                {profile.store_name}
              </span>
              <div className="flex items-center gap-4 overflow-hidden w-full justify-center">
                <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[var(--store-primary)]/40" />
                <span className="text-[clamp(0.75rem,2.5vw,1.5rem)] font-black tracking-[0.3em] uppercase text-gradient-premium whitespace-nowrap px-2">
                  Elite Collection
                </span>
                <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[var(--store-primary)]/40" />
              </div>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="max-w-2xl mx-auto text-base md:text-2xl text-white/50 mb-10 md:mb-20 leading-relaxed px-6 font-medium balance"
            >
              {profile.store_description || "Precision-curated inventory. Accessed via high-fidelity affiliate signals."}
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
               className="flex flex-col items-center justify-center gap-6 md:gap-12 px-4"
            >
              <Link href="#products" className="w-full sm:w-auto">
                <Button className="h-16 md:h-20 w-full sm:w-auto px-10 md:px-20 rounded-2xl md:rounded-full bg-[var(--store-primary)] hover:bg-[var(--store-primary)]/90 text-white shadow-[0_20px_50px_rgba(var(--store-primary-rgb),0.4)] font-black text-xs md:text-sm uppercase tracking-[0.3em] gap-4 group relative overflow-hidden transition-all duration-500">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1]" />
                  <span className="relative z-10 flex items-center gap-4">
                    Initialize Access
                    <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-500" />
                  </span>
                </Button>
              </Link>

              <div className="flex items-center gap-6 py-3 px-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="w-12 h-12 rounded-full border-2 border-[var(--store-background)] bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-[10px] font-black text-white/40 shadow-xl"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]" />
                    <span className="text-[11px] font-black text-white tracking-[0.1em] uppercase">Active Fleets</span>
                  </div>
                  <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest whitespace-nowrap">Integrated across 140+ Nodes</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust Section with Reveal */}
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
        >
          <TrustSection />
        </motion.div>

        {/* ─── Product Grid Section ─── */}
        <section id="products" className="py-24 md:py-40 px-6 sm:px-12 relative bg-[var(--store-background)]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <div className="h-1 w-12 bg-gradient-to-r from-[var(--store-primary)] to-transparent rounded-full" />
                  <span className="text-[var(--store-primary)] font-black text-[11px] uppercase tracking-[0.4em]">Core Inventory</span>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-6xl font-black text-white tracking-tighter"
                >
                  Signal Strength: <span className="text-white/30">100%</span>
                </motion.h2>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.4 }}
                viewport={{ once: true }}
                className="text-white/40 text-lg max-w-sm md:text-right font-medium leading-relaxed"
              >
                High-fidelity products sourced through deep-link intelligence and verified by Storix systems.
              </motion.p>
            </div>

            {/* Category Filter Tabs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-6 md:gap-10 pb-4 border-b border-white/5 mb-16 overflow-x-auto no-scrollbar whitespace-nowrap"
            >
              {['All Items', 'Top Tier', 'Recent Deployments'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`text-[11px] font-black uppercase tracking-[0.25em] transition-all relative py-2 ${
                    activeTab === tab ? 'text-[var(--store-primary)]' : 'text-white/20 hover:text-white/50'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 w-full h-[3px] bg-[var(--store-primary)] rounded-full shadow-[0_0_15px_rgba(var(--store-primary-rgb),0.5)]" 
                    />
                  )}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              {products.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-32 md:py-48 bg-white/[0.01] rounded-[4rem] border-2 border-dashed border-white/5 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[var(--store-primary)]/[0.03] to-transparent pointer-events-none" />
                  <div className="w-24 h-24 bg-white/[0.02] rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-white/5 group-hover:scale-110 group-hover:border-[var(--store-primary)]/20 transition-all duration-700">
                    <Package className="w-12 h-12 text-white/20 group-hover:text-[var(--store-primary)]/40 transition-colors" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Deployment Pending</h3>
                  <p className="text-white/30 text-lg max-w-md mx-auto font-medium px-8 leading-relaxed">
                    Fleet command is currently verifying new supply chains. Return soon for the latest drops.
                  </p>
                  <div className="mt-12 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    <Search size={14} className="animate-pulse" />
                    Scanning Universal Grid...
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="grid"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                  className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10"
                >
                  {products.map((product, index) => (
                    <motion.div 
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                      }}
                    >
                      <ProductCard
                        product={product}
                        onBuyNow={handleBuyNow}
                        priority={index < 4}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Back to Top Feature */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-10 right-10 z-[100] w-16 h-16 rounded-[2rem] bg-white text-black shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-2 active:scale-95 group"
            >
              <ArrowUp className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ─── Advanced Footer ─── */}
        <footer className="bg-black border-t border-white/5 pt-24 pb-12 md:pt-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--store-primary)]/20 to-transparent" />
          <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--store-primary)]/5 rounded-full blur-[120px]" />

          <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-16 relative z-10">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="p-5 bg-white/[0.03] rounded-3xl border border-white/10 hover:border-[var(--store-primary)]/30 transition-all group cursor-pointer shadow-2xl shadow-primary/5">
                <ShoppingBag className="w-10 h-10 text-[var(--store-primary)] group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-3xl font-black tracking-tighter text-white">{profile.store_name}</h4>
              <p className="text-white/30 text-sm max-w-sm text-center font-medium leading-loose">
                An autonomous storefront deployment powered by the Storix Intelligence Core.
              </p>
              
              {/* Pro Feature: Branding Gating */}
              {!isPro && (
                <div className="flex flex-col items-center gap-3 py-6 px-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 mt-4">
                   <div className="flex items-center gap-2">
                      <Sparkles className="text-primary w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Powered by Storix</span>
                   </div>
                   <Link href="/">
                      <Button variant="ghost" size="sm" className="h-8 px-4 rounded-full text-[9px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5">Launch your own station</Button>
                   </Link>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <ShieldCheck size={14} className="text-emerald-500/50" />
                Signal Verified
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <Zap size={14} className="text-amber-500/50" />
                Instant Sync
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <Sparkles size={14} className="text-primary/50" />
                Elite Deployment
              </div>
            </div>

            <Link href="/" className="group">
              <div className="relative inline-flex items-center gap-4 px-8 py-4 rounded-3xl bg-white/[0.03] border border-white/10 group-hover:border-[var(--store-primary)]/40 transition-all text-xs font-black text-white group-hover:bg-[var(--store-primary)]/5">
                <Sparkles size={18} className="text-[var(--store-primary)]" />
                Launch your own Fleet Command
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <div className="w-full pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-bold text-white/15 uppercase tracking-[0.4em]">
              <span>© 2026 {profile.store_name} Core</span>
              <div className="flex items-center gap-10">
                <a href="#" className="hover:text-primary transition-colors">Protocol</a>
                <a href="#" className="hover:text-primary transition-colors">Manifest</a>
                <a href="#" className="hover:text-primary transition-colors">Uplink</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
