"use client";

import { Skeleton } from "./Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-20 relative min-h-screen animate-fade-in overflow-hidden bg-black">
      <div className="fixed inset-0 pointer-events-none -z-20 bg-black/60" />
      
      {/* Premium Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,206,201,0.05),transparent_40%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto space-y-8 relative z-10 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3 relative w-full max-w-md">
              <Skeleton className="h-[3rem] md:h-[4rem] lg:h-[4.5rem] w-full max-w-sm rounded-2xl" />
              <Skeleton className="h-6 w-3/4 max-w-xs mt-2 rounded-lg" />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
              <Skeleton className="h-12 w-full sm:w-32 rounded-xl" />
              <Skeleton className="h-12 w-full sm:w-32 rounded-xl" />
              <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[3rem] border border-white/[0.05] bg-black/60 backdrop-blur-2xl p-6 lg:p-8 h-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.02),0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col"
            >
              <div className="flex flex-row items-center justify-between pb-2 mb-6">
                <Skeleton className="h-3 w-20 rounded-sm" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <div className="pt-4 mt-auto">
                <Skeleton className="h-12 w-32 rounded-lg mb-2" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-2 w-2 rounded-full flex-shrink-0" />
                  <Skeleton className="h-3 w-24 rounded-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
