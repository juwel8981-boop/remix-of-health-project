import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowDown } from "lucide-react";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { pullDistance, isRefreshing, progress, shouldRefresh } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    maxPull: 120,
  });

  return (
    <div className="relative">
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
            style={{
              top: -60,
              transform: `translateY(${Math.min(pullDistance, 80)}px)`,
            }}
          >
            <motion.div
              className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg border ${
                shouldRefresh || isRefreshing
                  ? "bg-primary border-primary/20"
                  : "bg-card border-border"
              }`}
              animate={{
                scale: isRefreshing ? 1 : 0.8 + progress * 0.2,
                rotate: isRefreshing ? 0 : progress * 180,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
              ) : (
                <motion.div
                  animate={{ rotate: shouldRefresh ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ArrowDown
                    className={`w-5 h-5 ${
                      shouldRefresh ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with pull transform */}
      <motion.div
        animate={{
          y: pullDistance > 0 || isRefreshing ? Math.min(pullDistance, 80) : 0,
        }}
        transition={{
          type: pullDistance > 0 ? "tween" : "spring",
          duration: pullDistance > 0 ? 0 : 0.3,
          stiffness: 300,
          damping: 25,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
