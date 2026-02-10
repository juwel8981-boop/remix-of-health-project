import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSettingsSkeleton() {
  return (
    <div className="min-h-screen bg-muted animate-fade-in">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-40" />
        </div>

        {/* Avatar section */}
        <div className="bg-card rounded-xl p-6 border border-border mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>

        {/* Form fields */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
