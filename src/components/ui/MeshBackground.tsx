"use client";

import React from "react";
import { motion } from "framer-motion";

export function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-black">
      {/* Primary Blob */}
      <motion.div
        className="mesh-blob bg-emerald-500/10 animate-mesh-drift top-[-10%] left-[-10%]"
      />
      
      {/* Secondary Blob */}
      <motion.div
        className="mesh-blob bg-cyan-500/10 animate-mesh-drift-slow top-[20%] right-[-10%] delay-1000"
      />
      
      {/* Tertiary Blob */}
      <motion.div
        className="mesh-blob bg-blue-500/5 animate-mesh-drift bottom-[-20%] left-[30%]"
      />
      
      {/* Quaternary Blob */}
      <motion.div
        className="mesh-blob bg-emerald-400/5 animate-mesh-drift-slow bottom-[-10%] right-[10%] opacity-50"
      />
      
      {/* Ambient Noise */}
      <div className="absolute inset-0 noise-subtle opacity-[0.03]" />
      
      {/* Global Grain/Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-[100px]" />
    </div>
  );
}
