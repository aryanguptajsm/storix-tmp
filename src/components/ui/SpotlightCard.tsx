"use client";

import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Position {
  x: number;
  y: number;
}

/**
 * SpotlightCardProps - Configuration for the SpotlightCard component.
 */
interface SpotlightCardProps extends React.PropsWithChildren {
  /** Additional CSS classes for the card container */
  className?: string;
  /** 
   * Background color for the spotlight effect.
   * @default "rgba(16, 185, 129, 0.15)" (Storix Emerald)
   * @example "rgba(255, 255, 255, 0.1)"
   */
  spotlightColor?: string;
}

/**
 * SpotlightCard - A premium interactive card component with a mouse-following light effect.
 * 
 * Features:
 * - Dynamic radial gradient spotlight following cursor
 * - Noise texture overlay for high-fidelity aesthetics
 * - Hover & Focus state transitions that don't block each other
 * - Optimized with useCallback and relative positioning
 * - Glassmorphism effects integrated with Storix design system
 * 
 * @param props - Component props
 */
const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(16, 185, 129, 0.15)'
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  const handleFocus = () => {
    setIsFocused(true);
    // Default to center if no mouse position yet
    if (!position && divRef.current) {
      const rect = divRef.current.getBoundingClientRect();
      setPosition({ x: rect.width / 2, y: rect.height / 2 });
    }
  };
  const handleBlur = () => setIsFocused(false);

  // Spotlight opacity logic ensuring focus and hover work together seamlessly
  const opacity = isHovered || isFocused ? 1 : 0;

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
      className={cn(
        "relative rounded-[2.5rem] border border-white/5 bg-[#0A0A0E]/80 backdrop-blur-xl overflow-hidden p-8 group transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-500/5 outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
    >
      {/* Noise Texture Overlay for Storix Aesthetic */}
      <div 
        className="absolute inset-0 noise-subtle opacity-[0.15] pointer-events-none group-hover:opacity-25 transition-opacity duration-700" 
        aria-hidden="true"
      />
      
      {/* Spotlight Gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: position 
            ? `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`
            : ''
        }}
        aria-hidden="true"
      />
      
      {/* Content wrapper to ensure it stays above the spotlight */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default SpotlightCard;

