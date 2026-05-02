import { Skeleton } from "./Skeleton";

export function StoreSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] animate-fade-in">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-20 md:h-24 bg-black/50 border-b border-white/5 z-50 flex items-center px-4 md:px-8 justify-between">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-12 w-full max-w-md rounded-2xl hidden md:block" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>

      <main className="pt-28 md:pt-36">
        {/* Banner Section */}
        <section className="px-3 md:px-8 mb-8 md:mb-12">
          <div className="max-w-[1400px] mx-auto">
            <Skeleton className="h-[260px] sm:h-[300px] md:h-[450px] w-full rounded-xl md:rounded-2xl" />
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="px-3 md:px-8 pb-32">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:grid lg:grid-cols-[240px_1fr] gap-6 md:gap-8">
            
            {/* Sidebar Filters */}
            <aside className="hidden lg:flex flex-col gap-8">
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </aside>

            {/* Product Grid Area */}
            <div className="flex-1">
              {/* Mobile Tab Scroller */}
              <div className="flex lg:hidden items-center gap-4 overflow-hidden pb-6 mb-8 border-b border-white/5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-28 rounded-full flex-shrink-0" />
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col h-[340px] md:h-[400px]">
                    <Skeleton className="h-40 md:h-56 w-full rounded-none" />
                    <div className="p-4 md:p-6 flex-1 flex flex-col">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
