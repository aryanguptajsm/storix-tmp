"use client";

import React from "react";
import Link from "next/link";
import { Rocket, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UpgradePromptProps {
  feature: string;
  description?: string;
  inline?: boolean;
}

export function UpgradePrompt({ feature, description, inline = false }: UpgradePromptProps) {
  if (inline) {
    return (
      <Link href="/dashboard/billing" className="group inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-light transition-colors">
        <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />
        Upgrade to unlock {feature}
        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    );
  }

  return (
    <div className="relative p-6 rounded-3xl border border-primary/20 bg-primary/5 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/10 rounded-full blur-[60px]" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-4 text-center md:text-left flex-1">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 shadow-lg shadow-primary/10">
            <Rocket size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">
              Upgrade to unlock {feature}
            </h3>
            <p className="text-sm text-muted mt-1 max-w-md leading-relaxed">
              {description || `This feature requires a Pro or Business plan. Upgrade now to supercharge your affiliate store.`}
            </p>
          </div>
        </div>
        <Link href="/dashboard/billing" className="w-full md:w-auto flex-shrink-0">
          <Button className="w-full md:w-auto gap-2 px-8 shadow-xl shadow-primary/20 group">
            <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
            View Plans
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
