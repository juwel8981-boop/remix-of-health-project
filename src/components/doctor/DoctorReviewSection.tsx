import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageCircle, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  author_name?: string;
}

interface DoctorReviewSectionProps {
  doctorId: string;
  doctorName: string;
}

export function DoctorReviewSection({ doctorId, doctorName }: DoctorReviewSectionProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchReviews();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        checkUserReview(session.user.id);
      }
    });
  }, [doctorId]);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    setUserProfile(data);
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("doctor_reviews")
        .select("*")
        .eq("doctor_id", doctorId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author names from profiles
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
        const reviewsWithNames = data.map(review => ({
          ...review,
          author_name: profileMap.get(review.user_id) || "Anonymous"
        }));
        setReviews(reviewsWithNames);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserReview = async (userId: string) => {
    const { data } = await supabase
      .from("doctor_reviews")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setUserReview(data);
      setRating(data.rating);
      setReviewText(data.review_text || "");
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to submit a review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from("doctor_reviews")
          .update({
            rating,
            review_text: reviewText || null,
          })
          .eq("id", userReview.id);

        if (error) throw error;
        toast({
          title: "Review Updated",
          description: "Your review has been updated successfully.",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from("doctor_reviews")
          .insert({
            user_id: user.id,
            doctor_id: doctorId,
            rating,
            review_text: reviewText || null,
          });

        if (error) throw error;
        toast({
          title: "Review Submitted",
          description: "Thank you for your review!",
        });
      }

      setShowReviewForm(false);
      fetchReviews();
      checkUserReview(user.id);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-${interactive ? "pointer" : "default"} transition-colors ${
              star <= (interactive ? (hoverRating || rating) : count)
                ? "text-accent fill-accent"
                : "text-muted"
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="healthcare-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          <MessageCircle className="w-5 h-5 inline mr-2 text-primary" />
          Patient Reviews
        </h2>
        {user && !showReviewForm && (
          <Button
            variant="healthcare-outline"
            size="sm"
            onClick={() => setShowReviewForm(true)}
          >
            {userReview ? "Edit Review" : "Write Review"}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-4 rounded-xl bg-muted"
        >
          <h3 className="font-medium text-foreground mb-3">
            {userReview ? "Update Your Review" : "Write a Review"}
          </h3>
          
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">
              Your Rating
            </label>
            {renderStars(rating, true)}
          </div>

          <Textarea
            placeholder={`Share your experience with ${doctorName}...`}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="mb-4"
            rows={4}
          />

          <div className="flex gap-2">
            <Button
              variant="healthcare"
              onClick={handleSubmitReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : userReview ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowReviewForm(false)}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No reviews yet. Be the first to review {doctorName}!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-xl border border-border"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {review.author_name}
                      {review.user_id === user?.id && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.review_text && (
                <p className="text-muted-foreground mt-2">{review.review_text}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground text-center mt-4 pt-4 border-t border-border">
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>{" "}
          to leave a review
        </p>
      )}
    </motion.div>
  );
}
