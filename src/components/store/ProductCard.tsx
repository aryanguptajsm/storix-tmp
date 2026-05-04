"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ExternalLink,
  ShoppingBag,
  Zap,
  Star,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
  isLoading?: boolean;
  priority?: boolean;
  index?: number;
}

/** Parse the numeric value from a price string like "₹1,299" or "$19.99" */
function parsePriceDisplay(price?: string): { symbol: string; amount: string } {
  if (!price) return { symbol: "", amount: "0" };
  const cleaned = price.trim();
  // Extract currency symbol (first non-digit, non-comma, non-dot, non-space character)
  const symbolMatch = cleaned.match(/^([₹$€£¥]|[A-Z]{3})\s*/);
  const symbol = symbolMatch ? symbolMatch[1] : "";
  const amount = cleaned.replace(/^[₹$€£¥A-Z\s]+/, "").trim();
  return { symbol: symbol || "", amount: amount || "0" };
}

/** Render star rating from a string like "4.3" */
function StarRating({ rating, reviewCount }: { rating?: string; reviewCount?: string }) {
  const numRating = parseFloat(rating || "0");
  if (!rating || numRating === 0) return null;

  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="flex items-center gap-px">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= Math.floor(numRating);
          const half = !filled && i === Math.ceil(numRating) && numRating % 1 >= 0.3;
          return (
            <Star
              key={i}
              size={10}
              className={
                filled
                  ? "text-amber-400 fill-amber-400"
                  : half
                    ? "text-amber-400 fill-amber-400/50"
                    : "text-white/10"
              }
            />
          );
        })}
      </div>
      <span className="text-[10px] font-bold text-white/30">
        {numRating.toFixed(1)}
      </span>
      {reviewCount && (
        <span className="text-[10px] font-medium text-white/20">
          ({Number(reviewCount).toLocaleString()})
        </span>
      )}
    </div>
  );
}

export function ProductCard({ product, onBuyNow, priority = false, index = 0 }: ProductCardProps) {
  const hasDiscount = product.discount_percentage && parseInt(product.discount_percentage) > 0;
  const { symbol, amount } = parsePriceDisplay(product.price);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col bg-[var(--store-card)] rounded-md border border-[var(--store-border)] hover:border-[var(--store-primary)]/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-sans h-full"
    >
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
               -{product.discount_percentage}%
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Brand */}
        {product.brand && (
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--store-primary)]/70 mb-1 line-clamp-1">
            {product.brand}
          </span>
        )}

        {/* Real Rating from scraped data */}
        <StarRating rating={product.rating} reviewCount={product.review_count} />

        <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-3 text-white group-hover:text-[var(--store-primary)] transition-colors min-h-[2.5rem]">
          {product.title}
        </h3>

        <div className="mt-auto pt-3 border-t border-white/5">
          {/* Detailed Pricing */}
          <div className="flex flex-col mb-4">
            {hasDiscount && product.original_price && (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] text-red-500 font-bold">-{product.discount_percentage}%</span>
                <span className="text-[10px] text-white/30 line-through font-medium">
                  {product.original_price}
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              {symbol && (
                <span className="text-[10px] font-bold text-white/40 uppercase mb-0.5">{symbol}</span>
              )}
              <span className="text-2xl font-black text-white tracking-tight leading-none">
                {amount}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-10 sm:h-9 rounded-sm border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 order-2 sm:order-1"
              onClick={() => onBuyNow(product)}
            >
              Details
            </Button>
            <Button
              className="h-10 sm:h-9 rounded-sm bg-[var(--store-primary)] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[var(--store-primary)]/90 shadow-lg shadow-[var(--store-primary)]/10 order-1 sm:order-2"
              onClick={() => onBuyNow(product)}
            >
              <ShoppingBag size={12} className="mr-1.5" />
              Buy Now
            </Button>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
             <ShieldCheck size={12} className="text-emerald-500" />
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Verified Listing</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
