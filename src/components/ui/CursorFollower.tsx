"use client";

import React, { useEffect, useState } from "react";

export function CursorFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName === "BUTTON" ||
        target.tagName === "A"
      );
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999] transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${position.x - 4}px, ${position.y - 4}px) scale(${isPointer ? 2 : 1})`,
        }}
      />
      {/* Outer halo */}
      <div
        className="fixed top-0 left-0 w-8 h-8 border border-primary/30 rounded-full pointer-events-none z-[9998] transition-all duration-300 ease-out"
        style={{
          transform: `translate(${position.x - 16}px, ${position.y - 16}px) scale(${isPointer ? 2.5 : 1})`,
          backgroundColor: isPointer ? "rgba(16, 185, 129, 0.1)" : "transparent",
        }}
      />
      {/* Refined Mesh Spotlight */}
      <div
        className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-[9990] transition-opacity duration-1000 ease-in-out mix-blend-screen opacity-20"
        style={{
          transform: `translate(${position.x - 250}px, ${position.y - 250}px)`,
        }}
      />
      {/* Interactive Core Glow */}
      <div
        className="fixed top-0 left-0 w-32 h-32 bg-primary/40 rounded-full blur-[40px] pointer-events-none z-[9991] transition-transform duration-500 ease-out opacity-30"
        style={{
          transform: `translate(${position.x - 64}px, ${position.y - 64}px)`,
        }}
      />
    </>
  );
}
