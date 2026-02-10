import { Skeleton } from "@/components/ui/skeleton";

export function DiagnosticDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-64 md:h-80">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute top-4 left-4">
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <div className="absolute top-4 right-4">
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </section>

      {/* Content Card */}
      <div className="healthcare-container -mt-16 relative z-10 pb-12">
        <div className="bg-card rounded-2xl shadow-healthcare-lg p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-64" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>

            {/* Right Column - Services */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
