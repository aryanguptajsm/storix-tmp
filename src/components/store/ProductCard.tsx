"use client";

import React from "react";
import Image from "next/image";
import {
  ExternalLink,
  ShoppingBag,
  Zap,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
  isLoading?: boolean;
  priority?: boolean;
}

export function ProductCard({ product, onBuyNow, priority = false }: ProductCardProps) {
  const hasDiscount = product.original_price && product.original_price !== product.price;

  return (
    <div className="group relative flex flex-col bg-[var(--store-card)] rounded-md border border-[var(--store-border)] hover:border-[var(--store-primary)]/40 hover:shadow-xl transition-all duration-300 font-sans h-full">
      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden bg-white flex items-center justify-center p-4 border-b border-[var(--store-border)]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            priority={priority}
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <ShoppingBag className="w-10 h-10 text-slate-100" />
        )}

        {/* Retail Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-black/80 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-[0.1em]">
            <Zap size={8} className="text-amber-400" />
            {product.platform}
          </div>

          {hasDiscount && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-red-600 text-[8px] font-black text-white uppercase tracking-[0.1em]">
               Deal
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Amazon/Flipkart Style Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Sparkles key={i} size={8} className={i <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-muted/40">4,281 ratings</span>
        </div>

        <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-3 text-white group-hover:text-[var(--store-primary)] transition-colors min-h-[2.5rem]">
          {product.title}
        </h3>

        <div className="mt-auto pt-3 border-t border-white/5">
          {/* Detailed Pricing */}
          <div className="flex flex-col mb-4">
            {hasDiscount && (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] text-red-500 font-bold">-{product.discount_percentage}%</span>
                <span className="text-[10px] text-white/30 line-through font-medium">
                  {product.original_price}
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-bold text-white/40 uppercase mb-0.5">$</span>
              <span className="text-2xl font-black text-white tracking-tight leading-none">
                {product.price?.replace('$', '') || "0"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-9 rounded-sm border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/5"
              onClick={() => onBuyNow(product)}
            >
              Details
            </Button>
            <Button
              className="h-9 rounded-sm bg-[var(--store-primary)] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[var(--store-primary)]/90 shadow-lg shadow-[var(--store-primary)]/10"
              onClick={() => onBuyNow(product)}
            >
              <ShoppingBag size={12} className="mr-1.5" />
              Buy Now
            </Button>
          </div>
          
          <div className="mt-3 flex items-center gap-1.5">
             <ShieldCheck size={10} className="text-emerald-500" />
             <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Safe Affiliate Link</span>
          </div>
        </div>
      </div>
    </div>
  );
}
