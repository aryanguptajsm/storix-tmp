"use client";

import React from 'react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Shield, Zap, Sparkles, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SpotlightDemoPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 md:p-24 overflow-hidden relative">
      {/* Background blobs for depth */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 text-gradient"
          >
            SPOTLIGHT CARDS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted text-lg max-w-2xl mx-auto"
          >
            Premium interactive components with dynamic lighting effects. Hover over the cards to see the spotlight in action.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SpotlightCard className="h-full">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-primary/20">
                <Shield className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 italic">Secure Foundation</h3>
              <p className="text-muted text-sm leading-relaxed">
                Enterprise-grade security protocols integrated into every layer of your storefront infrastructure.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SpotlightCard className="h-full" spotlightColor="rgba(0, 206, 201, 0.2)">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-secondary/20">
                <Zap className="text-secondary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 italic">Ultra Performance</h3>
              <p className="text-muted text-sm leading-relaxed">
                Optimized with Next.js 16 and Turbopack for lightning-fast load times and instantaneous interaction.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <SpotlightCard className="h-full" spotlightColor="rgba(253, 121, 168, 0.2)">
              <div className="bg-pink-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-pink-500/20">
                <Sparkles className="text-pink-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 italic">Premium Aesthetics</h3>
              <p className="text-muted text-sm leading-relaxed">
                A curated design system focused on high-density data and clinical precision for professional users.
              </p>
            </SpotlightCard>
          </motion.div>

          {/* Large Card Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-2 lg:col-span-3"
          >
            <SpotlightCard className="flex flex-row items-center gap-12 p-12">
              <div className="hidden md:flex flex-1 aspect-video bg-neutral-900 rounded-xl border border-white/5 items-center justify-center relative overflow-hidden group/inner">
                <div className="absolute inset-0 grid-pattern opacity-20" />
                <Layout className="w-24 h-24 text-white/10 group-hover/inner:text-primary/20 transition-colors duration-700" />
              </div>
              <div className="flex-[0.8]">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                  NEW COMPONENT
                </div>
                <h3 className="text-3xl font-black mb-4 italic tracking-tight">SPOTLIGHT REACT BITS</h3>
                <p className="text-muted text-lg mb-8">
                  This component adds a sophisticated layer of interactivity to your UI. The lighting effect follows the cursor naturally, creating depth and focus on important content.
                </p>
                <div className="flex gap-4">
                  <button className="px-6 py-2 bg-white text-black font-bold rounded-lg text-sm hover:bg-neutral-200 transition-colors">
                    Integrate Now
                  </button>
                  <button className="px-6 py-2 border border-white/10 text-white font-bold rounded-lg text-sm hover:bg-white/5 transition-colors">
                    View Docs
                  </button>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
