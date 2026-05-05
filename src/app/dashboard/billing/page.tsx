"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlanBadge } from "@/components/dashboard/PlanBadge";
import { QuotaBar } from "@/components/dashboard/QuotaBar";
import { getUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import {
  PLANS,
  PLAN_ORDER,
  isPaidPlan,
  normalizePlanId,
  type PlanId,
} from "@/lib/plans";
import {
  Check,
  ArrowRight,
  Sparkles,
  Crown,
  Zap,
  CreditCard,
  Calendar,
  Shield,
  Star,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { BillingSkeleton } from "@/components/ui/BillingSkeleton";
import { motion } from "framer-motion";

interface UserState {
  plan: PlanId;
  productCount: number;
  storeName: string;
}

export default function BillingPage() {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [redeeming, setRedeeming] = useState(false);

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
          plan: normalizePlanId(profile?.plan),
          productCount: count || 0,
          storeName: profile?.store_name || "My Store",
        });

        // Check for success query parameter from Dodo redirect
        const params = new URLSearchParams(window.location.search);
        if (params.get("success") === "true") {
          toast.success("Payment Received! Your account is being upgraded.", {
            description: "It may take a few moments for your plan to update.",
            duration: 6000,
          });
          // Remove the query param to avoid repeated toasts
          window.history.replaceState({}, document.title, window.location.pathname);
          
          const refreshPlanStatus = async () => {
            for (let attempt = 0; attempt < 5; attempt += 1) {
              await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 1500 : 2500));
              const freshProfile = await getProfile(user.id);
              const nextPlan = normalizePlanId(freshProfile?.plan);
              if (nextPlan !== "free") {
                setUserState((prev) =>
                  prev
                    ? {
                        ...prev,
                        plan: nextPlan,
                        storeName: freshProfile?.store_name || prev.storeName,
                      }
                    : null
                );
                toast.success(`Your ${PLANS[nextPlan].name} plan is now active.`);
                return;
              }
            }
          };

          void refreshPlanStatus();
        }
      } catch {
        toast.error("Failed to load billing data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const user = await getUser();
      if (!user) return;
      // Force refresh by bypassing cache (short delay already in getUser)
      const freshProfile = await getProfile(user.id);
      if (freshProfile) {
        setUserState(prev => prev ? { 
          ...prev, 
          plan: normalizePlanId(freshProfile.plan),
          storeName: freshProfile.store_name || "My Store"
        } : null);
        
        if (isPaidPlan(freshProfile.plan)) {
          toast.success("Subscription Verified!", {
            description: `Your account is now active on the ${normalizePlanId(freshProfile.plan).toUpperCase()} plan.`
          });
        } else {
          toast.info("No active subscription found yet. If you just paid, please wait 1-2 minutes for the webhook to process.");
        }
      }
    } catch {
      toast.error("Failed to verify subscription.");
    } finally {
      setVerifying(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    setRedeeming(true);
    try {
      const res = await fetch("/api/auth/redeem-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: licenseKey }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setLicenseKey("");
        // Refresh state
        handleVerify();
      } else {
        toast.error(data.error || "Failed to redeem key.");
      }
    } catch {
      toast.error("An error occurred during redemption.");
    } finally {
      setRedeeming(false);
    }
  };

  const handleUpgrade = async (planId: PlanId) => {
    setUpgrading(planId);
    try {
      if (planId === "free") return;
      
      const plan = PLANS[planId];
      if ((planId === "pro" || planId === "business") && plan.dodoProductId) {
        const res = await fetch("/api/checkout/dodo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: plan.dodoProductId,
            planId: planId,
          }),
        });
        const data = await res.json();
        
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(`Checkout failed: ${data.error || "Please check your connection and try again."}`);
          setUpgrading(null);
        }
      } else {
        toast.info("This plan is not fully integrated yet.");
        setUpgrading(null);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to initiate upgrade");
      setUpgrading(null);
    }
  };

  if (loading) {
    return <BillingSkeleton />;
  }

  const currentPlan = normalizePlanId(userState?.plan);
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);

  const plans: { id: PlanId; icon: React.ReactNode; color: string; bg: string }[] = [
    { id: "free", icon: <Zap size={20} />, color: "text-muted", bg: "bg-surface-light" },
    { id: "pro", icon: <Sparkles size={20} />, color: "text-primary", bg: "bg-primary/10" },
    { id: "business", icon: <Crown size={20} />, color: "text-accent", bg: "bg-accent/10" },
  ];

  const addons = [
    {
      id: "ai_writer",
      name: "AI Description Writer",
      price: "Included",
      icon: <Sparkles size={18} />,
      desc: "Generate SEO-optimized product descriptions with Claude AI.",
      included: isPaidPlan(currentPlan),
    },
    {
      id: "bulk_import",
      name: "Bulk CSV Import",
      price: "Included",
      icon: <Package size={18} />,
      desc: "Import hundreds of products at once from CSV files.",
      included: currentPlan === "business",
    },
    {
      id: "seo_booster",
      name: "SEO Booster",
      price: "Included",
      icon: <Star size={18} />,
      desc: "Auto-generate sitemaps, meta tags, and JSON-LD structured data.",
      included: isPaidPlan(currentPlan),
    },
  ];

  const variants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

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
      <Card className="glass overflow-hidden relative">
        <div className="absolute inset-0 grid-bg-subtle opacity-10 pointer-events-none" />
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                <CreditCard size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-foreground">
                    {PLANS[currentPlan].name} Plan
                  </h3>
                  {currentPlan !== "free" && (
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-muted flex items-center gap-2 mt-1 font-medium">
                  <Calendar size={14} className="opacity-50" />
                  {currentPlan === "free" ? "No expiration" : "Renews monthly"}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <Button 
                variant="secondary" 
                className="w-full sm:w-auto gap-2 bg-white/5 border-white/5 hover:bg-white/10 h-12 px-6"
                onClick={handleVerify}
                loading={verifying}
              >
                {!verifying && <Zap size={16} className="text-primary-light" />}
                Verify Status
              </Button>
              <div className="w-full lg:w-72 hidden md:block">
                <QuotaBar plan={currentPlan} currentCount={userState?.productCount || 0} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(({ id, icon, color, bg }, i) => {
          const plan = PLANS[id];
          const planIndex = PLAN_ORDER.indexOf(id);
          const isCurrent = id === currentPlan;
          const isDowngrade = planIndex < currentIndex;
          const isUpgrade = planIndex > currentIndex;

          return (
            <motion.div
              key={id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={variants}
              className="flex"
            >
              <Card
                className={`glass w-full overflow-hidden flex flex-col transition-all duration-700 relative group/card ${
                  isCurrent
                    ? "border-primary/40 shadow-2xl shadow-primary/10 scale-[1.02] z-10"
                    : "hover:border-white/20 hover:translate-y-[-4px]"
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                )}
                
                {plan.badge && (
                  <div className="absolute top-4 right-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      id === 'business' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color} shadow-inner border border-white/5`}>
                      {icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-foreground tracking-tight">{plan.name}</h4>
                      <p className="text-[10px] text-muted font-bold uppercase tracking-wider">{id === 'free' ? 'Starter' : id === 'pro' ? 'Scale' : 'Enterprise'}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-foreground tracking-tighter">{plan.priceDisplay}</span>
                      {id !== "free" && <span className="text-muted text-sm font-bold">/mo</span>}
                    </div>
                    <p className="text-xs text-muted/60 mt-2 font-medium line-clamp-2">{plan.description}</p>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/40">Includes:</p>
                    <ul className="space-y-3">
                      {plan.features.slice(0, 8).map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-[11px] text-muted font-medium">
                          <div className={`shrink-0 w-4 h-4 rounded-full ${bg} flex items-center justify-center ${color}`}>
                            <Check size={10} strokeWidth={3} />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isCurrent ? (
                    <Button variant="secondary" disabled className="w-full h-12 rounded-2xl bg-white/5 border-white/10 opacity-60">
                      Active Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      className={`w-full h-12 rounded-2xl gap-2 group relative overflow-hidden font-black uppercase tracking-widest text-[11px] ${
                        id === 'business' ? 'bg-accent hover:bg-accent-dark shadow-accent/20' : 'bg-primary hover:bg-primary-dark shadow-primary/20'
                      }`}
                      onClick={() => handleUpgrade(id)}
                      loading={upgrading === id}
                    >
                      <span>Command {plan.name}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button variant="ghost" disabled className="w-full h-12 rounded-2xl opacity-40 text-[11px] font-black uppercase">
                      <Shield size={14} className="mr-2" />
                      Legacy Version
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* License Key Redemption */}
      <div className="pt-4 animate-stagger-fade stagger-4">
        <Card className="glass border-primary/20 bg-primary/5 overflow-hidden">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-lg">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Star size={24} className="text-primary" />
                Redeem Activation Key
              </h2>
              <p className="text-muted font-medium text-sm leading-relaxed">
                Have a promo code or a lifetime license key? Enter it here to activate your premium features immediately.
              </p>
            </div>
            
            <form onSubmit={handleRedeem} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
              <div className="relative group w-full sm:w-64">
                <input
                  type="text"
                  placeholder="STRX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 font-mono text-sm tracking-widest text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all uppercase placeholder:opacity-30"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/40 hover-shine font-black uppercase tracking-widest gap-2"
                loading={redeeming}
              >
                Redeem Key
              </Button>
            </form>
          </CardContent>
        </Card>
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
