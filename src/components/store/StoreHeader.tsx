"use client";

import React from "react";
import { ShoppingBag, Share2, Menu, Sparkles, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface StoreHeaderProps {
  storeName: string;
  storeLogo?: string | null;
}

export function StoreHeader({ storeName, storeLogo }: StoreHeaderProps) {
  return (
    <nav className="sticky top-0 z-[60] w-full bg-[var(--store-card)] shadow-sm border-b border-[var(--store-border)] backdrop-blur-xl bg-opacity-70 transition-all duration-300">
      {/* progress Indicator Mockup */}
      <div className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[var(--store-primary)] to-[var(--store-primary)]/20 w-0 group-hover:w-full transition-all duration-1000" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 md:h-20 flex items-center justify-between">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[var(--store-primary)] to-[var(--store-primary)]/60 rounded-xl flex items-center justify-center shadow-xl shadow-[var(--store-primary)]/20 animate-float overflow-hidden">
              {storeLogo ? (
                <img src={storeLogo} alt={storeName} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
              )}
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-[var(--store-primary)] flex items-center justify-center animate-pulse">
               <Sparkles className="w-2 h-2 text-[var(--store-primary)] fill-[var(--store-primary)]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-black tracking-tighter leading-none group-hover:text-[var(--store-primary)] transition-colors">
              {storeName}
            </span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1 opacity-60">Verified Store</span>
          </div>
        </div>
        
        {/* Center: Search/Category Links (Hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-8">
          {['Featured', 'Best Selling', 'Trending', 'New Items'].map((link) => (
            <Link 
              key={link} 
              href={`#${link.toLowerCase().replace(' ', '-')}`}
              className="text-xs font-black uppercase tracking-[0.2em] text-muted hover:text-[var(--store-primary)] transition-all relative group"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--store-primary)] transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center mr-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--store-card)] bg-slate-100 overflow-hidden shadow-sm">
                   <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-50" />
                </div>
              ))}
            </div>
            <div className="ml-3 text-[10px] font-medium text-muted whitespace-nowrap">
              <span className="font-bold text-[var(--store-foreground)]">12k+</span> active shoppers
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-2xl text-slate-600 hover:bg-[var(--store-primary)]/5 hover:text-[var(--store-primary)] transition-all group"
          >
            <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
          </Button>

          <Button 
            className="hidden md:flex h-11 md:h-12 px-6 rounded-2xl bg-[var(--store-primary)]/10 text-[var(--store-primary)] hover:bg-[var(--store-primary)] hover:text-white transition-all font-black text-xs uppercase tracking-widest border border-[var(--store-primary)]/20"
          >
            Visit Shop
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden rounded-2xl"
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>
    </nav>
  );
}
