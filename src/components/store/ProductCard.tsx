"use client";

import React from "react";
import Image from "next/image";
import { 
  ExternalLink, 
  Tag, 
  ShoppingBag, 
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Product {
  id: string;
  title: string;
  image_url: string;
  platform: string;
  price: string;
  original_price?: string;
  discount_percentage?: string;
  original_url: string;
}

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
  isLoading?: boolean;
  priority?: boolean;
}

export function ProductCard({ product, onBuyNow, priority = false }: ProductCardProps) {
  const hasDiscount = product.original_price && product.original_price !== product.price;
  
  return (
    <div className="group relative flex flex-col bg-[var(--store-card)] rounded-[2rem] border border-[var(--store-border)] hover:border-[var(--store-primary)]/40 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-[var(--store-primary)]/10 overflow-hidden hover-lift animate-scale-in font-sans">
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--store-primary)]/5 to-transparent pointer-events-none rounded-bl-[4rem]" />
      
      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-6">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            priority={priority}
            className="object-contain p-6 scale-95 group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <ShoppingBag className="w-16 h-16 text-slate-200" />
        )}

        {/* Dynamic Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-morphism-premium text-[10px] font-black text-[var(--store-primary)] uppercase tracking-widest border border-[var(--store-primary)]/20 shadow-sm">
            <Zap size={10} className="fill-[var(--store-primary)]" />
            {product.platform} Verified
          </div>
          
          {hasDiscount && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-green-500/20 animate-pulse-subtle">
              <TrendingUp size={10} />
              {product.discount_percentage || "Best"} Deal
            </div>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-[var(--store-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* content Section */}
      <div className="p-6 pt-2 flex-1 flex flex-col">
        {/* Rating Mockup */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Sparkles key={i} size={10} className={i <= 4 ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
          ))}
          <span className="text-[10px] font-bold text-muted ml-1">4.8 / 5.0</span>
        </div>

        <h3 className="font-extrabold text-base md:text-lg line-clamp-2 leading-tight mb-4 group-hover:text-[var(--store-primary)] transition-colors duration-300 min-h-[3rem]">
          {product.title}
        </h3>

        <div className="mt-auto space-y-5">
          {/* Pricing Engine */}
          <div className="flex flex-col gap-1">
            {hasDiscount && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 line-through font-bold">
                  {product.original_price}
                </span>
                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                  SAVE {product.discount_percentage}%
                </span>
              </div>
            )}
            
            <div className="flex items-end justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Final Price</span>
                <div className="text-3xl font-black text-[var(--store-primary)] tracking-tighter group-hover:scale-110 transition-transform origin-left duration-500">
                  {product.price || "Check Price"}
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                 <div className="flex items-center text-[#24A3B5] text-[9px] font-black bg-[#24A3B5]/5 px-2.5 py-1 rounded-full border border-[#24A3B5]/10 mb-1">
                   <ShieldCheck size={10} className="mr-1" /> SECURE DEAL
                 </div>
                 <span className="text-[9px] font-bold text-muted-foreground uppercase">limited stock</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full h-14 rounded-2xl bg-[var(--store-primary)] hover:bg-[var(--store-primary)]/90 text-white shadow-xl shadow-[var(--store-primary)]/20 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] group/btn border-none transform active:scale-95 transition-all hover-shine"
            onClick={() => onBuyNow(product)}
          >
            <ShoppingBag size={18} className="group-hover/btn:rotate-12 transition-transform" />
            <span>Grab This Deal</span>
            <ExternalLink size={16} className="opacity-50 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-all" />
          </Button>
        </div>
      </div>
    </div>
  );
}
