"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; size: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, size, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    if (onClick) onClick(e);
  };

  const base =
    "relative inline-flex items-center justify-center gap-2 font-bold rounded-3xl transition-colors duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/40 overflow-hidden";

  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/20",
    secondary:
      "bg-surface-light text-foreground border border-white/5 hover:border-primary/20",
    outline:
      "bg-transparent text-foreground border border-white/10 hover:border-primary/30",
    ghost:
      "text-muted hover:text-foreground hover:bg-white/5",
    danger:
      "bg-danger/10 text-danger border border-danger/10 hover:bg-danger/20",
  };

  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-[10px] uppercase tracking-widest",
    md: "px-6 py-3 text-xs uppercase tracking-widest",
    lg: "px-8 py-4 text-sm uppercase tracking-widest",
    icon: "w-11 h-11 p-2.5",
  };

  const springTransition = {
    type: "spring",
    stiffness: 400,
    damping: 15
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={springTransition}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...(props as any)}
    >
      {/* Ripple Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-0">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              onAnimationComplete={() => {
                setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
              }}
              className="absolute bg-white/30 rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                x: "-50%",
                y: "-50%",
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Light Sweep Effect for Primary */}
      {variant === "primary" && !disabled && (
        <motion.span
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none z-0"
        />
      )}

      {loading ? (
        <svg
          className="animate-spin h-4 w-4 relative z-10"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      )}
    </motion.button>
  );
}
