"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShoppingBag,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Globe,
  MousePointerClick,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import DotField from "@/components/ui/DotField";
import SpotlightCard from "@/components/ui/SpotlightCard";
import LightPillar from "@/components/ui/LightPillar";
import { PublicPricingSection } from "@/components/pricing/PublicPricingSection";

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
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-emerald-500/30 selection:text-[var(--foreground)] overflow-x-hidden relative">
      {/* ─── Global Background Layers ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* LightPillar (Base Layer) */}
        <div className="absolute inset-0 z-0 opacity-40">
          <LightPillar
            topColor="#10B981"
            bottomColor="#059669"
            intensity={0.8}
            rotationSpeed={0.2}
            glowAmount={0.003}
            pillarWidth={3.5}
            pillarHeight={0.3}
            noiseIntensity={0.4}
            pillarRotation={15}
            interactive={false}
            mixBlendMode="normal"
            quality="high"
          />
        </div>

        {/* DotField (Interactive Layer )*/}
        <div className="absolute inset-0 z-10 transition-opacity duration-1000">
          <DotField
            dotRadius={1.2}
            dotSpacing={20}
            passiveSpeed={1.2}
            gradientFrom="rgba(10, 255, 173, 0.17)"
            gradientTo="rgba(0, 206, 201, 0.05)"
          />
        </div>

        {/* Texture Overlay */}
        <div className="absolute inset-0 z-20 noise-subtle opacity-[0.03]" />
      </div>

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all duration-300">
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
                className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-200"
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
        <section className="relative pt-32 md:pt-44 pb-20 md:pb-36 px-4 sm:px-6 overflow-hidden">
          {/* Background overlay for structure - now interacting with DotField */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_75%)]" />


          <div className="max-w-7xl mx-auto text-center relative z-10">
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-12 shadow-2xl backdrop-blur-2xl"
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
              className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 mb-24 md:mb-40 relative z-20"
            >
              <Link href="/signup">
                <Button className="h-[4.5rem] px-12 md:px-16 rounded-3xl shadow-[0_20px_60px_rgba(16,185,129,0.3)] hover:shadow-[0_0_80px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all duration-500 font-bold text-lg">
                  <span className="flex items-center gap-3">
                    Get Started Free
                    <Sparkles size={20} className="animate-pulse" />
                  </span>
                </Button>
              </Link>

              <Link href="/store/demo">
                <Button variant="secondary" className="h-[4.5rem] px-10 md:px-14 rounded-3xl bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 font-bold text-lg">
                  View Demo Store
                  <ArrowUpRight size={20} className="ml-2 text-white/40" />
                </Button>
              </Link>
            </motion.div>

            {/* Browser Mockup */}
            <div className="relative max-w-6xl mx-auto mt-20">
              <ScrollReveal variant="zoom-in" delay={0.8}>
                <div className="relative group rounded-3xl border border-white/[0.1] bg-[#0A0A0E] shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent z-20" />

                  <div className="relative p-2 md:p-2 bg-gradient-to-b from-[#15151E] to-[#0A0A0A]">
                    {/* Browser Chrome */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-white/10" />
                        <div className="w-3 h-3 rounded-full bg-white/10" />
                        <div className="w-3 h-3 rounded-full bg-white/10" />
                      </div>
                      <div className="flex-1 max-w-xl mx-auto h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center px-4 gap-2">
                        <Globe size={12} className="text-white/20" />
                        <div className="h-1.5 w-1/2 bg-white/[0.1] rounded-full" />
                      </div>
                    </div>

                    <div className="aspect-[16/10] bg-[#050508] relative overflow-hidden flex flex-col">
                      {/* Animated Content */}
                      <div className="p-6 md:p-8 space-y-8 relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                          <div className="space-y-3">
                            <motion.div
                              initial={{ width: "40%" }}
                              animate={{ width: ["40%", "80%", "40%"] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                              className="h-8 w-48 bg-emerald-500/5 rounded-full border border-emerald-500/10 flex items-center px-3"
                            >
                              <div className="h-1.5 w-1/3 bg-emerald-400/30 rounded-full" />
                            </motion.div>
                            <div className="text-[10px] font-bold text-emerald-400/40 uppercase tracking-[0.2em]">
                              Scraping Amazon Data...
                            </div>
                          </div>
                          <Zap className="text-emerald-400/40" size={20} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-2 gap-4 flex-1 h-full min-h-[400px]">
                          {[
                            { title: "MacBook Pro M3 Max", price: "$3199.00", badge: "Laptop", image: "/demo/macbook.jpg", className: "col-span-2 md:col-span-2 row-span-2", imgClass: "scale-100 group-hover:scale-105" },
                            { title: "Sony WH-1000XM5", price: "$348.00", badge: "Audio", image: "/demo/headphones.jpg", className: "col-span-1 md:col-span-1 row-span-1", imgClass: "scale-90 group-hover:scale-100" },
                            { title: "DJI Osmo Pocket 3", price: "$519.00", badge: "Camera", image: "/demo/camera.jpg", className: "col-span-1 md:col-span-1 row-span-1", imgClass: "scale-90 group-hover:scale-100" }
                          ].map((item, i) => (
                            <motion.div
                              key={i}
                              className={`relative rounded-3xl bg-[#0A0A0E] border border-white/[0.05] flex flex-col overflow-hidden group shadow-xl hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-500 cursor-pointer ${item.className}`}
                            >
                              <div className="relative flex-1 overflow-hidden flex items-center justify-center bg-[#050508] border-b border-white/[0.05] p-6">
                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent z-0" />
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className={`object-contain w-full h-full mix-blend-screen transition-transform duration-700 ease-out relative z-10 ${item.imgClass}`} 
                                  style={{ filter: "invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.2)" }}
                                />
                                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 z-20 shadow-xl">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-white/90">{item.badge}</span>
                                </div>
                              </div>
                              <div className="relative z-20 flex flex-col justify-end bg-[#0A0A0E] p-4 md:p-5">
                                <h5 className="font-bold text-white text-sm md:text-base tracking-tight mb-1">{item.title}</h5>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs md:text-sm text-emerald-400 font-bold">{item.price}</div>
                                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                                    <ArrowUpRight size={14} className="text-white/40 group-hover:text-emerald-400 transition-colors" />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════ FEATURES ════ */}
        <section id="features" className="py-32 md:py-48 px-4 sm:px-6 relative">
          <div className="absolute inset-0 noise-subtle opacity-30 -z-10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-gradient-to-r from-violet-500/5 via-cyan-500/5 to-emerald-500/5 blur-[100px] -z-10" />

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
                  <SpotlightCard
                    className="h-full group !p-8 md:!p-10 border-white/[0.05] bg-white/[0.02] hover:border-emerald-500/30 transition-all duration-500"
                    spotlightColor="rgba(16, 185, 129, 0.12)"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 shadow-lg relative z-20`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-white group-hover:text-emerald-400 transition-colors duration-500 relative z-20">{feature.title}</h3>
                    <p className="text-white/40 text-base leading-relaxed font-medium relative z-20">{feature.desc}</p>
                  </SpotlightCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>



        {/* ═══════ HOW IT WORKS ═════ */}
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
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/5 mx-auto mb-10 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:shadow-[0_0_60px_rgba(16,185,129,0.3)] group-hover:border-emerald-500/30 transition-all duration-700 shadow-2xl relative backdrop-blur-sm">
                      <div className="absolute -top-2 -right-2 w-9 h-9 rounded-2xl bg-black border border-white/10 text-[11px] font-black text-white/40 flex items-center justify-center group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all shadow-xl">{step.num}</div>
                      <step.icon size={36} className="group-hover:rotate-12 transition-transform duration-700" />
                    </div>
                    <h4 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-emerald-400 transition-colors duration-500">{step.title}</h4>
                    <p className="text-white/30 font-medium leading-relaxed max-w-[240px] mx-auto">{step.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ PRICING ═══════ */}
        <section className="py-32 md:py-48 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
          <PublicPricingSection
            id="pricing"
            eyebrow="Strategic Investment"
            title="Pick Your Strategy"
            description="Scale your affiliate empire with precision. Choose the plan that fits your current mission parameters."
          />
        </section>
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="group py-24 md:py-32 px-8 border-t border-white/5 bg-[#030305] relative overflow-hidden">
        {/* Dynamic Background Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.03),transparent_50%)]" />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-20 relative z-10">
          <div className="space-y-10 max-w-md">
            <Link href="/" className="flex items-center gap-4 group/logo">
              <div className="w-14 h-14 rounded-[1.8rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover/logo:scale-110 transition-transform duration-500">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white tracking-tighter leading-none">Storix</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/50 mt-1">Affiliate Engine</span>
              </div>
            </Link>
            <p className="text-white/30 text-lg font-medium leading-relaxed">
              The world's most advanced affiliate terminal. <br className="hidden md:block" />
              Engineered for conversion, powered by AI protocols.
            </p>
            <div className="flex items-center gap-4">
              {['Twitter', 'Discord', 'GitHub'].map((social) => (
                <button key={social} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="w-1 h-1 rounded-full bg-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 lg:gap-24">
            <div className="space-y-8">
              <h6 className="text-[11px] font-black text-white uppercase tracking-[0.4em] opacity-20">Navigation</h6>
              <div className="flex flex-col gap-5 text-sm text-white/30 font-bold">
                <Link href="#features" className="hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group/link">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  Features
                </Link>
                <Link href="#how-it-works" className="hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group/link">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  Operations
                </Link>
                <Link href="#pricing" className="hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group/link">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  Pricing
                </Link>
              </div>
            </div>
            <div className="space-y-8">
              <h6 className="text-[11px] font-black text-white uppercase tracking-[0.4em] opacity-20">Legal</h6>
              <div className="flex flex-col gap-5 text-sm text-white/30 font-bold">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="hover:text-white transition-colors">Cookie Protocol</Link>
              </div>
            </div>
            <div className="space-y-8 col-span-2 sm:col-span-1">
              <h6 className="text-[11px] font-black text-white uppercase tracking-[0.4em] opacity-20">Status</h6>
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md">
                 <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    All Systems Nominal
                 </div>
                 <p className="text-[10px] text-white/30 font-bold leading-relaxed">
                   Global delivery network operating at peak efficiency.
                 </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">
            © 2026 STORIX CORE. ESTABLISHED 2024.
          </p>
          <div className="flex items-center gap-8 text-[10px] font-black text-white/20 uppercase tracking-widest">
             <span>Security Verified</span>
             <span>Encrypted Tunnel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
