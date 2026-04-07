"use client";

import { motion } from "framer-motion";

export function DashboardEntrance() {
  return null; // This is a logic-only component or we can add global entrance effects here
}

export function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
