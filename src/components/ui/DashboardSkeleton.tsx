"use client";

import { Skeleton } from "./Skeleton";
import DotField from "./DotField";

export function DashboardSkeleton() {
  return (
    <div className="relative min-h-[100dvh] w-full bg-black animate-fade-in overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <DotField
          dotRadius={1.5}
          dotSpacing={16}
          cursorRadius={400}
          cursorForce={0.15}
          bulgeOnly={true}
          bulgeStrength={50}
          sparkle={true}
          waveAmplitude={5}
          gradientFrom="rgba(16, 185, 129, 0.4)"
          gradientTo="rgba(16, 185, 129, 0.1)"
          glowColor="#050508"
        />
      </div>

      {/* Subtle overlay to ensure good contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-0" />

      {/* Main Skeleton Content */}
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 pt-20 max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="space-y-2 relative z-10">
          <Skeleton className="h-10 w-72 bg-white/10" />
          <Skeleton className="h-4 w-96 opacity-50 bg-white/5" />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.05] bg-black/60 backdrop-blur-xl p-5 space-y-3 shadow-[inset_0_2px_4px_rgba(255,255,255,0.02),0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 noise-subtle opacity-20 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 border-b border-white/[0.02] pb-2">
                  <Skeleton className="h-3 w-20 opacity-40 rounded-sm bg-white/20" />
                  <Skeleton className="h-8 w-8 rounded-md bg-white/10" />
                </div>
                <Skeleton className="h-8 w-24 mb-2 rounded-md bg-white/10" />
                <Skeleton className="h-1 w-full rounded-full opacity-30 mt-3 bg-emerald-500/30" />
              </div>
            </div>
          ))}
        </div>

        {/* Store Card */}
        <div className="rounded-2xl border border-white/[0.05] bg-black/60 backdrop-blur-xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[inset_0_2px_4px_rgba(255,255,255,0.02),0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          <div className="absolute inset-0 noise-subtle opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-5 w-full md:w-auto">
            <Skeleton className="h-12 w-12 rounded-xl bg-emerald-500/20" />
            <div className="space-y-1">
              <Skeleton className="h-6 w-48 rounded-md bg-white/10" />
              <Skeleton className="h-3 w-72 opacity-40 rounded-md bg-white/5" />
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Skeleton className="h-10 w-40 rounded-lg bg-white/10" />
             <Skeleton className="h-10 w-32 rounded-lg bg-white/10" />
          </div>
        </div>

        {/* Two Column details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.05] bg-black/60 backdrop-blur-xl p-5 space-y-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.02),0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 noise-subtle opacity-20 pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between border-b border-white/[0.02] pb-3 mb-4">
                  <Skeleton className="h-4 w-32 rounded-sm bg-white/10" />
                  <Skeleton className="h-7 w-16 rounded-md opacity-40 bg-white/5" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0 bg-white/10" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-2/3 rounded-sm bg-white/10" />
                        <Skeleton className="h-2 w-1/4 opacity-40 rounded-sm bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
