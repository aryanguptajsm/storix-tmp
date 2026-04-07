"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Lock, Eye, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 grid-bg-low-vis opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

      <nav className="fixed top-0 w-full z-50 glass border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-all">
                <ArrowLeft size={18} className="text-white/40 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.3em] text-white/60">Return to Command</span>
          </Link>
          <div className="flex items-center gap-2">
             <Shield className="text-emerald-500 w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Secure Protocol</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-40 pb-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-8">
             <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Lock className="text-emerald-500 w-7 h-7" />
             </div>
             <div>
                <h1 className="text-5xl font-black tracking-tighter">Privacy Policy</h1>
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Registry Version 1.0.4</p>
             </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-12">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                 <Eye size={18} />
                 <h2 className="text-xl font-black uppercase tracking-widest m-0">Data Collection</h2>
              </div>
              <p className="text-white/60 leading-relaxed text-lg">
                At Storix, we collect only the necessary telemetry required to maintain your affiliate nodes. This includes your email address for authentication and profile metadata for store personalization. We do not track your personal browsing history outside of the Storix platform.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                 <Globe size={18} />
                 <h2 className="text-xl font-black uppercase tracking-widest m-0">Universal Grid Usage</h2>
              </div>
              <p className="text-white/60 leading-relaxed text-lg">
                Your store data is stored securely on the universal commerce grid. We use industry-standard encryption to protect your supply chain signals and earnings reports. Third-party trackers are minimized and only used for essential performance analytics.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                 <FileText size={18} />
                 <h2 className="text-xl font-black uppercase tracking-widest m-0">Automated Processing</h2>
              </div>
              <p className="text-white/60 leading-relaxed text-lg">
                Storix AI processes product links to extract images and pricing data. This processing is ephemeral and designed to optimize your storefront configuration. We do not sell your extracted data to shadow registries or third-party advertisers.
              </p>
            </section>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
               <h3 className="text-white font-black uppercase tracking-widest text-sm">Contact Registry Command</h3>
               <p className="text-white/40 text-sm italic">
                  For data archival requests or protocol inquiries, please uplink to our support core at:
               </p>
               <p className="text-emerald-500 font-black tracking-widest">COMMAND@STORIX.AI</p>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="py-12 border-t border-white/5 text-center">
         <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">© 2026 Storix Core Registry. Data Sovereign Active.</p>
      </footer>
    </div>
  );
}
