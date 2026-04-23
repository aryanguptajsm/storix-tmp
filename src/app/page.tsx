"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Check,
  Crown,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import DotField from "@/components/ui/DotField";
import SpotlightCard from "@/components/ui/SpotlightCard";
import LightPillar from "@/components/ui/LightPillar";
import { PLANS, type PlanId } from "@/lib/plans";

export default function LandingPage() {
  const [annual, setAnnual] = React.useState(false);
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
    <div className="flex flex-col min-h-screen bg-black selection:bg-emerald-500/30 selection:text-white overflow-x-hidden relative">
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

        {/* DotField (Interactive Layer) */}
        <div className="absolute inset-0 z-10 transition-opacity duration-1000">
          <DotField
            dotRadius={1.2}
            dotSpacing={20}
            passiveSpeed={1.2}
            gradientFrom="rgba(16, 185, 129, 0.25)"
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

                        <div className="grid grid-cols-3 gap-4 flex-1">
                          {[
                            { title: "Sony WH-1000XM5", price: "$348.00", badge: "Audio" },
                            { title: "MacBook Pro M3 Max", price: "$3199.00", badge: "Laptop" },
                            { title: "Dyson V15 Detect", price: "$749.99", badge: "Home" }
                          ].map((item, i) => (
                            <motion.div
                              key={i}
                              className="relative rounded-3xl bg-white/[0.01] border border-white/[0.05] flex flex-col overflow-hidden group shadow-xl"
                            >
                              <div className={`flex-1 w-full bg-gradient-to-br ${i === 0 ? 'from-purple-500/5' : i === 1 ? 'from-blue-500/5' : 'from-orange-500/5'} to-transparent relative`} />
                              <div className="relative z-20 space-y-3 bg-[#0A0A0E] p-4">
                                <h5 className="font-bold text-white text-sm tracking-tight">{item.title}</h5>
                                <div className="flex items-center justify-between">
                                  <div className="text-[10px] text-emerald-400 font-bold">{item.price}</div>
                                  <ArrowUpRight size={12} className="text-white/20" />
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

        {/* ═══════ FEATURES ═══════ */}
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

        {/* ═══════ PRICING ═══════ */}
        <section id="pricing" className="py-32 md:py-48 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <ScrollReveal variant="fade-up">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/[0.02] border border-white/10 mb-8 backdrop-blur-xl">
                  <Crown size={16} className="text-emerald-400" />
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Strategic Investment</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-8 text-white tracking-tighter leading-[0.9]">
                  Pick Your Strategy
                </h2>
                <p className="text-white/40 text-xl font-medium max-w-2xl mx-auto mb-12">
                  Scale your affiliate empire with precision. Choose the plan that fits your current mission parameters.
                </p>

                {/* Billing Toggle */}
                <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl mb-16">
                  <button
                    onClick={() => setAnnual(false)}
                    className={`px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${!annual
                      ? "bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.4)] scale-100"
                      : "text-white/30 hover:text-white scale-95 hover:scale-100"
                      }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setAnnual(true)}
                    className={`px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${annual
                      ? "bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.4)] scale-100"
                      : "text-white/30 hover:text-white scale-95 hover:scale-100"
                      }`}
                  >
                    Annually
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${annual ? "bg-black/20 text-white" : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                      Save 20%
                    </span>
                  </button>
                </div>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {(['free', 'pro', 'business'] as PlanId[]).map((id, i) => {
                const plan = PLANS[id];
                const displayPrice = id === "free" ? 0 : annual ? (plan.price * 0.8) / 100 : plan.price / 100;
                const isPro = id === 'pro';

                return (
                  <ScrollReveal key={id} delay={i * 150} variant="zoom-in">
                    <SpotlightCard
                      className={`h-full flex flex-col group !p-10 border-white/[0.05] bg-white/[0.01] hover:border-emerald-500/30 transition-all duration-700 relative overflow-hidden ${isPro ? 'ring-2 ring-emerald-500/50 shadow-[0_0_80px_rgba(16,185,129,0.15)] bg-emerald-500/[0.02]' : ''
                        }`}
                      spotlightColor={isPro ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)"}
                    >
                      {isPro && (
                        <div className="absolute top-6 right-8 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-xl">
                          Recommended
                        </div>
                      )}

                      <div className="mb-10">
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors duration-500">
                          {plan.name}
                        </h3>
                        <p className="text-white/30 text-sm font-medium leading-relaxed max-w-[200px]">
                          {plan.description}
                        </p>
                      </div>

                      <div className="mb-10">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                            {plan.symbol}{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-white/30 font-bold text-sm">/mo</span>
                        </div>
                        {annual && id !== 'free' && (
                          <div className="mt-3 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/5 inline-block px-3 py-1.5 rounded-xl border border-emerald-500/10">
                            {plan.symbol}{(displayPrice * 12).toLocaleString()} billed annually
                          </div>
                        )}
                      </div>

                      <div className="space-y-5 mb-12 flex-1">
                        {plan.features.slice(0, 6).map((feature, j) => (
                          <div key={j} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <Check size={10} strokeWidth={4} />
                            </div>
                            <span className="text-white/40 text-sm font-medium tracking-tight group-hover:text-white/60 transition-colors">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Link href={id === 'free' ? '/signup' : `/pricing`} className="w-full">
                        <Button
                          variant={isPro ? 'primary' : 'secondary'}
                          className={`w-full h-18 rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] transition-all duration-500 ${isPro ? 'shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:shadow-emerald-500/50' : 'bg-white/5 border-white/5 hover:bg-white hover:text-black'
                            }`}
                        >
                          Select Protocol
                          <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </SpotlightCard>
                  </ScrollReveal>
                );
              })}
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
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="py-24 md:py-32 px-8 border-t border-white/[0.04] bg-black relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-20 relative z-10">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[1.5rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter">Storix</span>
            </div>
            <p className="text-white/30 text-lg max-w-sm font-medium leading-relaxed">
              The easiest way to build and manage your affiliate storefront. Powered by AI and optimized for conversion.
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
