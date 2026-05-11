"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getUser, getProfile } from "@/lib/auth";
import { normalizePlanId, PLANS, type PlanId } from "@/lib/plans";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles, CheckCircle2, ArrowRight, Loader2, Rocket, ShieldCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function ProSuccessContent() {
  const searchParams = useSearchParams();
  const expectedPlanId = (searchParams.get("plan") || "pro") as PlanId;
  
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [actualPlan, setActualPlan] = useState<PlanId | null>(null);

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 15; // Try for ~30 seconds

    async function verifyUpgrade() {
      try {
        const user = await getUser();
        if (!user) {
          if (isMounted) setStatus("error");
          return;
        }

        // Poll the database until the webhook updates the plan
        while (attempts < maxAttempts && isMounted) {
          const profile = await getProfile(user.id);
          const currentPlan = normalizePlanId(profile?.plan);
          
          if (currentPlan !== "free") {
            // Webhook succeeded!
            setActualPlan(currentPlan);
            setStatus("success");
            return;
          }

          attempts++;
          // Wait 2 seconds before checking again
          await new Promise(resolve => setTimeout(resolve, 2000));
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

  const planName = actualPlan ? PLANS[actualPlan]?.name : PLANS[expectedPlanId]?.name || "Pro";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass overflow-hidden relative border-primary/20 shadow-2xl shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          
          <CardContent className="p-10 md:p-16 text-center relative z-10 flex flex-col items-center">
            {status === "verifying" && (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tight">
                  Verifying Payment...
                </h1>
                <p className="text-muted font-medium max-w-md">
                  We are securely confirming your transaction with Dodo Payments. This usually takes just a few seconds.
                </p>
                <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                  <ShieldCheck size={14} />
                  Secure Checkout Session
                </div>
              </>
            )}

            {status === "success" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-success/20 blur-xl rounded-full" />
                  <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center border-2 border-success/30 relative z-10">
                    <CheckCircle2 className="w-12 h-12 text-success" />
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{planName}</span>!
                </h1>
                
                <p className="text-lg text-muted font-medium max-w-lg mb-10 leading-relaxed">
                  Your upgrade was successful. Your account has been securely upgraded and all premium features are now unlocked and ready to use.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mb-10 text-left">
                  <div className="glass p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-bold">AI Product Descriptions</span>
                  </div>
                  <div className="glass p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <Rocket size={16} />
                    </div>
                    <span className="text-sm font-bold">Priority SEO Indexing</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button className="w-full h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                      Go to Dashboard <ArrowRight size={18} />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {status === "error" && (
              <>
                <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mb-8 border border-warning/20">
                  <Clock className="w-10 h-10 text-warning" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tight">
                  Processing Payment...
                </h1>
                <p className="text-muted font-medium max-w-md mb-8">
                  Your payment has been received, but it's taking a little longer than expected to securely sync with our systems. Don't worry, your account will automatically upgrade shortly.
                </p>
                <Link href="/dashboard/billing">
                  <Button variant="secondary" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest gap-2">
                    Return to Billing
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ProSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ProSuccessContent />
    </Suspense>
  );
}
