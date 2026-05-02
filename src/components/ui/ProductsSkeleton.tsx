import { Skeleton } from "./Skeleton";

export function ProductsSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 w-full max-w-md">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="h-5 w-full max-w-sm rounded-lg" />
        </div>
        <Skeleton className="h-12 w-full md:w-48 rounded-xl" />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-[3rem] border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">
            <Skeleton className="h-56 w-full rounded-none" />
            
            <div className="p-6 flex-1 flex flex-col relative">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-2/3 mb-4" />
              
              <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-7 w-24 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
