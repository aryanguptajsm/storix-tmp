"use client";

import React from "react";
import { motion, useInView, Variant } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "zoom-in";
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

const revealVariants: Record<string, { hidden: any; visible: any }> = {
  "fade-up": {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  "slide-right": {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  "zoom-in": {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
};

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.8,
  staggerChildren = 0,
  threshold = 0.1,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { amount: threshold, once });

  const selectedVariant = revealVariants[variant];

  // If staggering children, use container variant
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerChildren,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: selectedVariant.hidden,
    visible: {
      ...selectedVariant.visible,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1], // Custom cinematic spring-like ease
      },
    },
  };

  if (staggerChildren > 0) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
        className={className}
      >
        {React.Children.map(children, (child) => (
          <motion.div variants={itemVariants}>{child}</motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerReveal({ 
  children, 
  stagger = 0.1, 
  delay = 0, 
  className = "" 
}: { 
  children: React.ReactNode; 
  stagger?: number; 
  delay?: number;
  className?: string;
}) {
  return (
    <ScrollReveal 
      staggerChildren={stagger} 
      delay={delay} 
      className={className}
    >
      {children}
    </ScrollReveal>
  );
}
