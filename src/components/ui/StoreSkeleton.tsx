"use client";

import React from "react";
import { Skeleton } from "./Skeleton";
import { Card, CardContent } from "./Card";
import { SkeletonContainer } from "./SkeletonContainer";
import { ShoppingBag, Zap, Sparkles, Globe } from "lucide-react";

const STORE_STEPS = [
  { id: 1, text: "Connecting to Global Marketplace...", icon: Globe, color: "text-primary" },
  { id: 2, text: "Syncing Merchant Collections...", icon: ShoppingBag, color: "text-secondary" },
  { id: 3, text: "Optimizing Display Nodes...", icon: Zap, color: "text-accent" },
  { id: 4, text: "Finalizing Aesthetic Link...", icon: Sparkles, color: "text-white" },
];

export function StoreSkeleton() {
  return (
    <SkeletonContainer steps={STORE_STEPS} title="Marketplace Authorization in Progress">
      <div className="space-y-12">
        {/* Hero Section Skeleton */}
        <div className="text-center space-y-4 py-8">
           <Skeleton className="h-16 w-3/4 mx-auto rounded-3xl opacity-20" />
           <Skeleton className="h-6 w-1/2 mx-auto rounded-xl opacity-10" />
        </div>

        {/* Categories Skeleton */}
        <div className="flex justify-center gap-3 overflow-x-auto pb-4 no-scrollbar">
           {[1, 2, 3, 4, 5].map((i) => (
             <Skeleton key={i} className="h-10 w-28 rounded-full flex-shrink-0 opacity-10" />
           ))}
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} size="small" variant="glass" className="overflow-hidden border-white/5 bg-white/[0.01]">
              <div className="h-64 bg-white/5 relative overflow-hidden">
                 <div className="absolute inset-0 shimmer opacity-20" />
              </div>
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-5 w-full opacity-50" />
                <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                   <Skeleton className="h-6 w-20 opacity-70" />
                   <Skeleton className="h-8 w-10 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SkeletonContainer>
  );
}
