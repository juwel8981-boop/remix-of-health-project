import { Skeleton } from "@/components/ui/skeleton";

export function DiagnosticCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="healthcare-card overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
          <Skeleton className="h-48 -m-6 mb-4 rounded-none" />
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-3" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
