"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ScrollReveal, StaggerReveal } from "@/components/ui/ScrollReveal";
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  ArrowLeft,
  ShoppingBag,
  Globe,
  Zap
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Background Layers */}
      <div className="fixed inset-0 grid-bg-low-vis opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">Storix</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-white/50 hover:text-white">
              <ArrowLeft size={16} />
              Return to Base
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-40 pb-32 px-6 relative z-10">
        <ScrollReveal>
          <div className="space-y-6 mb-20 text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
              Security Protocol
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic">
              Privacy <span className="text-emerald-500 not-italic">Manifesto</span>
            </h1>
            <p className="text-white/40 text-xl font-medium max-w-2xl leading-relaxed">
              Your data sovereignty is our highest priority. This protocol outlines how we encrypt, manage, and protect your digital footprint across the Storix grid.
            </p>
          </div>
        </ScrollReveal>

        <StaggerReveal stagger={0.15} className="space-y-12">
          <section className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl hover:border-emerald-500/20 transition-all group">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-xl shadow-emerald-500/5">
                <Eye size={28} />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight">Signal Interception</h2>
            </div>
            <div className="space-y-6 text-white/40 text-lg leading-relaxed font-medium">
              <p>
                We capture minimal data points essential for operational efficiency. This includes your unique identifier, session telemetry, and store configuration parameters.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Account Metadata",
                  "Inventory Sync Logs",
                  "Click Intel Data",
                  "Security Certificates"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-emerald-500/60">
                    <Zap size={14} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl hover:border-blue-500/20 transition-all group">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-xl shadow-blue-500/5">
                <Lock size={28} />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight">Encryption Core</h2>
            </div>
            <div className="space-y-6 text-white/40 text-lg leading-relaxed font-medium">
              <p>
                All data transmission between your terminal and the Storix Hive is secured using end-to-end TLS 1.3 protocols. Your private API keys are hashed and isolated within encrypted vault layers.
              </p>
            </div>
          </section>

          <section className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl hover:border-purple-500/20 transition-all group">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-xl shadow-purple-500/5">
                <Shield size={28} />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight">Registry Rights</h2>
            </div>
            <div className="space-y-6 text-white/40 text-lg leading-relaxed font-medium">
              <p>
                You maintain absolute control over your digital deployment. You may request a full system purge or data export via your mission console at any time.
              </p>
            </div>
          </section>
        </StaggerReveal>

        <ScrollReveal delay={0.8}>
          <div className="mt-32 p-12 rounded-[3rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 text-center">
            <h3 className="text-2xl font-black mb-4">Questions regarding the manifesto?</h3>
            <p className="text-white/30 mb-8 max-w-sm mx-auto">Our intelligence agents are available 24/7 for security guidance.</p>
            <Button className="px-10 h-14 rounded-2xl shadow-xl shadow-emerald-500/10">Contact Support</Button>
          </div>
        </ScrollReveal>
      </main>

      {/* Footer Copy */}
      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 italic">
          Last Revision: April 2026 // Cipher-Active: True
        </p>
      </footer>
    </div>
  );
}
