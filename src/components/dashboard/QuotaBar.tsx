"use client";

import React from "react";
import { getProductUsagePercent, getProductLimit, type PlanId } from "@/lib/plans";

interface QuotaBarProps {
  plan: PlanId;
  currentCount: number;
}

export function QuotaBar({ plan, currentCount }: QuotaBarProps) {
  const limit = getProductLimit(plan);
  const percent = getProductUsagePercent(plan, currentCount);
  const isUnlimited = limit === Infinity;
  const isNearLimit = percent >= 80;
  const isAtLimit = percent >= 100;

  const barColor = isAtLimit
    ? "bg-danger"
    : isNearLimit
      ? "bg-warning"
      : "bg-primary";

  const glowColor = isAtLimit
    ? "shadow-danger/30"
    : isNearLimit
      ? "shadow-warning/30"
      : "shadow-primary/30";

  if (isUnlimited) {
    return (
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success/60">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        Unlimited capacity
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">
          Product Capacity
        </span>
        <span className={`text-[10px] font-black ${isAtLimit ? "text-danger" : isNearLimit ? "text-warning" : "text-muted/60"}`}>
          {currentCount} / {limit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} shadow-lg ${glowColor} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="text-[10px] text-danger font-bold animate-fade-in">
          You&apos;ve reached your product limit. Upgrade to add more.
        </p>
      )}
      {isNearLimit && !isAtLimit && (
        <p className="text-[10px] text-warning font-bold animate-fade-in">
          Approaching capacity — consider upgrading your plan.
        </p>
      )}
    </div>
  );
}
