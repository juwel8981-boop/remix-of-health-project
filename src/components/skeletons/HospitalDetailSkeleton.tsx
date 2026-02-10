import { Skeleton } from "@/components/ui/skeleton";

export function HospitalDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero */}
      <section className="relative h-64 md:h-80">
        <Skeleton className="w-full h-full rounded-none" />
      </section>

      {/* Content */}
      <div className="healthcare-container -mt-16 relative z-10 pb-12">
        <div className="bg-card rounded-2xl shadow-healthcare-lg p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-72" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
