import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star, Search, GripVertical, Plus, Trash2, 
  CheckCircle2, ArrowUp, ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Doctor {
  id: string;
  full_name: string;
  email: string;
  specialization: string;
  hospital_affiliation: string | null;
  is_featured: boolean;
  featured_rank: number | null;
  verification_status: string;
}

export default function FeaturedDoctorsManager() {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [doctorToRemove, setDoctorToRemove] = useState<Doctor | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    
    // Fetch all approved doctors
    const { data: allData, error: allError } = await supabase
      .from("doctors")
      .select("id, full_name, email, specialization, hospital_affiliation, is_featured, featured_rank, verification_status")
      .eq("verification_status", "approved")
      .order("full_name");

    if (allError) {
      console.error("Error fetching doctors:", allError);
      toast.error("Failed to fetch doctors");
    } else {
      setAllDoctors(allData || []);
      
      // Get featured doctors sorted by rank
      const featured = (allData || [])
        .filter(d => d.is_featured)
        .sort((a, b) => (a.featured_rank || 999) - (b.featured_rank || 999));
      setFeaturedDoctors(featured);
    }
    setLoading(false);
  };

  const nonFeaturedDoctors = allDoctors.filter(d => !d.is_featured);

  const filteredFeaturedDoctors = featuredDoctors.filter(doctor =>
    doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFeatured = async () => {
    if (!selectedDoctorId) {
      toast.error("Please select a doctor");
      return;
    }

    const newRank = featuredDoctors.length + 1;

    const { error } = await supabase
      .from("doctors")
      .update({ is_featured: true, featured_rank: newRank })
      .eq("id", selectedDoctorId);

    if (error) {
      toast.error("Failed to add featured doctor");
    } else {
      toast.success("Doctor added to featured list");
      setAddDialogOpen(false);
      setSelectedDoctorId("");
      fetchDoctors();
    }
  };

  const handleRemoveFeatured = async () => {
    if (!doctorToRemove) return;

    const { error } = await supabase
      .from("doctors")
      .update({ is_featured: false, featured_rank: null })
      .eq("id", doctorToRemove.id);

    if (error) {
      toast.error("Failed to remove from featured");
    } else {
      toast.success("Doctor removed from featured list");
      setRemoveDialogOpen(false);
      setDoctorToRemove(null);
      fetchDoctors();
    }
  };

  const moveUp = async (doctor: Doctor, index: number) => {
    if (index === 0) return;

    const doctorAbove = featuredDoctors[index - 1];
    
    // Swap ranks
    const updates = [
      supabase.from("doctors").update({ featured_rank: index }).eq("id", doctor.id),
      supabase.from("doctors").update({ featured_rank: index + 1 }).eq("id", doctorAbove.id),
    ];

    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);

    if (hasError) {
      toast.error("Failed to update ranking");
    } else {
      fetchDoctors();
    }
  };

  const moveDown = async (doctor: Doctor, index: number) => {
    if (index === featuredDoctors.length - 1) return;

    const doctorBelow = featuredDoctors[index + 1];
    
    // Swap ranks
    const updates = [
      supabase.from("doctors").update({ featured_rank: index + 2 }).eq("id", doctor.id),
      supabase.from("doctors").update({ featured_rank: index + 1 }).eq("id", doctorBelow.id),
    ];

    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);

    if (hasError) {
      toast.error("Failed to update ranking");
    } else {
      fetchDoctors();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Featured Doctors</h1>
          <p className="text-muted-foreground">Manage homepage featured doctors and their display order</p>
        </div>
        <Button variant="healthcare" onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Featured Doctor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="healthcare-card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 text-accent fill-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">{featuredDoctors.length}</p>
          <p className="text-sm text-muted-foreground">Featured Doctors</p>
        </div>
        <div className="healthcare-card text-center">
          <p className="text-2xl font-bold text-foreground">{allDoctors.length}</p>
          <p className="text-sm text-muted-foreground">Total Approved Doctors</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search featured doctors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Featured Doctors List */}
      <div className="space-y-3">
        {filteredFeaturedDoctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="healthcare-card flex items-center gap-4"
          >
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveUp(doctor, index)}
                disabled={index === 0}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveDown(doctor, index)}
                disabled={index === featuredDoctors.length - 1}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              #{index + 1}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{doctor.full_name}</p>
                <Badge variant="secondary" className="text-xs">{doctor.specialization}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{doctor.hospital_affiliation || "Independent Practice"}</p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => {
                setDoctorToRemove(doctor);
                setRemoveDialogOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}

        {filteredFeaturedDoctors.length === 0 && (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No featured doctors match your search." : "No featured doctors yet. Add some to display on the homepage!"}
            </p>
          </div>
        )}
      </div>

      {/* Add Featured Doctor Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Featured Doctor</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {nonFeaturedDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.full_name} - {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {nonFeaturedDoctors.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                All approved doctors are already featured.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="healthcare" onClick={handleAddFeatured} disabled={!selectedDoctorId}>
              Add to Featured
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Featured</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {doctorToRemove?.full_name} from featured doctors?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFeatured}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
