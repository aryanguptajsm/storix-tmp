"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  Check,
  Crown,
  Loader2,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  PLANS,
  PLAN_PRESENTATION,
  type PlanId,
} from "@/lib/plans";
import { getUser } from "@/lib/auth";

interface PublicPricingSectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}

const planIcons: Record<PlanId, React.ReactNode> = {
  free: <Zap size={20} />,
  pro: <Sparkles size={20} />,
  business: <Crown size={20} />,
};

const planStyles: Record<
  PlanId,
  {
    accent: string;
    card: string;
    badge: string;
    icon: string;
    button: string;
    panel: string;
  }
> = {
  free: {
    accent: "text-slate-300",
    card: "bg-[#07090C]/80 border border-white/8",
    badge: "border-white/20 text-white/80",
    icon: "bg-white/5 border-white/8",
    button: "bg-white/8 text-white hover:bg-white hover:text-black border border-white/10",
    panel: "from-white/6 to-transparent",
  },
  pro: {
    accent: "text-white",
    card: "bg-[#060708] border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.45)]",
    badge: "border-white/70 text-white",
    icon: "bg-white/[0.02] border-white/10",
    button: "bg-white text-black hover:bg-white/90",
    panel: "from-white/5 to-transparent",
  },
  business: {
    accent: "text-white",
    card: "bg-[#050607] border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.45)]",
    badge: "border-white/70 text-white",
    icon: "bg-white/[0.02] border-white/10",
    button: "bg-white text-black hover:bg-white/90",
    panel: "from-white/5 to-transparent",
  },
};

export function PublicPricingSection({
  id,
  eyebrow,
  title,
  description,
  className = "",
}: PublicPricingSectionProps) {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  const handleCheckout = async (planId: PlanId) => {
    const plan = PLANS[planId];
    if (planId === "free") {
      window.location.href = "/signup";
      return;
    }

    const user = await getUser();
    if (!user) {
      toast.info("Please sign in to upgrade your plan.");
      setTimeout(() => {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }, 800);
      return;
    }

    if (!plan.dodoProductId) {
      toast.error("This plan is not available for checkout yet.");
      return;
    }

    setLoadingPlan(planId);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);

      const response = await fetch("/api/checkout/dodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: plan.dodoProductId,
          planId,
        }),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to start checkout.");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Payment gateway did not return a checkout URL.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        toast.error("Checkout timed out. Please try again.");
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to start checkout."
        );
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id={id} className={className}>
      <div className="max-w-7xl mx-auto">
        {(eyebrow || title || description) && (
          <div className="max-w-3xl mx-auto text-center mb-16">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-6">
                <Shield size={14} className="text-white/70" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">
                  {eyebrow}
                </span>
              </div>
            )}
            {title && (
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[0.95]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-5 text-base md:text-lg text-white/40 font-medium leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[0.84fr_1fr_1fr] gap-8 items-stretch">
          {(["free", "pro", "business"] as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            const meta = PLAN_PRESENTATION[planId];
            const style = planStyles[planId];
            const isPaid = planId !== "free";

            return (
              <div
                key={planId}
                className={`group relative overflow-hidden rounded-[2.4rem] ${style.card} ${
                  planId === "free" ? "lg:scale-[0.96] lg:origin-bottom" : ""
                }`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${style.panel} opacity-80`}
                />

                {meta.badge && (
                  <div className="absolute right-8 top-7 z-20">
                    <span
                      className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${style.badge}`}
                    >
                      {meta.badge}
                    </span>
                  </div>
                )}

                <div className="relative z-10 flex h-full flex-col p-8 md:p-10">
                  <div className="mb-10 flex items-start gap-4 pr-28">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${style.icon} ${style.accent}`}
                    >
                      {planIcons[planId]}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-white">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-[11px] font-black uppercase tracking-[0.22em] text-white/35">
                        {meta.tier}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex items-end gap-1 text-white">
                    <span className="text-2xl font-black tracking-tight">
                      {plan.symbol}
                    </span>
                    <span className="text-6xl md:text-7xl font-black tracking-[-0.06em] leading-none">
                      {plan.priceDisplay.replace(plan.symbol, "")}
                    </span>
                    {isPaid && (
                      <span className="mb-2 ml-1 text-2xl font-bold text-white/45">
                        /mo
                      </span>
                    )}
                  </div>

                  <p className="mb-10 max-w-sm text-base text-white/32 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mb-7">
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/28">
                      Includes:
                    </p>
                  </div>

                  <ul className="mb-10 space-y-4 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-white/65"
                      >
                        <Check
                          size={14}
                          className="mt-1 shrink-0 text-white/80"
                          strokeWidth={3}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {planId === "free" ? (
                    <Link href="/signup" className="mt-auto">
                      <Button
                        className={`h-14 w-full rounded-2xl text-[11px] font-black uppercase tracking-[0.22em] ${style.button}`}
                      >
                        {meta.cta}
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCheckout(planId)}
                      disabled={loadingPlan === planId}
                      className={`mt-auto flex h-14 w-full items-center justify-center rounded-2xl text-[11px] font-black uppercase tracking-[0.22em] transition-all ${style.button} disabled:opacity-70`}
                    >
                      {loadingPlan === planId ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          {meta.cta}
                          <ArrowRight size={16} className="ml-2" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
