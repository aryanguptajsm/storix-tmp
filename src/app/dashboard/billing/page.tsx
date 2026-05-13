"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
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
  X,
  AlertCircle,
  Receipt,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { BillingSkeleton } from "@/components/ui/BillingSkeleton";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface UserState {
  plan: PlanId;
  productCount: number;
  storeName: string;
}

interface UpgradeConfirmState {
  planId: PlanId;
  open: boolean;
}

/** Calculate a simple proration estimate based on days remaining in the month */
function calcProration(fromPlan: PlanId, toPlan: PlanId): { netAmount: number; description: string } {
  const fromPrice = PLANS[fromPlan].price; // USD cents * 100 (stored as dollars * 100)
  const toPrice = PLANS[toPlan].price;

  if (fromPlan === "free") {
    return {
      netAmount: toPrice,
      description: `First payment of ${PLANS[toPlan].priceDisplay}/mo`,
    };
  }

  // Days remaining in current billing cycle (approximate)
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  const dailyRateFrom = fromPrice / daysInMonth;
  const dailyRateTo = toPrice / daysInMonth;

  const credit = Math.round(dailyRateFrom * daysRemaining * 100) / 100;
  const charge = Math.round(dailyRateTo * daysRemaining * 100) / 100;
  const net = Math.max(0, charge - credit);

  return {
    netAmount: net,
    description: `Prorated for ${daysRemaining} days remaining (~$${credit.toFixed(2)} credit applied)`,
  };
}

export default function BillingPage() {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [confirmState, setConfirmState] = useState<UpgradeConfirmState | null>(null);

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
      const freshProfile = await getProfile(user.id);
      if (freshProfile) {
        setUserState(prev =>
          prev
            ? {
                ...prev,
                plan: normalizePlanId(freshProfile.plan),
                storeName: freshProfile.store_name || "My Store",
              }
            : null
        );

        if (isPaidPlan(freshProfile.plan)) {
          toast.success("Subscription Verified!", {
            description: `Your account is active on the ${normalizePlanId(freshProfile.plan).toUpperCase()} plan.`,
          });
        } else {
          toast.info(
            "No active subscription found yet. If you just paid, please wait 1–2 minutes for the webhook to process."
          );
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
      if (res.ok && data.success) {
        toast.success(data.message);
        setLicenseKey("");
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

  /** Open the confirmation modal before redirecting to checkout */
  const initiateUpgrade = (planId: PlanId) => {
    if (planId === "free") return;
    setConfirmState({ planId, open: true });
  };

  /** User confirmed the upgrade — proceed to Dodo checkout */
  const handleConfirmUpgrade = async () => {
    if (!confirmState) return;
    const { planId } = confirmState;
    setConfirmState(null);
    setUpgrading(planId);

    try {
      const plan = PLANS[planId];
      if (plan.dodoProductId) {
        const res = await fetch("/api/checkout/dodo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: plan.dodoProductId,
            planId,
          }),
        });
        const data = await res.json();

        if (res.status === 429) {
          toast.error("Too many attempts. Please wait before trying again.");
          setUpgrading(null);
          return;
        }

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(`Checkout failed: ${data.error || "Please check your connection."}`);
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
      desc: "Generate SEO-optimized product descriptions with Gemini AI.",
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

  const variants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  // Proration data for the modal
  const proration = confirmState
    ? calcProration(currentPlan, confirmState.planId)
    : null;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Upgrade Confirmation Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {confirmState?.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmState(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
                {/* Modal Header */}
                <div className="p-8 border-b border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Receipt size={20} />
                      </div>
                      <h2 className="text-xl font-black text-foreground">Confirm Upgrade</h2>
                    </div>
                    <button
                      onClick={() => setConfirmState(null)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted hover:text-foreground hover:bg-white/10 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-muted font-medium">
                    Review your plan details before proceeding to payment.
                  </p>
                </div>

                {/* Plan Summary */}
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                        Upgrading to
                      </div>
                      <div className="text-2xl font-black text-foreground">
                        {PLANS[confirmState.planId].name} Plan
                      </div>
                      <div className="text-sm text-muted mt-1">
                        {PLANS[confirmState.planId].description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-primary">
                        {PLANS[confirmState.planId].priceDisplay}
                      </div>
                      <div className="text-xs text-muted font-bold">/ month</div>
                    </div>
                  </div>

                  {/* Proration breakdown */}
                  {proration && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                        <AlertCircle size={14} />
                        Billing Summary
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{proration.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-sm font-bold text-foreground">Estimated due today</span>
                        <span className="text-sm font-black text-primary">
                          ${proration.netAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Key features included */}
                  <div className="space-y-2">
                    {PLANS[confirmState.planId].features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-muted">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Check size={11} strokeWidth={3} />
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* Security note */}
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted/50 uppercase tracking-widest">
                    <Lock size={10} />
                    Secured by Dodo Payments · PCI DSS Compliant
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="secondary"
                      className="flex-1 h-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
                      onClick={() => setConfirmState(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[11px] gap-2 shadow-lg shadow-primary/20"
                      onClick={handleConfirmUpgrade}
                    >
                      <CreditCard size={14} />
                      Pay Now
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-foreground tracking-tight">Billing &amp; Plans</h1>
          <PlanBadge plan={currentPlan} size="md" />
        </div>
        <p className="text-muted font-medium">
          Manage your subscription, view invoices, and unlock premium features.
        </p>
      </div>

      {/* ── Current Plan Overview ───────────────────────────────────────────── */}
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

      {/* ── Plan Comparison ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(({ id, icon, color, bg }, i) => {
          const plan = PLANS[id];
          const planIndex = PLAN_ORDER.indexOf(id);
          const isCurrent = id === currentPlan;
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
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                        id === "business"
                          ? "bg-accent/10 text-accent border-accent/20"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color} shadow-inner border border-white/5`}
                    >
                      {icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-foreground tracking-tight">
                        {plan.name}
                      </h4>
                      <p className="text-[10px] text-muted font-bold uppercase tracking-wider">
                        {id === "free" ? "Starter" : id === "pro" ? "Scale" : "Enterprise"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-foreground tracking-tighter">
                        {plan.priceDisplay}
                      </span>
                      {id !== "free" && (
                        <span className="text-muted text-sm font-bold">/mo</span>
                      )}
                    </div>
                    <p className="text-xs text-muted/60 mt-2 font-medium line-clamp-2">
                      {plan.description}
                    </p>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/40">
                      Includes:
                    </p>
                    <ul className="space-y-3">
                      {plan.features.slice(0, 8).map((f, fi) => (
                        <li key={fi} className="flex items-center gap-3 text-[11px] text-muted font-medium">
                          <div
                            className={`shrink-0 w-4 h-4 rounded-full ${bg} flex items-center justify-center ${color}`}
                          >
                            <Check size={10} strokeWidth={3} />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isCurrent ? (
                    <Button
                      variant="secondary"
                      disabled
                      className="w-full h-12 rounded-2xl bg-white/5 border-white/10 opacity-60"
                    >
                      Active Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      className={`w-full h-12 rounded-2xl gap-2 group relative overflow-hidden font-black uppercase tracking-widest text-[11px] ${
                        id === "business"
                          ? "bg-accent hover:bg-accent-dark shadow-accent/20"
                          : "bg-primary hover:bg-primary-dark shadow-primary/20"
                      }`}
                      onClick={() => initiateUpgrade(id)}
                      loading={upgrading === id}
                    >
                      <span>Upgrade to {plan.name}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      disabled
                      className="w-full h-12 rounded-2xl opacity-40 text-[11px] font-black uppercase"
                    >
                      <Shield size={14} className="mr-2" />
                      Current or Lower
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── License Key Redemption ──────────────────────────────────────────── */}
      <div className="pt-4 animate-stagger-fade stagger-4">
        <Card className="glass border-primary/20 bg-primary/5 overflow-hidden">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-lg">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Star size={24} className="text-primary" />
                Redeem Activation Key
              </h2>
              <p className="text-muted font-medium text-sm leading-relaxed">
                Have a promo code or lifetime license key? Enter it here to activate premium features
                instantly.
              </p>
            </div>

            <form
              onSubmit={handleRedeem}
              className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3"
            >
              <div className="relative group w-full sm:w-64">
                <input
                  type="text"
                  placeholder="STRX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={e => setLicenseKey(e.target.value.toUpperCase())}
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

      {/* ── Add-ons ─────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <Sparkles size={18} className="text-accent" />
          Power-Up Add-ons
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {addons.map(addon => (
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
                    Upgrade to Unlock
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
