"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShoppingBag,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Layout,
  TrendingUp,
  Globe,
  Shield,
  Star,
  MousePointerClick,
  CheckCircle2,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { TiltCard } from "@/components/ui/TiltCard";

export default function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: "Instant Scraping",
      desc: "Paste any Amazon or Flipkart link. We automatically pull HD images, pricing, and product data in seconds.",
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Titles",
      desc: "Gemini AI rewrites your product titles for higher click-through rates and better search visibility.",
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
    },
    {
      icon: TrendingUp,
      title: "Click Analytics",
      desc: "Track every click and conversion. See exactly which products perform best and optimize for revenue.",
      gradient: "from-cyan-500 to-blue-600",
      shadow: "shadow-cyan-500/20",
    },
  ];

  const steps = [
    { num: "01", title: "Paste a Link", desc: "Drop any Amazon or Flipkart product URL", icon: MousePointerClick },
    { num: "02", title: "AI Optimizes", desc: "Gemini generates the perfect title & tags", icon: Sparkles },
    { num: "03", title: "Publish & Earn", desc: "Share your store link and earn from every click", icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-emerald-500/30 selection:text-white overflow-x-hidden">

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all duration-300">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tighter font-display">
              Storix
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {["Features", "How it Works", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {item}
              </a>
            ))}
            <div className="w-px h-6 bg-white/10 mx-2" />
            <Link href="/login">
              <Button variant="ghost" className="text-white/60 hover:text-white">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="ml-1 px-8 shadow-2xl shadow-emerald-500/20">Get Started</Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white/60">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-4">Start</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ═══════ HERO ═══════ */}
        <section className="relative pt-36 md:pt-52 pb-24 md:pb-44 px-4 sm:px-6 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_70%)]" />
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 grid-bg-low-vis opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_60%)]" />
            <motion.div 
               animate={{ 
                 scale: [1, 1.15, 1],
                 opacity: [0.05, 0.1, 0.05],
               }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" 
            />
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
            {/* Status Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/[0.03] border border-white/10 mb-12 shadow-2xl backdrop-blur-2xl"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-white/50">Now in Beta — Free to Use</span>
            </motion.div>

            {/* Headline */}
            <div className="max-w-5xl mx-auto mb-10 md:mb-14">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="text-[clamp(2.5rem,10vw,7rem)] font-black tracking-[-0.06em] leading-[0.85]"
              >
                <span className="text-white block">Build Your</span>
                <span className="text-gradient block pb-4">Affiliate Store</span>
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.8, ease: "circOut" }}
                className="h-px w-32 md:w-64 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mt-6" 
              />
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              className="max-w-2xl mx-auto text-base md:text-xl text-white/40 mb-14 md:mb-20 leading-relaxed px-6 font-medium"
            >
              Paste affiliate links, let AI optimize your titles, and launch a beautiful storefront in minutes. Start earning from clicks — no coding required.
            </motion.p>

            {/* CTA Buttons */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 mb-24 md:mb-40"
             >
               <Link href="/signup">
                 <Button className="h-16 px-12 md:px-16 rounded-2xl shadow-[0_20px_60px_rgba(16,185,129,0.3)]">
                   <span className="flex items-center gap-3">
                     Get Started Free
                     <ArrowRight size={20} />
                   </span>
                 </Button>
               </Link>

               <Link href="/store/demo">
                 <Button variant="secondary" className="h-16 px-10 md:px-14 rounded-2xl bg-white/[0.04] border-white/10">
                   View Demo Store
                   <ArrowUpRight size={18} className="ml-2 opacity-40" />
                 </Button>
               </Link>
             </motion.div>

            {/* Browser Mockup */}
            <div className="relative max-w-6xl mx-auto mt-20">
              <ScrollReveal variant="zoom-in" delay={0.8}>
                <TiltCard intensity={3} perspective={3000} className="relative group">
                  <div className="absolute -inset-20 bg-emerald-500/10 blur-[120px] rounded-full -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent z-20" />
                  
                  <div className="relative rounded-[3rem] p-3 md:p-4 bg-gradient-to-b from-[#15151E] to-[#0A0A0A] border border-white/[0.08] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
                    {/* Browser Chrome */}
                    <div className="flex items-center gap-3 px-8 py-5 border-b border-white/[0.04] bg-white/[0.01]">
                       <div className="flex gap-2.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-red-500/40" />
                          <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/40" />
                          <div className="w-3.5 h-3.5 rounded-full bg-green-500/40" />
                       </div>
                       <div className="flex-1 max-w-2xl mx-auto h-10 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center px-6 gap-3">
                          <Globe size={14} className="text-white/20" />
                          <div className="h-2 w-3/4 bg-white/[0.1] rounded-full" />
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10" />
                       </div>
                    </div>

                    <div className="aspect-[16/10] bg-[#050508] relative overflow-hidden flex flex-col">
                       <div className="p-8 md:p-12 space-y-10">
                          <div className="flex items-center justify-between">
                             <div className="space-y-2">
                                <div className="h-5 w-40 bg-white/[0.08] rounded-lg" />
                                <div className="h-3 w-56 bg-white/[0.04] rounded-lg" />
                             </div>
                             <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 shadow-2xl flex items-center justify-center">
                                <CheckCircle2 className="text-emerald-400" size={24} />
                             </div>
                          </div>

                          <div className="grid grid-cols-3 gap-6">
                             {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-[4/5] rounded-[2rem] bg-white/[0.03] border border-white/[0.06] p-6 space-y-4">
                                   <div className={`w-full aspect-square rounded-2xl ${i % 2 === 0 ? 'bg-emerald-500/15' : 'bg-cyan-500/15'}`} />
                                   <div className="space-y-2">
                                      <div className="h-3 w-full bg-white/[0.08] rounded-full" />
                                      <div className="h-3 w-2/3 bg-white/[0.04] rounded-full" />
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════ FEATURES ═══════ */}
        <section id="features" className="py-32 md:py-48 px-4 sm:px-6 relative">
          <div className="absolute inset-0 dot-grid opacity-30 -z-10" />

          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 md:mb-32">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/[0.02] border border-white/10 mb-8 backdrop-blur-xl">
                 <Sparkles size={16} className="text-emerald-400" />
                 <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Powerful Features</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black mb-8 text-white tracking-tighter leading-[0.9]">
                 Everything You Need<br />to Start Earning
              </h2>
              <p className="text-white/40 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
                From scraping product data to AI-optimized titles and real-time analytics — Storix handles the heavy lifting so you can focus on growing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {features.map((feature, i) => (
                <ScrollReveal key={i} delay={i * 0.1} variant="zoom-in">
                  <TiltCard intensity={8} className="h-full">
                    <div className="group h-full relative rounded-[2.5rem] border border-white/[0.08] bg-white/[0.01] p-10 md:p-12 hover:border-emerald-500/20 transition-all duration-700 overflow-hidden backdrop-blur-3xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-2xl`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-black mb-5 text-white group-hover:text-emerald-400 transition-colors duration-500">{feature.title}</h3>
                      <p className="text-white/40 text-lg leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section id="how-it-works" className="py-24 md:py-40 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 md:mb-32">
              <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tighter">How It Works</h2>
              <p className="text-white/40 text-xl font-medium max-w-xl mx-auto">From link to live store in under 3 minutes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              {steps.map((step, i) => (
                <ScrollReveal key={i} delay={i * 200}>
                  <div className="text-center group">
                     <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] border border-white/5 mx-auto mb-10 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:shadow-[0_0_50px_rgba(16,185,129,0.1)] transition-all duration-700 shadow-2xl relative">
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-black border border-white/10 text-[11px] font-black text-white/40 flex items-center justify-center group-hover:text-emerald-500 transition-colors">{step.num}</div>
                        <step.icon size={36} className="group-hover:rotate-12 transition-transform duration-700" />
                     </div>
                     <h4 className="text-2xl font-black text-white mb-4 tracking-tight">{step.title}</h4>
                     <p className="text-white/30 font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="py-24 md:py-32 px-8 border-t border-white/[0.04] bg-black relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-20 relative z-10">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter">Storix</span>
            </div>
            <p className="text-white/30 text-lg max-w-sm font-medium leading-relaxed">
              The easiest way to build and manage your affiliate storefront. Powered by AI.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24">
             <div className="space-y-6">
                <h6 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Product</h6>
                <div className="flex flex-col gap-4 text-sm text-white/30 font-medium">
                   <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                   <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                   <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                </div>
             </div>
             <div className="space-y-6">
                <h6 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Legal</h6>
                <div className="flex flex-col gap-4 text-sm text-white/30 font-medium">
                   <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                   <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                </div>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-white/20 relative z-10">
          <p>© 2026 Storix. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-white/15">
             <span>Powered by Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
