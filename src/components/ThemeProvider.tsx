"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "default" | "midnight" | "minimalist" | "neon" | "amazon" | "flipkart";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  appMode: "light" | "dark";
  toggleAppMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  initialTheme = "default" 
}: { 
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [appMode, setAppMode] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("storix-app-mode") as "light" | "dark";
    if (savedMode) {
      setAppMode(savedMode);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setAppMode("light");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-app-theme", appMode);
    localStorage.setItem("storix-app-mode", appMode);
  }, [theme, appMode, mounted]);

  const toggleAppMode = (event?: React.MouseEvent | MouseEvent) => {
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setAppMode(prev => prev === "light" ? "dark" : "light");
      return;
    }

    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setAppMode(prev => prev === "light" ? "dark" : "light");
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: appMode === "dark" ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 500,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: appMode === "dark" ? "::view-transition-new(root)" : "::view-transition-old(root)",
        }
      );
    });
  };
 pieces of information.
  return (
    <ThemeContext.Provider value={{ theme, setTheme, appMode, toggleAppMode }}>
      <div className={`theme-${theme} mode-${appMode} min-h-screen transition-colors duration-500`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
