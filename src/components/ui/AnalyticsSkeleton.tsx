import { Skeleton } from "./Skeleton";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-10 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 w-full max-w-md">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="h-5 w-full max-w-sm rounded-lg" />
        </div>
        
        <div className="flex bg-surface-light/50 p-1.5 rounded-2xl border border-white/5">
           <Skeleton className="h-10 w-[240px] rounded-xl" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[3rem] border border-white/5 bg-white/[0.02] p-6 md:p-10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-4">
              <Skeleton className="h-4 w-24 opacity-60" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-12 w-32" />
              <div className="flex items-center gap-2 mt-3">
                <Skeleton className="h-5 w-16 rounded-full opacity-50" />
                <Skeleton className="h-3 w-12 opacity-30" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-[3rem] border border-white/5 bg-white/[0.02] p-1">
            <div className="flex flex-row items-center justify-between p-5 pb-2">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-3 w-52 opacity-50" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <div className="h-[300px] w-full pt-6 p-6">
               <Skeleton className="h-full w-full rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Table Placeholder */}
      <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="p-6 border-b border-white/5">
           <Skeleton className="h-7 w-48" />
        </div>
        <div className="p-0">
          <div className="p-4 border-b border-white/5 flex gap-4">
             <Skeleton className="h-4 w-1/4" />
             <Skeleton className="h-4 w-1/4" />
             <Skeleton className="h-4 w-1/4" />
             <Skeleton className="h-4 w-1/4" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 flex items-center justify-between border-b border-white/5 last:border-0">
               <Skeleton className="h-8 w-32 rounded-lg" />
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-6 w-20 rounded-full" />
               <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
