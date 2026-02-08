import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface PostSkeletonProps {
  count?: number;
}

const SinglePostSkeleton = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.4 }}
    className="bg-card rounded-xl shadow-sm border border-border overflow-hidden"
  >
    {/* Header */}
    <div className="p-4 pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </div>

    {/* Content */}
    <div className="px-4 pb-3 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[90%]" />
      <Skeleton className="h-4 w-[75%]" />
    </div>

    {/* Image placeholder (shown for every other skeleton) */}
    {index % 2 === 0 && (
      <div className="px-4 pb-3">
        <Skeleton className="w-full h-48 rounded-lg" />
      </div>
    )}

    {/* Actions */}
    <div className="px-4 py-3 border-t border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  </motion.div>
);

export function PostSkeleton({ count = 3 }: PostSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SinglePostSkeleton key={index} index={index} />
      ))}
    </div>
  );
}
