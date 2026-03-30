"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Check,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Crown,
  Zap,
  Star,
  Shield,
} from "lucide-react";
import { PLANS, type PlanId } from "@/lib/plans";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const plans: { id: PlanId; icon: React.ReactNode; accent: string; glow: string; popular?: boolean }[] = [
    {
      id: "free",
      icon: <Zap size={24} />,
      accent: "text-muted",
      glow: "",
    },
    {
      id: "pro",
      icon: <Sparkles size={24} />,
      accent: "text-primary",
      glow: "shadow-primary/10",
      popular: true,
    },
    {
      id: "business",
      icon: <Crown size={24} />,
      accent: "text-accent",
      glow: "shadow-accent/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#13131A] selection:bg-primary/30 selection:text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-[#3D3D5C]/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tighter">
              Storix
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E1E2E] border border-[#3D3D5C] mb-8 animate-fade-in">
            <Star size={14} className="text-accent fill-accent" />
            <span className="text-sm font-medium text-muted">Simple, transparent pricing</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white leading-[1.1]">
            Scale your affiliate{" "}
            <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
              empire
            </span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Start free, upgrade when you&apos;re ready. No hidden fees, no surprises. Cancel anytime.
          </p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-[#1E1E2E] border border-[#3D3D5C]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                !annual ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                annual ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:text-white"
              }`}
            >
              Annual
              <span className="text-[9px] font-black uppercase tracking-wider bg-success/20 text-success px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(({ id, icon, accent, glow, popular }) => {
            const plan = PLANS[id];
            const displayPrice = id === "free"
              ? "₹0"
              : annual
                ? `₹${Math.round((plan.price / 100) * 0.8)}`
                : `₹${plan.price / 100}`;

            return (
              <Card
                key={id}
                className={`relative glass overflow-hidden flex flex-col transition-all duration-500 hover-lift ${
                  popular
                    ? "border-primary/40 shadow-2xl " + glow
                    : "border-[#3D3D5C] " + glow
                }`}
              >
                {popular && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                )}

                <div className="p-8 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${accent === "text-primary" ? "bg-primary/10" : accent === "text-accent" ? "bg-accent/10" : "bg-surface-light"} flex items-center justify-center ${accent}`}>
                        {icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">{plan.name}</h3>
                        {plan.badge && (
                          <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${accent} bg-primary/10 px-2 py-0.5 rounded-full`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-white tracking-tight">
                        {displayPrice}
                      </span>
                      {id !== "free" && (
                        <span className="text-muted text-sm font-medium">/month</span>
                      )}
                    </div>
                    <p className="text-sm text-muted mt-2 leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                          accent === "text-primary" ? "bg-primary/10 text-primary" 
                          : accent === "text-accent" ? "bg-accent/10 text-accent"
                          : "bg-success/10 text-success"
                        }`}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span className="text-sm text-muted font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href={id === "free" ? "/signup" : "/signup?plan=" + id}>
                    <Button
                      className={`w-full h-14 rounded-2xl group text-base font-bold ${
                        popular
                          ? "shadow-xl shadow-primary/20"
                          : ""
                      }`}
                      variant={popular ? "primary" : "secondary"}
                    >
                      {id === "free" ? "Start Free" : `Get ${plan.name}`}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Trust */}
      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-8 flex-wrap text-muted/40">
            {[
              { icon: Shield, label: "Secure Payments" },
              { icon: Zap, label: "Instant Activation" },
              { icon: Star, label: "Cancel Anytime" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium">
                <Icon size={16} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#3D3D5C]/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted/50">
          <p>© 2026 Storix. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
