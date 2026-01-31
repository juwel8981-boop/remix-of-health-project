import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DoctorRatingDisplayProps {
  doctorId: string;
  size?: "sm" | "md" | "lg";
}

export function DoctorRatingDisplay({ doctorId, size = "md" }: DoctorRatingDisplayProps) {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRatingData();
  }, [doctorId]);

  const fetchRatingData = async () => {
    try {
      // Fetch reviews to calculate average
      const { data: reviews, error } = await supabase
        .from("doctor_reviews")
        .select("rating")
        .eq("doctor_id", doctorId)
        .eq("status", "approved");

      if (error) {
        console.error("Error fetching reviews:", error);
        return;
      }

      if (reviews && reviews.length > 0) {
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avg = total / reviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
        setReviewCount(reviews.length);
      } else {
        setAverageRating(0);
        setReviewCount(0);
      }
    } catch (error) {
      console.error("Error fetching rating data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: { star: "w-4 h-4", text: "text-sm", rating: "text-base" },
    md: { star: "w-5 h-5", text: "text-base", rating: "text-lg" },
    lg: { star: "w-6 h-6", text: "text-lg", rating: "text-xl" },
  };

  const classes = sizeClasses[size];

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 animate-pulse">
        <Star className={`${classes.star} text-muted`} />
        <span className={`${classes.text} text-muted`}>...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Star className={`${classes.star} text-accent fill-accent`} />
      <span className={`font-semibold text-primary-foreground ${classes.rating}`}>
        {averageRating > 0 ? averageRating.toFixed(1) : "New"}
      </span>
      <span className={`text-primary-foreground/80 ${classes.text}`}>
        ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}
