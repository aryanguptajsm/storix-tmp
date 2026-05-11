"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { appMode, toggleAppMode, mounted } = useTheme();
  const isLight = appMode === "light";

  if (!mounted) return <div className={cn("w-[72px] h-[44px] rounded-2xl bg-white/5 animate-pulse", className)} />;

  return (
    <button
      onClick={(e) => toggleAppMode(e)}
      className={cn(
        "relative flex items-center h-[44px] p-1.5 rounded-2xl border transition-all duration-500 focus:outline-none group overflow-hidden",
        isLight 
          ? "bg-slate-200/50 border-slate-300 justify-start" 
          : "bg-white/[0.03] border-white/5 justify-end backdrop-blur-md",
        className
      )}
      aria-label="Toggle App Theme"
      type="button"
    >
      {/* Track Background Effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
        isLight ? "bg-gradient-to-r from-amber-500/10 to-transparent" : "bg-gradient-to-l from-indigo-500/10 to-transparent"
      )} />

      {/* Track Icons */}
      <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none z-0">
         <div className="flex items-center gap-2">
           <Sun size={14} className={cn("transition-all duration-500", isLight ? "text-amber-600 scale-110" : "text-white/20")} />
           {className?.includes("w-full") && <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isLight ? "text-amber-900/40" : "text-white/10")}>Light</span>}
         </div>
         <div className="flex items-center gap-2">
           {className?.includes("w-full") && <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isLight ? "text-black/10" : "text-indigo-400")}>Dark</span>}
           <Moon size={14} className={cn("transition-all duration-500", isLight ? "text-black/20" : "text-indigo-400 scale-110")} />
         </div>
      </div>

      {/* Sliding Thumb */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "relative z-10 flex items-center justify-center w-8 h-8 rounded-xl shadow-xl transition-all duration-500",
          isLight 
            ? "bg-white border border-slate-200 shadow-amber-500/10" 
            : "bg-[#16161E] border border-white/10 shadow-black/50"
        )}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isLight ? 0 : -90, scale: isLight ? 1 : 0.4, opacity: isLight ? 1 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 400, damping: 25 }}
          className="absolute flex items-center justify-center"
        >
          <Sun size={15} className="text-amber-500" strokeWidth={2.5} />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{ rotate: isLight ? 90 : 0, scale: isLight ? 0.4 : 1, opacity: isLight ? 0 : 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 400, damping: 25 }}
          className="absolute flex items-center justify-center"
        >
          <Moon size={14} className="text-indigo-400" strokeWidth={2.5} />
        </motion.div>
      </motion.div>
    </button>
  );
}
