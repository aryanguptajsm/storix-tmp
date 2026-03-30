"use client";

import React from "react";
import { Crown, Sparkles, Zap } from "lucide-react";
import type { PlanId } from "@/lib/plans";

interface PlanBadgeProps {
  plan: PlanId;
  size?: "sm" | "md";
}

const config: Record<PlanId, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  free: {
    label: "Free",
    icon: <Zap size={10} />,
    bg: "bg-surface-light",
    text: "text-muted",
    border: "border-white/10",
  },
  pro: {
    label: "Pro",
    icon: <Sparkles size={10} />,
    bg: "bg-primary/10",
    text: "text-primary-light",
    border: "border-primary/20",
  },
  business: {
    label: "Business",
    icon: <Crown size={10} />,
    bg: "bg-accent/10",
    text: "text-accent",
    border: "border-accent/20",
  },
};

export function PlanBadge({ plan, size = "sm" }: PlanBadgeProps) {
  const c = config[plan] || config.free;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-black uppercase tracking-[0.15em] border rounded-full ${c.bg} ${c.text} ${c.border} ${
        size === "sm" ? "px-2.5 py-0.5 text-[8px]" : "px-3 py-1 text-[10px]"
      }`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}
