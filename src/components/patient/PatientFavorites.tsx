import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Star, MapPin, Clock, Trash2, ExternalLink, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface FavoriteDoctor {
  id: string;
  doctor_id: string;
  created_at: string;
  doctor: {
    id: string;
    full_name: string;
    specialization: string;
    hospital_affiliation: string | null;
    experience_years: number | null;
    is_featured: boolean;
  };
  averageRating: number;
  reviewCount: number;
  chamber: {
    address: string;
    timing: string;
    appointment_fee: string;
  } | null;
}

export function PatientFavorites() {
  const [favorites, setFavorites] = useState<FavoriteDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch favorites with doctor details
      const { data: favoritesData, error } = await supabase
        .from("doctor_favorites")
        .select(`
          id,
          doctor_id,
          created_at,
          doctors:doctor_id (
            id,
            full_name,
            specialization,
            hospital_affiliation,
            experience_years,
            is_featured
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch ratings and chambers for each doctor
      const enrichedFavorites = await Promise.all(
        (favoritesData || []).map(async (fav: any) => {
          // Get average rating
          const { data: ratingData } = await supabase
            .rpc("get_doctor_average_rating", { doctor_uuid: fav.doctor_id });

          // Get review count
          const { data: countData } = await supabase
            .rpc("get_doctor_review_count", { doctor_uuid: fav.doctor_id });

          // Get first chamber
          const { data: chamberData } = await supabase
            .from("doctor_chambers")
            .select("address, timing, appointment_fee")
            .eq("doctor_id", fav.doctor_id)
            .limit(1)
            .maybeSingle();

          return {
            id: fav.id,
            doctor_id: fav.doctor_id,
            created_at: fav.created_at,
            doctor: fav.doctors,
            averageRating: ratingData || 0,
            reviewCount: countData || 0,
            chamber: chamberData,
          };
        })
      );

      setFavorites(enrichedFavorites.filter(f => f.doctor));
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast({
        title: "Error",
        description: "Failed to load your favorite doctors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    setRemoving(true);
    try {
      const { error } = await supabase
        .from("doctor_favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast({
        title: "Removed",
        description: "Doctor removed from your favorites",
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
      setDeleteDialog(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">My Favorite Doctors</h2>
            <p className="text-sm text-muted-foreground">Doctors you've saved for quick access</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            My Favorite Doctors
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {favorites.length} doctor{favorites.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/doctors">
            <Stethoscope className="w-4 h-4 mr-2" />
            Find Doctors
          </Link>
        </Button>
      </div>

      {favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-muted/30 rounded-xl"
        >
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-4">
            Save doctors to quickly access their profiles later
          </p>
          <Button variant="healthcare" asChild>
            <Link to="/doctors">Browse Doctors</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {favorites.map((fav, index) => (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Link to={`/doctors/${fav.doctor_id}`}>
                      <Avatar className="w-16 h-16 border-2 border-primary/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                          {fav.doctor.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link 
                            to={`/doctors/${fav.doctor_id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {fav.doctor.full_name}
                          </Link>
                          <p className="text-sm text-primary font-medium">{fav.doctor.specialization}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {fav.doctor.is_featured && (
                            <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-foreground">
                          {fav.averageRating > 0 ? fav.averageRating.toFixed(1) : "New"}
                        </span>
                        {fav.reviewCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({fav.reviewCount} review{fav.reviewCount !== 1 ? "s" : ""})
                          </span>
                        )}
                        {fav.doctor.experience_years && (
                          <span className="text-xs text-muted-foreground ml-2">
                            • {fav.doctor.experience_years}+ yrs exp
                          </span>
                        )}
                      </div>

                      {/* Hospital */}
                      {fav.doctor.hospital_affiliation && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {fav.doctor.hospital_affiliation}
                        </p>
                      )}

                      {/* Chamber info */}
                      {fav.chamber && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {fav.chamber.address.split(",")[0]}
                          </span>
                          {fav.chamber.timing && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {fav.chamber.timing}
                            </span>
                          )}
                          {fav.chamber.appointment_fee && (
                            <span className="font-medium text-primary">
                              ৳{fav.chamber.appointment_fee}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="healthcare" asChild className="flex-1">
                          <Link to={`/doctors/${fav.doctor_id}`}>
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Profile
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteDialog(fav.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              This doctor will be removed from your favorites. You can always add them back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleRemoveFavorite(deleteDialog)}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
