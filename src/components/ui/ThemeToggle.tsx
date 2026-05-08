"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { appMode, toggleAppMode, mounted } = useTheme();
  const isLight = appMode === "light";

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => toggleAppMode(e)}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      aria-label="Toggle App Theme"
      type="button"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isLight ? -90 : 0,
          opacity: isLight ? 0 : 1,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center text-[var(--foreground)]"
      >
        <Moon size={18} strokeWidth={2} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: isLight ? 0 : 90,
          opacity: isLight ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center text-[var(--foreground)]"
      >
        <Sun size={18} strokeWidth={2} />
      </motion.div>
    </motion.button>
  );
}
