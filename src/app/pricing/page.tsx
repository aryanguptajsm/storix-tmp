"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PLANS, type PlanId } from "@/lib/plans";
import {
  Check,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Crown,
  Zap,
  Star,
  Shield,
  Loader2,
} from "lucide-react";
import DotField from "@/components/ui/DotField";
import LightPillar from "@/components/ui/LightPillar";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  const handleCheckout = async (planId: PlanId) => {
    const plan = PLANS[planId];
    if (planId === "free") {
      window.location.href = "/signup";
      return;
    }

    // Securely check auth before attempting checkout
    const { getUser } = await import("@/lib/auth");
    const user = await getUser();
    if (!user) {
      const { toast } = await import("sonner");
      toast.info("Please sign in to upgrade your plan.");
      // Small delay to allow toast to be seen
      setTimeout(() => {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }, 1000);
      return;
    }

    if ((planId === "pro" || planId === "business") && plan.dodoProductId) {
      setLoadingPlan(planId);
      try {
        // 20s timeout to avoid hung requests
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const res = await fetch("/api/checkout/dodo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: plan.dodoProductId,
            planId,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const data = await res.json();

        if (data.url) {
          window.location.href = data.url;
          return;
        }

        // Show error via toast (imported from sonner)
        const { toast } = await import("sonner");
        toast.error(data.error || "Failed to start checkout. Please try again.");
      } catch (e: unknown) {
        const { toast } = await import("sonner");
        if (e instanceof DOMException && e.name === "AbortError") {
          toast.error("Checkout timed out. Please check your connection and try again.");
        } else {
          toast.error("Failed to initiate checkout. Please try again.");
        }
        console.error("Checkout Error:", e);
      } finally {
        setLoadingPlan(null);
      }
    } else {
      // Fallback for free plan or missing dodoProductId
      window.location.href = `/signup?plan=${planId}`;
    }
  };

  const plansList: { id: PlanId; icon: React.ReactNode; accent: string; bgHighlight: string; popular?: boolean }[] = [
    {
      id: "free",
      icon: <Zap size={28} />,
      accent: "text-slate-400",
      bgHighlight: "from-slate-500/10 to-transparent",
    },
    {
      id: "pro",
      icon: <Sparkles size={28} />,
      accent: "text-[var(--store-primary)]",
      bgHighlight: "from-[var(--store-primary)]/20 to-transparent",
      popular: true,
    },
    {
      id: "business",
      icon: <Crown size={28} />,
      accent: "text-amber-400",
      bgHighlight: "from-amber-400/10 to-transparent",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-200 selection:bg-[var(--store-primary)]/30 selection:text-white font-sans overflow-hidden">
      {/* ─── Global Background Layers ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <LightPillar
            topColor="#10B981"
            bottomColor="#059669"
            intensity={0.6}
            rotationSpeed={0.2}
            glowAmount={0.002}
            pillarWidth={3.0}
            pillarHeight={0.4}
            noiseIntensity={0.5}
            pillarRotation={25}
            interactive={false}
            mixBlendMode="normal"
            quality="high"
          />
        </div>
        <div className="absolute inset-0 z-10">
          <DotField 
            dotRadius={1.2} 
            dotSpacing={20} 
            passiveSpeed={1.0} 
            gradientFrom="rgba(16, 185, 129, 0.2)" 
            gradientTo="rgba(0, 206, 201, 0.05)"
          />
        </div>
        <div className="absolute inset-0 z-20 noise-subtle opacity-[0.03]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all duration-300">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tighter font-display">
              Storix
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 font-semibold">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-black hover:bg-gray-200 font-bold rounded-full px-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 text-center z-10">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md shadow-xl animate-fade-in-up">
            <Star size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
            <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Transparent Pricing</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-white leading-[1.1] animate-fade-in-up animation-delay-100">
            Build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-primary animate-gradient-x">Empire</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium animate-fade-in-up animation-delay-200">
            Choose the perfect plan to launch and scale your affiliate storefront. Pay securely with Dodo Payments.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl animate-fade-in-up animation-delay-300">
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
                !annual 
                  ? "bg-white text-black shadow-lg scale-100" 
                  : "text-slate-400 hover:text-white scale-95 hover:scale-100"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 flex items-center gap-2 ${
                annual 
                  ? "bg-white text-black shadow-lg scale-100" 
                  : "text-slate-400 hover:text-white scale-95 hover:scale-100"
              }`}
            >
              Annually
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                annual ? "bg-black/10 text-black" : "bg-green-500/20 text-green-400"
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="pb-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plansList.map(({ id, icon, accent, bgHighlight, popular }) => {
            const plan = PLANS[id];
            const displayPrice = id === "free" 
              ? 0 
              : annual 
                ? (plan.price * 0.8) / 100 
                : plan.price / 100;

            return (
              <div
                key={id}
                className={`group relative flex flex-col rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 ${
                  popular 
                    ? "bg-[#0A0A0A] border-2 border-primary/50 shadow-[0_0_50px_rgba(16,185,129,0.2)] md:-mt-8 md:mb-8" 
                    : "bg-[#0A0A0A]/50 border border-white/5 hover:border-white/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-white/5"
                }`}
              >
                {/* Glow Background inside card */}
                <div className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-b ${bgHighlight} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                {popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-light text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-primary/30 z-20">
                    Most Popular Choice
                  </div>
                )}

                <div className="p-8 md:p-10 flex-1 flex flex-col relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${accent} shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                      {icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white leading-none mb-2">{plan.name}</h3>
                      <p className="text-sm text-slate-400 font-medium">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-end gap-2 text-white">
                      <span className="text-sm font-bold opacity-50 mb-2">{plan.symbol}</span>
                      <span className="text-6xl font-black tracking-tighter leading-none">{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                      {id !== "free" && (
                        <span className="text-sm font-bold text-slate-500 mb-2">/ month</span>
                      )}
                    </div>
                    {annual && id !== "free" && (
                      <p className="text-xs text-emerald-400 font-bold mt-2 bg-emerald-400/10 inline-block px-3 py-1.5 rounded-xl border border-emerald-500/10 backdrop-blur-md">
                        Billed {plan.symbol}{(displayPrice * 12).toLocaleString()} annually
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                     onClick={() => handleCheckout(id)}
                     disabled={loadingPlan === id}
                     className={`w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2 transition-all duration-300 mb-10 ${
                       popular
                         ? "bg-[var(--store-primary)] hover:bg-[var(--store-primary)]/90 text-white shadow-xl shadow-[var(--store-primary)]/20 hover:shadow-[var(--store-primary)]/40 hover:-translate-y-1"
                         : "bg-white/10 hover:bg-white text-white hover:text-black border border-white/5"
                     }`}
                  >
                    {loadingPlan === id ? (
                       <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {id === "free" ? "Start Building Free" : `Upgrade to ${plan.name}`}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                       </>
                    )}
                  </button>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                  {/* Features */}
                  <ul className="space-y-4 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 group/feature">
                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          popular ? "bg-[var(--store-primary)]/20 text-[var(--store-primary)]" : "bg-white/10 text-slate-300 group-hover/feature:bg-white/20 group-hover/feature:text-white"
                        } transition-colors`}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-slate-300 font-medium leading-relaxed group-hover/feature:text-white transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="pb-32 px-6 relative z-10 border-t border-white/5 pt-20 bg-black">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-xl font-black text-white mb-10">Trusted by top affiliates & secured by the best</h3>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {[
              { icon: Shield, label: "Bank-grade Security" },
              { icon: Zap, label: "Instant Delivery & Setup" },
              { icon: Star, label: "Cancel Anytime Online" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-slate-400 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 cursor-default hover:text-white hover:bg-white/10">
                <Icon size={20} className="text-[var(--store-primary)]" />
                <span className="text-sm font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-6 border-t border-white/5 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500">
          <p>© 2026 Storix. Empowering Affiliates worldwide.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
