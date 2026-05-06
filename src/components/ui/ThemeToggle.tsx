"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { appMode, toggleAppMode, mounted } = useTheme();
  const isLight = appMode === "light";

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => toggleAppMode(e)}
      className="theme-toggle group"
      aria-label="Toggle App Theme"
      type="button"
    >
      <div className="theme-toggle__beam" />
      <div className="theme-toggle__copy">
        <span className="theme-toggle__eyebrow">Interface</span>
        <span className="theme-toggle__value">
          {mounted ? (isLight ? "Light Mode" : "Dark Mode") : "Theme"}
        </span>
      </div>
      <div className="theme-toggle__track" aria-hidden="true">
        <span className={`theme-toggle__label ${isLight ? "is-active" : ""}`}>Light</span>
        <span className={`theme-toggle__label ${!isLight ? "is-active" : ""}`}>Dark</span>
        <motion.span
          className="theme-toggle__thumb"
          initial={false}
          animate={{ x: isLight ? 0 : 44 }}
          transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.9 }}
        >
          <span className="theme-toggle__thumb-icon">
            {isLight ? <Sun size={15} strokeWidth={2.25} /> : <Moon size={15} strokeWidth={2.25} />}
          </span>
        </motion.span>
      </div>
    </motion.button>
  );
}
