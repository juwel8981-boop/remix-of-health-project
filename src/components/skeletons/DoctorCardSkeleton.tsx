import { Skeleton } from "@/components/ui/skeleton";

export function DoctorCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="healthcare-card animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl mx-auto sm:mx-0" />
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Skeleton className="h-5 w-40 mx-auto sm:mx-0" />
                <Skeleton className="h-4 w-20 mx-auto sm:mx-0" />
              </div>
              <Skeleton className="h-4 w-28 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-48 mx-auto sm:mx-0" />
              <div className="flex gap-4 justify-center sm:justify-start">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
