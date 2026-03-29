"use client";

import React from "react";
import { Skeleton } from "./Skeleton";
import { Card, CardContent } from "./Card";

export function ProductsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      <div className="relative max-w-md">
        <Skeleton className="h-11 w-full rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="glass border-white/5 overflow-hidden">
            <Skeleton className="h-56 w-full rounded-none" />
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-full" />
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <Skeleton className="h-2 w-12" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
