import { Skeleton } from "@/components/ui/skeleton";

export function BookAppointmentSkeleton() {
  return (
    <div className="min-h-screen bg-muted animate-fade-in">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-52" />
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          {/* Doctor search */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Doctor list */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>

          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
