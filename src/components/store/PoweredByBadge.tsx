"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function PoweredByBadge() {
  return (
    <Link
      href="/"
      target="_blank"
      className="fixed bottom-4 right-4 z-50 group"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 hover:border-primary/30 hover:bg-black/90 transition-all duration-300">
        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
          <Sparkles size={10} className="text-white" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60 group-hover:text-white/80 transition-colors">
          Powered by Storix
        </span>
      </div>
    </Link>
  );
}
