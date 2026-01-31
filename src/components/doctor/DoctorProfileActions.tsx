import { useState, useEffect } from "react";
import { Heart, Share2, Copy, Facebook, Twitter, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DoctorProfileActionsProps {
  doctorId: string;
  doctorName: string;
}

export function DoctorProfileActions({ doctorId, doctorName }: DoctorProfileActionsProps) {
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const profileUrl = `${window.location.origin}/doctors/${doctorId}`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkFavoriteStatus(session.user.id);
      }
    });
  }, [doctorId]);

  const checkFavoriteStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("doctor_favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("doctor_id", doctorId)
        .maybeSingle();

      if (!error && data) {
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save doctors to your favorites.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from("doctor_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("doctor_id", doctorId);

        if (error) throw error;
        setIsFavorited(false);
        toast({
          title: "Removed from Favorites",
          description: `${doctorName} has been removed from your favorites.`,
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("doctor_favorites")
          .insert({
            user_id: user.id,
            doctor_id: doctorId,
          });

        if (error) throw error;
        setIsFavorited(true);
        toast({
          title: "Added to Favorites",
          description: `${doctorName} has been added to your favorites.`,
        });
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Doctor profile link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to Copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
    setShareOpen(false);
  };

  const handleShareTwitter = () => {
    const text = `Check out ${doctorName}'s profile on MediCare!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
    setShareOpen(false);
  };

  const handleShareWhatsApp = () => {
    const text = `Check out ${doctorName}'s profile on MediCare: ${profileUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setShareOpen(false);
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="icon"
        className={`bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 transition-all ${
          isFavorited ? "bg-red-500/20 border-red-500/50" : ""
        }`}
        onClick={handleToggleFavorite}
        disabled={isLoading}
      >
        <Heart
          className={`w-5 h-5 transition-all ${
            isFavorited ? "fill-red-500 text-red-500" : ""
          }`}
        />
      </Button>

      <Popover open={shareOpen} onOpenChange={setShareOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground px-2 py-1">Share Profile</p>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleShareFacebook}
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleShareTwitter}
            >
              <Twitter className="w-4 h-4 text-sky-500" />
              Twitter
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleShareWhatsApp}
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              WhatsApp
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
