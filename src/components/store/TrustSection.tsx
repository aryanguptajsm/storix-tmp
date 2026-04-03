"use client";

import React from "react";
import { Zap, ShieldCheck, TrendingUp, Clock, Award } from "lucide-react";

export function TrustSection() {
  const items = [
    {
      icon: Zap,
      title: "Lightning Fast",
      desc: "Fastest checkout via verified affiliate links.",
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
    },
    {
      icon: ShieldCheck,
      title: "Verified Sources",
      desc: "Every listing inspected for quality & reliability.",
      gradient: "from-emerald-500 to-green-600",
      shadow: "shadow-emerald-500/20",
    },
    {
      icon: TrendingUp,
      title: "Best Prices",
      desc: "We scan for the lowest prices across platforms.",
      gradient: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/20",
    },
    {
      icon: Clock,
      title: "Fresh Inventory",
      desc: "Catalog updated daily with latest trends & deals.",
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
    },
  ];

  return (
    <section className="bg-[var(--store-card)] border-y border-[var(--store-border)] relative overflow-hidden py-16 md:py-24">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[var(--store-primary)]/[0.03] rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[var(--store-primary)]/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-morphism-premium text-[var(--store-primary)] text-[10px] font-bold uppercase tracking-[0.2em]">
            <Award size={12} className="animate-bounce-subtle" />
            Premium Experience
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight">
            Why Shop at <span className="text-[var(--store-primary)]">Storix</span> Stores?
          </h2>
          <p className="text-[var(--store-foreground)]/30 text-sm md:text-base max-w-xl mx-auto font-medium">
            A curated layer of trust and intelligence on top of your favorite platforms.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-4 md:gap-5 p-5 md:p-7 rounded-2xl md:rounded-3xl bg-[var(--store-background)] border border-[var(--store-border)] hover:border-[var(--store-primary)]/20 transition-all duration-500 group hover-lift"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg ${item.shadow}`}>
                <item.icon size={24} strokeWidth={2.5} className="text-white md:w-7 md:h-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm md:text-base tracking-tight">{item.title}</h4>
                <p className="text-[10px] md:text-xs font-medium text-[var(--store-foreground)]/30 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 md:mt-16 flex flex-wrap justify-center gap-8 md:gap-12 border-t border-[var(--store-border)] pt-10 md:pt-14">
          {[
            { label: "Brands", value: "250+" },
            { label: "Monthly Clicks", value: "1.2M" },
            { label: "Active Stores", value: "45k+" },
            { label: "Trust Score", value: "99.9%" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 group">
              <span className="text-2xl md:text-3xl font-black text-[var(--store-foreground)] group-hover:text-[var(--store-primary)] transition-colors">{stat.value}</span>
              <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--store-foreground)]/25">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
