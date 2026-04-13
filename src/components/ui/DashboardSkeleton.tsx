import { Skeleton } from "./Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="space-y-3 relative z-10">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96 opacity-50" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border-[0.5px] border-white/5 bg-[#0A0A0E] p-6 md:p-8 space-y-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.02),inset_0_-2px_4px_rgba(0,0,0,0.6)] relative overflow-hidden group"
          >
            <div className="absolute inset-0 noise-subtle opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-3 w-20 opacity-40 rounded-sm" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
              <Skeleton className="h-10 w-24 mb-2 rounded-md" />
              <Skeleton className="h-1.5 w-full rounded-full opacity-30 mt-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Store Card */}
      <div className="rounded-lg border-[0.5px] border-white/5 bg-[#0A0A0E] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[inset_0_2px_4px_rgba(255,255,255,0.02),inset_0_-2px_4px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="absolute inset-0 noise-subtle opacity-20 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-6 w-full md:w-auto">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-4 w-72 opacity-40 rounded-md" />
          </div>
        </div>
        <Skeleton className="relative z-10 h-10 w-32 rounded-lg" />
      </div>

      {/* Two Column details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg border-[0.5px] border-white/5 bg-[#0A0A0E] p-6 md:p-8 space-y-6 shadow-[inset_0_2px_4px_rgba(255,255,255,0.02),inset_0_-2px_4px_rgba(0,0,0,0.6)] relative overflow-hidden group"
          >
            <div className="absolute inset-0 noise-subtle opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md opacity-40" />
              </div>
              <div className="space-y-6">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/3 opacity-40 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
