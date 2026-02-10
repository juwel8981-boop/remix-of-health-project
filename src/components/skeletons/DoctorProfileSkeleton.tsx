import { Skeleton } from "@/components/ui/skeleton";

export function DoctorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-secondary py-12">
        <div className="healthcare-container">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-primary-foreground/20" />
            <div className="text-center md:text-left space-y-3">
              <Skeleton className="h-8 w-64 bg-primary-foreground/20 mx-auto md:mx-0" />
              <Skeleton className="h-5 w-40 bg-primary-foreground/20 mx-auto md:mx-0" />
              <Skeleton className="h-4 w-56 bg-primary-foreground/20 mx-auto md:mx-0" />
              <div className="flex gap-4 justify-center md:justify-start">
                <Skeleton className="h-4 w-20 bg-primary-foreground/20" />
                <Skeleton className="h-4 w-32 bg-primary-foreground/20" />
                <Skeleton className="h-4 w-24 bg-primary-foreground/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="healthcare-section">
        <div className="healthcare-container">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="healthcare-card space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="healthcare-card space-y-4">
                <Skeleton className="h-6 w-40" />
                {[1, 2].map(i => (
                  <div key={i} className="p-4 rounded-xl border-2 border-border space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="healthcare-card space-y-4">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
