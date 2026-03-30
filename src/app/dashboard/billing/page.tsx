"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlanBadge } from "@/components/dashboard/PlanBadge";
import { QuotaBar } from "@/components/dashboard/QuotaBar";
import { getUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { PLANS, type PlanId } from "@/lib/plans";
import {
  Check,
  ArrowRight,
  Sparkles,
  Crown,
  Zap,
  CreditCard,
  Calendar,
  Shield,
  Loader2,
  Star,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface UserState {
  plan: PlanId;
  productCount: number;
  storeName: string;
}

export default function BillingPage() {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const user = await getUser();
        if (!user) return;
        const profile = await getProfile(user.id);
        const supabase = createClient();
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        setUserState({
          plan: (profile?.plan as PlanId) || "free",
          productCount: count || 0,
          storeName: profile?.store_name || "My Store",
        });
      } catch {
        toast.error("Failed to load billing data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpgrade = async (planId: PlanId) => {
    setUpgrading(planId);
    try {
      // Razorpay integration placeholder
      toast.info("Payment integration coming soon! Your plan will be upgraded once Razorpay is configured.");
      setTimeout(() => setUpgrading(null), 2000);
    } catch {
      toast.error("Failed to initiate upgrade");
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlan = userState?.plan || "free";
  const planOrder: PlanId[] = ["free", "pro", "business"];
  const currentIndex = planOrder.indexOf(currentPlan);

  const plans: { id: PlanId; icon: React.ReactNode; color: string; bg: string }[] = [
    { id: "free", icon: <Zap size={20} />, color: "text-muted", bg: "bg-surface-light" },
    { id: "pro", icon: <Sparkles size={20} />, color: "text-primary", bg: "bg-primary/10" },
    { id: "business", icon: <Crown size={20} />, color: "text-accent", bg: "bg-accent/10" },
  ];

  const addons = [
    {
      id: "ai_writer",
      name: "AI Description Writer",
      price: "₹199/mo",
      icon: <Sparkles size={18} />,
      desc: "Generate SEO-optimized product descriptions with Claude AI.",
      included: currentPlan !== "free",
    },
    {
      id: "bulk_import",
      name: "Bulk CSV Import",
      price: "₹149/mo",
      icon: <Package size={18} />,
      desc: "Import hundreds of products at once from CSV files.",
      included: currentPlan === "business",
    },
    {
      id: "seo_booster",
      name: "SEO Booster",
      price: "₹99/mo",
      icon: <Star size={18} />,
      desc: "Auto-generate sitemaps, meta tags, and JSON-LD structured data.",
      included: currentPlan !== "free",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-foreground tracking-tight">Billing &amp; Plans</h1>
          <PlanBadge plan={currentPlan} size="md" />
        </div>
        <p className="text-muted font-medium">
          Manage your subscription, view invoices, and unlock premium features.
        </p>
      </div>

      {/* Current Plan Overview */}
      <Card className="glass overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {PLANS[currentPlan].name} Plan
                </h3>
                <p className="text-sm text-muted flex items-center gap-2 mt-1">
                  <Calendar size={14} />
                  {currentPlan === "free" ? "No expiration" : "Renews monthly"}
                </p>
              </div>
            </div>
            <div className="w-full lg:w-72">
              <QuotaBar plan={currentPlan} currentCount={userState?.productCount || 0} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(({ id, icon, color, bg }) => {
          const plan = PLANS[id];
          const planIndex = planOrder.indexOf(id);
          const isCurrent = id === currentPlan;
          const isDowngrade = planIndex < currentIndex;
          const isUpgrade = planIndex > currentIndex;

          return (
            <Card
              key={id}
              className={`glass overflow-hidden flex flex-col transition-all duration-500 ${
                isCurrent
                  ? "border-primary/40 shadow-lg shadow-primary/5"
                  : "hover:border-white/20"
              }`}
            >
              {isCurrent && (
                <div className="h-1 bg-gradient-to-r from-primary to-accent" />
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                    {icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{plan.name}</h4>
                    {isCurrent && (
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Current Plan
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-black text-foreground">{plan.priceDisplay}</span>
                  {id !== "free" && <span className="text-muted text-sm">/mo</span>}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.slice(0, 5).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted">
                      <Check size={12} className={color} />
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-[10px] text-muted/50 font-bold">
                      +{plan.features.length - 5} more features
                    </li>
                  )}
                </ul>

                {isCurrent ? (
                  <Button variant="secondary" disabled className="w-full opacity-50">
                    Current Plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    className="w-full gap-2 group shadow-lg shadow-primary/10"
                    onClick={() => handleUpgrade(id)}
                    loading={upgrading === id}
                  >
                    Upgrade to {plan.name}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button variant="ghost" disabled className="w-full opacity-40">
                    <Shield size={14} />
                    Downgrade
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add-ons */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <Sparkles size={18} className="text-accent" />
          Power-Up Add-ons
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {addons.map((addon) => (
            <Card key={addon.id} className="glass overflow-hidden hover:border-white/20 transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      {addon.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{addon.name}</h4>
                      <span className="text-xs font-bold text-accent">{addon.price}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed">{addon.desc}</p>
                {addon.included ? (
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success">
                    <Check size={12} /> Included in your plan
                  </div>
                ) : (
                  <Button variant="secondary" size="sm" className="w-full">
                    Add to Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
