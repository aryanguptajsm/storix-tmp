"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmailCaptureWidgetProps {
  storeOwnerId: string;
  variant?: "popup" | "inline";
}

export function EmailCaptureWidget({ storeOwnerId, variant = "inline" }: EmailCaptureWidgetProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/email-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, storeOwnerId, source: variant }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-3 p-6 rounded-3xl bg-[var(--store-primary)]/5 border border-[var(--store-primary)]/20 animate-scale-in">
        <div className="w-10 h-10 rounded-full bg-[var(--store-primary)]/20 flex items-center justify-center">
          <Check size={20} className="text-[var(--store-primary)]" />
        </div>
        <div>
          <p className="font-bold text-[var(--store-foreground)]">You&apos;re in!</p>
          <p className="text-xs text-[var(--store-foreground)]/60">We&apos;ll notify you about the best deals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-[var(--store-card)] border border-[var(--store-border)] relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-[var(--store-primary)]/5 rounded-full blur-[60px]" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--store-primary)]/10 flex items-center justify-center text-[var(--store-primary)]">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="font-bold text-[var(--store-foreground)]">Stay Updated</h3>
            <p className="text-xs text-[var(--store-foreground)]/50">Get notified when new deals drop.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--store-background)] border border-[var(--store-border)] text-[var(--store-foreground)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)]/30 focus:border-[var(--store-primary)]/50 transition-all placeholder:text-[var(--store-foreground)]/30"
          />
          <Button
            type="submit"
            disabled={status === "loading"}
            className="px-6 rounded-xl bg-[var(--store-primary)] hover:bg-[var(--store-primary)]/90 text-white shadow-lg shadow-[var(--store-primary)]/20 flex-shrink-0"
          >
            {status === "loading" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}
          </Button>
        </form>
        {status === "error" && (
          <p className="text-xs text-red-500 mt-2 font-medium animate-fade-in">Something went wrong. Try again.</p>
        )}
      </div>
    </div>
  );
}
