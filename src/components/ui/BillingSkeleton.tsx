import { Skeleton } from "./Skeleton";

export function BillingSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full max-w-sm rounded-lg" />
      </div>

      {/* Current Plan Card */}
      <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <Skeleton className="h-16 w-16 rounded-2xl flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32 opacity-50" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
            <Skeleton className="h-12 w-full lg:w-72 hidden md:block rounded-xl" />
          </div>
        </div>
      </div>

      {/* Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[3rem] border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-12 w-12 rounded-2xl flex-shrink-0" />
                <div className="space-y-1 w-full">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-3 w-16 opacity-50" />
                </div>
              </div>
              <div className="mb-8 space-y-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-3 w-full opacity-50" />
                <Skeleton className="h-3 w-3/4 opacity-50" />
              </div>
              <div className="space-y-4 mb-8 flex-1">
                <Skeleton className="h-3 w-16" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Redemption Card */}
      <div className="pt-4">
        <div className="rounded-[3rem] border border-primary/20 bg-primary/5 overflow-hidden">
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-lg w-full">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full opacity-60" />
              <Skeleton className="h-4 w-2/3 opacity-60" />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Skeleton className="h-14 w-full sm:w-64 rounded-2xl" />
              <Skeleton className="h-14 w-full sm:w-40 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-48 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[3rem] border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-20 opacity-50" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full opacity-50" />
                <Skeleton className="h-3 w-4/5 opacity-50" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
