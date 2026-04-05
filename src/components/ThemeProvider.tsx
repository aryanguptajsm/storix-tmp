"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "default" | "midnight" | "minimalist" | "neon" | "amazon" | "flipkart";

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

  const toggleAppMode = () => {
    setAppMode(prev => prev === "light" ? "dark" : "light");
  };

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
