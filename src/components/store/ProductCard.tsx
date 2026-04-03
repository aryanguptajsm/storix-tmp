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
    <div className="group relative flex flex-col bg-[var(--store-card)] rounded-2xl md:rounded-3xl border border-[var(--store-border)] hover:border-[var(--store-primary)]/30 transition-all duration-500 overflow-hidden card-3d hover-lift font-sans">
      {/* Corner glow on hover */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--store-primary)]/0 group-hover:bg-[var(--store-primary)]/8 rounded-full blur-3xl transition-all duration-700 pointer-events-none" />

      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-white/[0.98] to-slate-50 flex items-center justify-center">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            priority={priority}
            className="object-contain p-5 scale-[0.92] group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <ShoppingBag className="w-14 h-14 text-slate-200" />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[9px] font-black text-[var(--store-primary)] uppercase tracking-wider border border-[var(--store-primary)]/10 shadow-sm">
            <Zap size={9} className="fill-[var(--store-primary)]" />
            {product.platform}
          </div>

          {hasDiscount && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500 text-[9px] font-black text-white uppercase tracking-wider shadow-lg shadow-green-500/25">
              <TrendingUp size={9} />
              {product.discount_percentage || "Best"} Deal
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 pt-3 flex-1 flex flex-col">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Sparkles key={i} size={9} className={i <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
          ))}
          <span className="text-[10px] font-semibold text-[var(--store-foreground)]/40 ml-1">4.8</span>
        </div>

        <h3 className="font-bold text-sm md:text-base line-clamp-2 leading-snug mb-4 group-hover:text-[var(--store-primary)] transition-colors duration-300 min-h-[2.5rem]">
          {product.title}
        </h3>

        <div className="mt-auto space-y-4">
          {/* Price */}
          <div className="flex flex-col gap-0.5">
            {hasDiscount && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--store-foreground)]/30 line-through font-medium">
                  {product.original_price}
                </span>
                <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                  SAVE {product.discount_percentage}%
                </span>
              </div>
            )}

            <div className="flex items-end justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[var(--store-foreground)]/30 uppercase tracking-widest mb-0.5">Price</span>
                <div className="text-2xl md:text-3xl font-black text-[var(--store-primary)] tracking-tight group-hover:scale-105 transition-transform origin-left duration-500">
                  {product.price || "Check Price"}
                </div>
              </div>

              <div className="flex items-center text-[8px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full border border-teal-100 whitespace-nowrap">
                <ShieldCheck size={9} className="mr-1" />
                SECURE
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <Button
            className="w-full h-12 md:h-13 rounded-xl bg-[var(--store-primary)] hover:bg-[var(--store-primary)]/90 text-white shadow-lg shadow-[var(--store-primary)]/15 hover:shadow-xl hover:shadow-[var(--store-primary)]/25 flex items-center justify-center gap-2.5 font-bold text-xs uppercase tracking-wider group/btn border-none transform active:scale-95 transition-all hover-shine"
            onClick={() => onBuyNow(product)}
          >
            <ShoppingBag size={16} className="group-hover/btn:rotate-12 transition-transform" />
            <span>Grab This Deal</span>
            <ExternalLink size={14} className="opacity-40 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
          </Button>
        </div>
      </div>
    </div>
  );
}
