import { Skeleton } from "./Skeleton";

export function StoreSkeleton() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <Skeleton className="h-14 w-3/4 mx-auto rounded-2xl opacity-20" />
        <Skeleton className="h-5 w-1/2 mx-auto rounded-xl opacity-10" />
      </div>

      {/* Categories */}
      <div className="flex justify-center gap-3 overflow-hidden pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-full flex-shrink-0 opacity-10" />
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="h-56 bg-white/[0.03] relative">
              <div className="absolute inset-0 shimmer opacity-20" />
            </div>
            <div className="p-5 space-y-3">
              <Skeleton className="h-5 w-full opacity-50" />
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <Skeleton className="h-6 w-20 opacity-70" />
                <Skeleton className="h-8 w-10 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
