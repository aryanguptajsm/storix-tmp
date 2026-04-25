"use client";

import React from "react";
import { Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { appMode, toggleAppMode } = useTheme();
  const isLight = appMode === "light";

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => toggleAppMode(e)}
      className="relative flex items-center justify-between w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all group overflow-hidden border border-white/[0.05] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.15] active:border-primary/40 cursor-pointer shadow-lg shadow-black/20"
      aria-label="Toggle App Theme"
    >
      {/* Background Reactive Layer */}
      <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-all duration-700 blur-xl ${
        isLight ? "bg-warning" : "bg-primary"
      }`} />
      
      {/* Animated Scan Line - More subtle and precise */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent animate-beam-sweep" />
      </div>

      <div className="relative z-10 flex items-center gap-4">
        <div className="relative w-7 h-7 flex items-center justify-center">
          {/* Circular Glow behind icon */}
          <div className={`absolute inset-0 rounded-full blur-md opacity-30 transition-colors duration-500 ${
            isLight ? "bg-warning shadow-[0_0_15px_rgba(253,203,110,0.5)]" : "bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          }`} />
          
          <AnimatePresence mode="wait">
            {isLight ? (
              <motion.div
                key="sun"
                initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.5, rotate: 180, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-warning relative z-10"
              >
                <Sun size={20} strokeWidth={2.5} />
                <motion.div 
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 blur-sm text-warning"
                >
                  <Sun size={20} strokeWidth={4} />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ scale: 0.5, rotate: 180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.5, rotate: -180, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-primary-light relative z-10"
              >
                <Moon size={20} strokeWidth={2.5} />
                <motion.div 
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                  className="absolute inset-0 blur-sm text-primary-light"
                >
                  <Moon size={20} strokeWidth={4} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-white/40 group-hover:text-white/60 transition-colors">
            Mode
          </span>
          <span className={`font-black transition-colors duration-500 ${isLight ? "text-warning" : "text-primary"}`}>
            {isLight ? "Solar" : "Lunar"}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center">
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 opacity-60 group-hover:opacity-100 group-hover:border-white/15 transition-all">
          <Sparkles 
            size={14} 
            className={`transition-colors duration-500 animate-pulse-breathing ${isLight ? "text-warning" : "text-primary"}`} 
          />
        </div>
      </div>
    </motion.button>
  );
}

