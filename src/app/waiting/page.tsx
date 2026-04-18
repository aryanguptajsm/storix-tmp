"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sparkles, Send, CheckCircle2, ArrowRight } from "lucide-react";
import DotField from "@/components/ui/DotField";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function WaitingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center p-6 selection:bg-emerald-500/30 selection:text-white">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <DotField 
          dotRadius={1.2} 
          dotSpacing={18} 
          passiveSpeed={1.5} 
          gradientFrom="rgba(16, 185, 129, 0.4)" 
          gradientTo="rgba(0, 206, 201, 0.2)"
        />
      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-mesh-drift" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none animate-mesh-drift-slow" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <SpotlightCard className="w-full !p-0 overflow-hidden border-white/10 shadow-emerald-500/5">
            <div className="p-8 md:p-16 flex flex-col items-center text-center">
              
              {/* Logo */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-10"
              >
                <ShoppingBag className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  Storix is <span className="text-emerald-400">Manifesting.</span>
                </h1>
                <p className="text-lg md:text-xl text-white/40 mb-12 font-medium max-w-md mx-auto leading-relaxed">
                  The future of affiliate commerce is being built in the shadows. Join the pulse and be first when we stabilize.
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.6 }}
                    onSubmit={handleSubmit}
                    className="w-full max-w-md space-y-4"
                  >
                    <div className="relative group">
                      <Input
                        type="email"
                        placeholder="Enter your email to join the wave"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-16 !bg-white/[0.03] border-white/10 focus:border-emerald-500/50 pr-32 text-center md:text-left md:pl-8 text-lg"
                      />
                      <div className="md:absolute right-2 top-2 bottom-2 mt-4 md:mt-0 flex items-center">
                        <Button 
                          type="submit" 
                          loading={isLoading}
                          className="w-full md:w-auto h-full px-8 rounded-xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          Join Wave
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
                       Zero Noise • Pure Commerce • AI Powered
                    </p>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">You're in the Loop</h3>
                    <p className="text-white/40 mb-8 font-medium">We'll ping you as soon as the doors open.</p>
                    <Button variant="ghost" onClick={() => setIsSubmitted(false)}>
                      Change Email
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Footer decoration */}
            <div className="h-2 w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-30" />
          </SpotlightCard>
        </motion.div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/20"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Beta Stabilization
          </div>
          <div className="hidden md:block w-px h-4 bg-white/5" />
          <span>© 2026 Storix Core</span>
          <div className="hidden md:block w-px h-4 bg-white/5" />
          <div className="flex items-center gap-2">
             <Sparkles size={12} className="text-emerald-500/40" />
             AI Enhanced
          </div>
        </motion.div>
      </div>

      {/* Extreme Low-Vis Noise overlay */}
      <div className="absolute inset-0 noise-subtle opacity-[0.03] pointer-events-none" />
    </div>
  );
}
