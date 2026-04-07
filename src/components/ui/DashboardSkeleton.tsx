"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Zap, Shield, Cpu, Activity } from "lucide-react";

const LOADING_STEPS = [
  { id: 1, text: "Linking Merchant Nodes...", icon: Globe, color: "text-primary" },
  { id: 2, text: "Synchronizing Data Grid...", icon: Activity, color: "text-secondary" },
  { id: 3, text: "Authenticating Command Terminal...", icon: Shield, color: "text-accent" },
  { id: 4, text: "Establishing Secure Handshake...", icon: Zap, color: "text-primary-light" },
  { id: 5, text: "Accessing Strategic Interface...", icon: Cpu, color: "text-white" },
];

export function DashboardSkeleton() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020205] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-breathing" />
        <div className="absolute inset-0 grid-bg-premium opacity-30" />
        <div className="absolute inset-0 noise-subtle opacity-40" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Central Scanner */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="relative mb-16"
        >
          {/* Outer Pulsing Rings */}
          <div className="absolute inset-0 -m-8 rounded-full border border-primary/20 animate-pulse-ring" />
          <div className="absolute inset-0 -m-16 rounded-full border border-primary/10 animate-pulse-ring animation-delay-500" />
          
          <div className="w-32 h-32 rounded-3xl bg-black/60 border border-primary/30 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-primary/20 backdrop-blur-xl group">
             <div className="absolute inset-0 grid-bg-dots opacity-40" />
             <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
             
             {/* Scanning Line */}
             <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-primary/50 z-20 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
             />

             <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                  className="relative z-10"
                >
                  {React.createElement(LOADING_STEPS[currentStep].icon, {
                    size: 48,
                    className: LOADING_STEPS[currentStep].color
                  })}
                </motion.div>
             </AnimatePresence>
          </div>
        </motion.div>

        {/* Status Log */}
        <div className="flex flex-col items-center space-y-4 min-h-[100px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <h2 className="text-xl font-black italic tracking-widest text-white uppercase flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#10B981]" />
                {LOADING_STEPS[currentStep].text}
              </h2>
              <div className="flex items-center gap-2">
                 {LOADING_STEPS.map((step, idx) => (
                   <motion.div 
                     key={step.id}
                     animate={{ 
                       scale: idx === currentStep ? 1.2 : 1,
                       bg: idx <= currentStep ? "var(--color-primary)" : "rgba(255,255,255,0.1)"
                     }}
                     className={`w-1.5 h-1.5 rounded-full ${idx <= currentStep ? "bg-primary" : "bg-white/10"}`}
                   />
                 ))}
              </div>
            </motion.div>
          </AnimatePresence>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="text-[10px] uppercase font-black tracking-[0.4em] text-white mt-8"
          >
            System Authorization in Progress
          </motion.p>
        </div>
      </div>
    </div>
  );
}

