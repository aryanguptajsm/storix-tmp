"use client";

import React from "react";
import { ShoppingBag, Share2, Menu, Sparkles, ChevronLeft, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface StoreHeaderProps {
  storeName: string;
  storeLogo?: string | null;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function StoreHeader({ storeName, storeLogo, searchValue, onSearchChange }: StoreHeaderProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${storeName} | Storix`,
        text: `Check out this amazing storefront on Storix!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      import("sonner").then(({ toast }) => toast.success("Store link copied to clipboard!"));
    }
  };

  return (
    <nav className="fixed top-0 z-[60] w-full bg-[var(--store-card)] border-b border-[var(--store-border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 md:h-18 flex items-center justify-between gap-4 md:gap-8">
        {/* Left: Logo & Brand */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[var(--store-primary)] to-[var(--store-primary)]/80 rounded-md flex items-center justify-center shadow-md group-hover:scale-105 transition-all overflow-hidden border border-white/5">
            {storeLogo ? (
              <img src={storeLogo} alt={storeName} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-white" />
            )}
          </div>
          <span className="hidden sm:block text-lg md:text-xl font-black tracking-tighter text-[var(--store-foreground)] group-hover:text-[var(--store-primary)] transition-colors">
            {storeName}
          </span>
        </Link>
        
        {/* Center: Search Bar (Amazon/Flipkart Style) */}
        <div className="flex-1 max-w-2xl relative group">
          <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-muted/40 group-focus-within:text-[var(--store-primary)] transition-colors">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={`Search in ${storeName}...`}
            className="w-full h-10 md:h-11 bg-white/[0.03] border border-white/5 rounded-md pl-10 md:pl-12 pr-10 md:pr-12 text-sm font-medium text-[var(--store-foreground)] placeholder:text-[var(--store-foreground)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)]/20 focus:border-[var(--store-primary)] transition-all"
          />
          {searchValue && (
            <button 
              onClick={() => onSearchChange?.("")}
              className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center text-white/20 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare}
            className="w-10 h-10 rounded-md text-[var(--store-foreground)]/40 hover:text-[var(--store-primary)] hover:bg-[var(--store-primary)]/10 transition-all border border-transparent hover:border-[var(--store-primary)]/20"
          >
            <Share2 size={16} />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden w-10 h-10 rounded-md border border-white/5"
          >
            <Menu size={18} />
          </Button>

          <Link href="#products" className="hidden lg:block">
            <Button size="sm" className="h-10 px-6 rounded-md bg-[var(--store-primary)] text-white font-black text-[10px] uppercase tracking-wider group">
              <span>Best Deals</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Category Nav - Shopping Mall Style */}
      <div className="hidden md:flex bg-black/20 border-t border-[var(--store-border)] h-10 md:h-12 items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center gap-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 shrink-0">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Live Deals
          </div>
          <div className="w-px h-4 bg-white/5 shrink-0" />
          {['Electronics', 'Fashion', 'Home', 'Beauty', 'Offers'].map((cat) => (
            <button key={cat} className="text-[10px] font-bold uppercase tracking-widest text-[var(--store-foreground)]/40 hover:text-[var(--store-foreground)] transition-colors whitespace-nowrap">
              {cat}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
