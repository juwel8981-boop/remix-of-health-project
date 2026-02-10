import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BlurImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Optional low-res placeholder or CSS color/gradient */
  placeholderClass?: string;
}

export function BlurImage({
  className,
  placeholderClass,
  onLoad,
  ...props
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder shimmer */}
      <div
        className={cn(
          "absolute inset-0 bg-muted animate-pulse transition-opacity duration-500",
          placeholderClass,
          loaded ? "opacity-0" : "opacity-100"
        )}
      />
      <img
        {...props}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          loaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-md"
        )}
        loading="lazy"
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
      />
    </div>
  );
}
