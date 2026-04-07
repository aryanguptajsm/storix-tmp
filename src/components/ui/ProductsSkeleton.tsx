"use client";

import React from "react";
import { Skeleton } from "./Skeleton";
import { Card, CardContent } from "./Card";
import { SkeletonContainer } from "./SkeletonContainer";
import { ShoppingBag, Package, Search, Plus } from "lucide-react";

const PRODUCTS_STEPS = [
  { id: 1, text: "Accessing Global Inventory...", icon: Package, color: "text-primary" },
  { id: 2, text: "Scanning Retail Intercepts...", icon: Search, color: "text-secondary" },
  { id: 3, text: "Retrieving Unit Allocations...", icon: ShoppingBag, color: "text-accent" },
];

export function ProductsSkeleton() {
  return (
    <SkeletonContainer steps={PRODUCTS_STEPS} title="Inventory Synchronization in Progress">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} size="small" variant="glass" className="overflow-hidden border-white/5 bg-white/[0.01]">
            <div className="h-56 bg-white/5 relative overflow-hidden">
               <div className="absolute inset-0 shimmer opacity-30" />
            </div>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex justify-between items-center pt-5 border-t border-white/5 mt-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-2 w-12 opacity-50" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SkeletonContainer>
  );
}

