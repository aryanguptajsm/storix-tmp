"use client";

import { motion } from "framer-motion";

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
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-colors duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/40 overflow-hidden";

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
      {...(props as any)}
    >
      {/* Light Sweep Effect for Primary */}
      {variant === "primary" && !disabled && (
        <motion.span
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none"
        />
      )}

      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
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
