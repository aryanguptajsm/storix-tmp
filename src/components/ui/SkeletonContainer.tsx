"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  text: string;
  icon: LucideIcon;
  color: string;
}

interface SkeletonContainerProps {
  steps: Step[];
  children?: React.ReactNode;
  title?: string;
  className?: string;
}

export function SkeletonContainer({ steps, children, title = "System Authorization in Progress", className }: SkeletonContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1000); // Slightly faster for sub-pages
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className={cn("min-h-[60vh] flex flex-col items-center justify-center relative overflow-hidden", className)}>
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-pulse-breathing" />
        <div className="absolute inset-0 grid-bg-premium opacity-10" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto px-6">
        {/* Central Scanner */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative mb-12"
        >
          {/* Outer Pulsing Rings */}
          <div className="absolute inset-0 -m-6 rounded-full border border-primary/20 animate-pulse-ring" />
          
          <div className="w-24 h-24 rounded-[2rem] bg-black/60 border border-primary/20 flex items-center justify-center relative overflow-hidden shadow-2xl backdrop-blur-xl">
             <div className="absolute inset-0 grid-bg-dots opacity-20" />
             
             {/* Scanning Line */}
             <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-primary/40 z-20 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
             />

             <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
                  className="relative z-10"
                >
                  {React.createElement(steps[currentStep].icon, {
                    size: 32,
                    className: steps[currentStep].color
                  })}
                </motion.div>
             </AnimatePresence>
          </div>
        </motion.div>

        {/* Status Log */}
        <div className="flex flex-col items-center space-y-4 mb-16 h-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <h2 className="text-lg font-black italic tracking-widest text-white uppercase flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#10B981]" />
                {steps[currentStep].text}
              </h2>
              <div className="flex items-center gap-1.5">
                 {steps.map((_, idx) => (
                   <motion.div 
                     key={idx}
                     animate={{ 
                       scale: idx === currentStep ? 1.2 : 1,
                       backgroundColor: idx <= currentStep ? "var(--color-primary)" : "rgba(255,255,255,0.05)"
                     }}
                     className="w-1 h-1 rounded-full"
                   />
                 ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Page Content Skeleton */}
        <div className="w-full">
           {children}
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          className="text-[9px] uppercase font-black tracking-[0.5em] text-white mt-12"
        >
          {title}
        </motion.p>
      </div>
    </div>
  );
}
