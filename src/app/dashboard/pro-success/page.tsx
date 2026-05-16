"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getUser, getProfile } from "@/lib/auth";
import { normalizePlanId, PLANS, type PlanId } from "@/lib/plans";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Rocket,
  ShieldCheck,
  Clock,
  Zap,
  Package,
  Palette,
  BarChart3,
  MessageCircle,
  Mail,
  Crown,
  Star,
  Infinity as InfinityIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const PRO_FEATURES = [
  {
    icon: Package,
    label: "100 Products",
    desc: "Scale your catalog to 100 affiliate products",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: Sparkles,
    label: "AI Description Writer",
    desc: "Generate compelling product copy with AI",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: Palette,
    label: "Premium Themes",
    desc: "Unlock all exclusive storefront themes",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
  {
    icon: BarChart3,
    label: "Advanced Analytics",
    desc: "Deep click tracking & conversion insights",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp Sharing",
    desc: "Share products instantly to WhatsApp",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Mail,
    label: "Email Capture Widget",
    desc: "Grow your subscriber list from your store",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: ShieldCheck,
    label: "No Storix Branding",
    desc: "Your store, your brand — completely white-labeled",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Rocket,
    label: "Priority SEO",
    desc: "Optimized metadata for faster indexing",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
];

function Confetti() {
  const particles = Array.from({ length: 30 });
  const colors = ["#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#3B82F6", "#06B6D4"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: `-10px`,
          }}
          animate={{
            y: ["0%", "110vh"],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, Math.random() * 720],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 1.5,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

function ProSuccessContent() {
  const searchParams = useSearchParams();
  const expectedPlanId = (searchParams.get("plan") || "pro") as PlanId;

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [actualPlan, setActualPlan] = useState<PlanId | null>(null);

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 15;

    async function verifyUpgrade() {
      try {
        const user = await getUser();
        if (!user) {
          if (isMounted) setStatus("error");
          return;
        }

        while (attempts < maxAttempts && isMounted) {
          const profile = await getProfile(user.id);
          const currentPlan = normalizePlanId(profile?.plan);

          if (currentPlan !== "free") {
            setActualPlan(currentPlan);
            setStatus("success");
            return;
          }

          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        if (isMounted && attempts >= maxAttempts) {
          setStatus("error");
        }
      } catch (error) {
        if (isMounted) setStatus("error");
      }
    }

    verifyUpgrade();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedPlan = actualPlan || expectedPlanId;
  const planName = PLANS[resolvedPlan]?.name || "Pro";
  const planFeatures = resolvedPlan === "business"
    ? [...PRO_FEATURES, {
      icon: InfinityIcon,
      label: "Unlimited Products",
      desc: "No limits — add as many as you want",
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    }]
    : PRO_FEATURES;

  const isPro = resolvedPlan === "pro";

  return (
    <div className="min-h-[80vh] py-12 px-4 relative">
      <AnimatePresence>
        {status === "success" && <Confetti />}
      </AnimatePresence>

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">

        {/* ─── VERIFYING ─── */}
        {status === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-[70vh]"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Verifying Payment...
            </h1>
            <p className="text-white/40 font-medium max-w-md text-center">
              We are securely confirming your transaction with Dodo Payments. This usually takes just a few seconds.
            </p>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
              <ShieldCheck size={14} />
              Secure Checkout Session
            </div>
          </motion.div>
        )}

        {/* ─── SUCCESS ─── */}
        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            >
              <Card className="glass overflow-hidden relative border-primary/30 shadow-2xl shadow-primary/10 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-violet-500/5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

                <CardContent className="p-10 md:p-14 text-center relative z-10 flex flex-col items-center">
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                    className="relative mb-8"
                  >
                    <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/40 shadow-[0_0_60px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="w-14 h-14 text-primary" />
                    </div>
                  </motion.div>

                  {/* Plan Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 mb-4"
                  >
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-black uppercase tracking-widest">
                      <Crown size={12} />
                      {planName} Plan Activated
                    </div>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
                  >
                    Welcome to{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-300 to-primary">
                      {planName}
                    </span>
                    !
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg text-white/40 font-medium max-w-lg mb-10 leading-relaxed"
                  >
                    Your upgrade was successful. All premium features are now unlocked and ready to supercharge your affiliate store.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <Link href="/dashboard">
                      <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-sm">
                        Go to Dashboard <ArrowRight size={18} />
                      </Button>
                    </Link>
                    <Link href="/dashboard/products">
                      <Button variant="secondary" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest gap-3 text-sm">
                        <Package size={18} /> Add Products
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Star size={18} />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Your {planName} Features
                </h2>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {planFeatures.map((feat, i) => (
                  <motion.div
                    key={feat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.07, type: "spring", bounce: 0.3 }}
                  >
                    <div className={`glass p-5 rounded-2xl border ${feat.bg} h-full flex flex-col gap-3 hover:scale-[1.02] transition-transform`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feat.bg} border ${feat.color} shrink-0`}>
                        <feat.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white mb-1">{feat.label}</p>
                        <p className="text-[11px] text-white/40 font-medium leading-relaxed">{feat.desc}</p>
                      </div>
                      <div className="mt-auto">
                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${feat.color}`}>
                          <Zap size={10} /> Unlocked
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ─── ERROR / DELAYED ─── */}
        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-[70vh]"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
              <div className="relative w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                <Clock className="w-10 h-10 text-amber-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Processing Payment...
            </h1>
            <p className="text-white/40 font-medium max-w-md text-center mb-8">
              Your payment has been received, but it&apos;s taking a little longer to sync. Your account will automatically upgrade shortly — no action needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest gap-2">
                  Go to Dashboard <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/dashboard/billing">
                <Button variant="secondary" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest gap-2">
                  Return to Billing
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default function ProSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProSuccessContent />

    </Suspense>
  );
}
