import { Skeleton } from "@/components/ui/skeleton";

export function AppointmentsSkeleton() {
  return (
    <div className="min-h-screen bg-muted animate-fade-in">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>

        {/* Appointment Cards */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-5 border border-border space-y-3" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
