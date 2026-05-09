"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { appMode, toggleAppMode, mounted } = useTheme();
  const isLight = appMode === "light";

  if (!mounted) return <div className="w-[72px] h-[36px] rounded-full bg-[var(--border)] animate-pulse" />;

  return (
    <button
      onClick={(e) => toggleAppMode(e)}
      className={cn(
        "relative flex items-center w-[72px] h-[36px] p-1 rounded-full border shadow-inner transition-colors duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isLight 
          ? "bg-slate-200 border-slate-300 justify-start" 
          : "bg-black/40 border-white/10 justify-end backdrop-blur-md"
      )}
      aria-label="Toggle App Theme"
      type="button"
    >
      {/* Track Icons */}
      <div className="absolute inset-0 flex justify-between items-center px-2.5 pointer-events-none z-0">
         <Sun size={14} className={cn("transition-colors duration-500", isLight ? "text-amber-500/50" : "text-muted/40")} />
         <Moon size={14} className={cn("transition-colors duration-500", isLight ? "text-muted/40" : "text-indigo-400/50")} />
      </div>

      {/* Sliding Thumb */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "relative z-10 flex items-center justify-center w-7 h-7 rounded-full shadow-md",
          isLight 
            ? "bg-white border border-slate-200 shadow-slate-400/30" 
            : "bg-[#1f1f2e] border border-white/10 shadow-black/50"
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
