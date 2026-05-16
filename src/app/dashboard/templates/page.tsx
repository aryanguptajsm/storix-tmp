"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Lock, LayoutTemplate, Crown } from "lucide-react";
import { getUser, getProfile, updateProfile } from "@/lib/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { isPaidPlan, normalizePlanId } from "@/lib/plans";

const FREE_THEMES = [
  { id: "default", name: "Classic Dark", desc: "The standard high-contrast dark mode.", colors: ["#0A0A0E", "#10B981"] },
  { id: "light", name: "Clean Light", desc: "A bright, crisp interface for maximum readability.", colors: ["#FFFFFF", "#059669"] },
];

const PREMIUM_THEMES_LIST = [
  { id: "cyberpunk", name: "Cyberpunk", desc: "Neon pinks and deep purples for a futuristic aesthetic.", colors: ["#0B0B13", "#FF00E6", "#151522"] },
  { id: "ocean", name: "Deep Ocean", desc: "Rich blues and cyans evoking the deep sea.", colors: ["#000B18", "#00E5FF", "#001833"] },
  { id: "midnight", name: "Midnight", desc: "Ultra-dark blacks with emerald accents.", colors: ["#000000", "#10B981", "#0A0A0A"] },
  { id: "tokyo", name: "Tokyo Nights", desc: "Vibrant city lights over deep slate.", colors: ["#1A1B26", "#F7768E", "#24283B"] },
  { id: "neon", name: "Neon Matrix", desc: "Glowing cyan against pure obsidian.", colors: ["#030308", "#00FFD1", "#0A0A14"] },
  { id: "sunset", name: "Sunset Horizon", desc: "Warm oranges and deep reds.", colors: ["#120804", "#FF512F", "#F09819"] },
  { id: "amazon", name: "Retail Classic", desc: "Optimized high-conversion retail layout.", colors: ["#EAEDED", "#FF9900", "#FFFFFF"] },
  { id: "flipkart", name: "Commerce Blue", desc: "Trusted blue tones for e-commerce.", colors: ["#F1F3F6", "#2874F0", "#FFFFFF"] },
];

export default function TemplatesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingTheme, setSavingTheme] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getUser();
        if (user) {
          const prof = await getProfile(user.id);
          setProfile(prof);
        }
      } catch (err) {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleApplyTheme = async (themeId: string) => {
    if (!profile) return;
    setSavingTheme(themeId);
    try {
      await updateProfile(profile.id, { theme: themeId });
      setProfile({ ...profile, theme: themeId });
      toast.success(`Theme updated to ${themeId}!`);
    } catch (err) {
      toast.error("Failed to apply theme.");
    } finally {
      setSavingTheme(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const currentTheme = profile?.theme || "default";
  const userPlan = normalizePlanId(profile?.plan);
  const hasPremiumAccess = isPaidPlan(userPlan);

  const renderThemeCard = (theme: any, isPremium: boolean) => {
    const isActive = currentTheme === theme.id;
    const isLocked = isPremium && !hasPremiumAccess;

    return (
      <motion.div
        key={theme.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative p-6 rounded-3xl border transition-all duration-500 overflow-hidden group flex flex-col h-full ${
          isActive
            ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
        }`}
      >
        {isPremium && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500/20 to-amber-700/20 px-4 py-1.5 rounded-bl-2xl border-b border-l border-amber-500/20 flex items-center gap-1.5">
            <Crown size={12} className="text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Premium</span>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {theme.colors.map((c: string, i: number) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border border-white/10 shadow-inner"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <h3 className="text-xl font-black text-white mb-2 tracking-tight flex items-center gap-2">
          {theme.name}
        </h3>
        <p className="text-sm text-white/40 mb-8 font-medium line-clamp-2">
          {theme.desc}
        </p>

        <div className="mt-auto">
          {isLocked ? (
            <Link href="/dashboard/settings/billing">
              <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl h-12 gap-2">
                <Lock size={16} className="text-white/40" />
                Unlock with Pro
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => handleApplyTheme(theme.id)}
              disabled={isActive || savingTheme === theme.id}
              className={`w-full rounded-xl h-12 font-bold transition-all ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {savingTheme === theme.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : isActive ? (
                <>
                  <Check size={18} className="mr-2" /> Applied
                </>
              ) : (
                "Apply Theme"
              )}
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050508] text-white">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-6 md:p-12">
          
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <LayoutTemplate className="text-emerald-500" size={24} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                Store Templates
              </h1>
            </div>
            <p className="text-white/40 text-lg font-medium max-w-2xl">
              Transform your storefront instantly. Choose from our curated collection of high-converting, professional themes.
            </p>
          </div>

          <div className="space-y-12">
            <div>
              <h2 className="text-lg font-black text-white/90 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-white/20 rounded-full" />
                Standard Themes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FREE_THEMES.map(t => renderThemeCard(t, false))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-lg font-black text-amber-500 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  Premium Themes
                </h2>
                {!hasPremiumAccess && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/50 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    Pro & Business Only
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PREMIUM_THEMES_LIST.map(t => renderThemeCard(t, true))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
