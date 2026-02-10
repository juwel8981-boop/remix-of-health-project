import { Skeleton } from "@/components/ui/skeleton";

export function EHRSkeleton() {
  return (
    <div className="min-h-screen bg-muted animate-fade-in py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Storage bar */}
        <div className="bg-card rounded-xl p-4 border border-border mb-6">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Records list */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
