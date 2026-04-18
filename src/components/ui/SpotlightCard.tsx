"use client";

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Position {
  x: number;
  y: number;
}

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: string;
}

/**
 * SpotlightCard - A premium card component with a mouse-following spotlight effect.
 * Adapted from React Bits for the Storix design system.
 */
const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  // Default to Storix Primary Emerald with low opacity
  spotlightColor = 'rgba(16, 185, 129, 0.2)'
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(0.6);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-2xl border border-white/5 bg-[#0A0A0E] overflow-hidden p-8 group transition-colors duration-300 hover:border-white/10",
        className
      )}
    >
      {/* Noise Texture Overlay for Storix Aesthetic */}
      <div className="absolute inset-0 noise-subtle opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-500" />
      
      {/* Spotlight Gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`
        }}
      />
      
      {/* Content wrapper to ensure it stays above the spotlight */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default SpotlightCard;
