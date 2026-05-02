import { Skeleton } from "./Skeleton";

export function SettingsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 w-full max-w-md">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-5 w-full max-w-sm rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Tabs */}
        <div className="lg:col-span-3">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 lg:w-full w-32 flex-shrink-0 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-9 space-y-8">
          <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-3 w-64 opacity-50" />
                </div>
              </div>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-3xl flex-shrink-0" />
                <div className="space-y-3 w-full">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-24 rounded-full mt-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24 opacity-50" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end pt-4">
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
