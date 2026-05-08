"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ScrollReveal, StaggerReveal } from "@/components/ui/ScrollReveal";
import { 
  FileText, 
  ArrowLeft,
  ShoppingBag,
  Zap,
  Scale,
  Activity,
  Terminal,
  ShieldCheck
} from "lucide-react";

export default function TermsPage() {
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
            <span className="text-xl font-black tracking-tighter font-display uppercase italic">Storix Core</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-white/50 hover:text-white">
              <ArrowLeft size={16} />
              Back to Operations
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-40 pb-32 px-6 relative z-10">
        <ScrollReveal>
          <div className="space-y-6 mb-20 text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/[0.02] border border-white/10 mb-4 backdrop-blur-xl">
               <Scale size={16} className="text-emerald-400" />
               <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Grid Deployment Rules</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic leading-[0.9]">
              Deployment <span className="text-emerald-500 not-italic">Protocols</span>
            </h1>
            <p className="text-white/40 text-xl font-medium max-w-2xl leading-relaxed">
              Accepting these protocols is mandatory for all operatives utilizing the Storix supply chain network. These rules ensure grid stability and equitable resource distribution.
            </p>
          </div>
        </ScrollReveal>

        <StaggerReveal stagger={0.15} className="space-y-12">
          <section className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl hover:border-emerald-500/20 transition-all group">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-xl shadow-emerald-500/5">
                <Terminal size={28} />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight">License Agreement</h2>
            </div>
            <div className="space-y-6 text-white/40 text-lg leading-relaxed font-medium">
              <p>
                Storix grants a non-exclusive, non-transferable tactical license to deploy affiliate stores according to your registered plan status.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                 {[
                   { label: "Free Operative", value: "10 Stores" },
                   { label: "Pro Commander", value: "100 Stores" },
                   { label: "Business Elite", value: "Unlimited Grid" }
                 ].map((tier, i) => (
                   <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 border-beam">
                      <p className="text-[10px] font-black uppercase text-emerald-500 mb-1">{tier.label}</p>
                      <p className="text-white text-sm font-bold italic">{tier.value}</p>
                   </div>
                 ))}
              </div>
            </div>
          </section>

          <section className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl hover:border-amber-500/20 transition-all group">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-xl shadow-amber-500/5">
                <Activity size={28} />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight">Operational Conduct</h2>
            </div>
            <div className="space-y-6 text-white/40 text-lg leading-relaxed font-medium">
              <p>
                Operatives are prohibited from utilizing automated scrapers or malicious bot networks to spoof store clicks. Violation of click-through integrity results in immediate terminal blacklisting and asset forfeiture.
              </p>
            </div>
          </section>

          <section className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl hover:border-cyan-500/20 transition-all group">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-xl shadow-cyan-500/5">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight">Liability Limitation</h2>
            </div>
            <div className="space-y-6 text-white/40 text-lg leading-relaxed font-medium">
              <p>
                Storix acts as an integration layer between suppliers and storefronts. We are not liable for external marketplace pricing variances, commission disputes, or regional trade restrictions.
              </p>
            </div>
          </section>
        </StaggerReveal>

        <ScrollReveal delay={0.8}>
          <div className="mt-32 p-12 rounded-[3.5rem] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent border border-white/10 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <h3 className="text-3xl font-black mb-4 italic italic tracking-tight">Acknowledge Protocol Update?</h3>
            <p className="text-white/30 text-lg mb-10 max-w-md mx-auto font-medium">By continuing deployment, you certify total compliance with current-grid-version 2.4.0.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link href="/signup">
                 <Button className="h-16 px-16 rounded-[1.5rem] shadow-2xl shadow-emerald-500/20 font-black italic">I AGREE</Button>
               </Link>
               <Link href="/">
                 <Button variant="secondary" className="h-16 px-12 rounded-[1.5rem] border-white/10 font-black">REJECT</Button>
               </Link>
            </div>
          </div>
        </ScrollReveal>
      </main>

      {/* Footer Copy */}
      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 italic">
          STORIX CORE REGISTRY // VERIFICATION: SUCCESS
        </p>
      </footer>
    </div>
  );
}
