"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-2 group/field">
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted/60 transition-colors group-focus-within/field:text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within/field:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full px-4 py-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-foreground placeholder:text-muted/30 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white/[0.04] transition-all duration-300",
            icon ? "pl-12" : "",
            error ? "border-danger/30 focus:ring-danger/10" : "",
            className
          )}
          {...props}
        />
        {/* Subtle noise texture on focus */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-focus-within/field:opacity-10 transition-opacity noise-subtle" />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold text-danger uppercase tracking-wider pl-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}


interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-muted">{label}</label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 resize-none ${
          error ? "border-danger/50 focus:ring-danger/30" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
