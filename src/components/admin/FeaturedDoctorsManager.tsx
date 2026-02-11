import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SortableFeaturedDoctor from "./SortableFeaturedDoctor";

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("doctors")
      .select("id, full_name, email, specialization, hospital_affiliation, is_featured, featured_rank, verification_status")
      .eq("verification_status", "approved")
      .order("full_name");

    if (error) {
      toast.error("Failed to fetch doctors");
    } else {
      setAllDoctors(data || []);
      const featured = (data || [])
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = featuredDoctors.findIndex(d => d.id === active.id);
    const newIndex = featuredDoctors.findIndex(d => d.id === over.id);

    const reordered = arrayMove(featuredDoctors, oldIndex, newIndex);
    setFeaturedDoctors(reordered);

    // Persist all new ranks
    const updates = reordered.map((doctor, i) =>
      supabase.from("doctors").update({ featured_rank: i + 1 }).eq("id", doctor.id)
    );
    const results = await Promise.all(updates);
    if (results.some(r => r.error)) {
      toast.error("Failed to save new order");
      fetchDoctors(); // rollback
    } else {
      toast.success("Order updated");
    }
  };

  const handleAddFeatured = async () => {
    if (!selectedDoctorId) { toast.error("Please select a doctor"); return; }
    const newRank = featuredDoctors.length + 1;
    const { error } = await supabase
      .from("doctors")
      .update({ is_featured: true, featured_rank: newRank })
      .eq("id", selectedDoctorId);
    if (error) { toast.error("Failed to add featured doctor"); }
    else { toast.success("Doctor added to featured list"); setAddDialogOpen(false); setSelectedDoctorId(""); fetchDoctors(); }
  };

  const handleRemoveFeatured = async () => {
    if (!doctorToRemove) return;
    const { error } = await supabase
      .from("doctors")
      .update({ is_featured: false, featured_rank: null })
      .eq("id", doctorToRemove.id);
    if (error) { toast.error("Failed to remove from featured"); }
    else { toast.success("Doctor removed from featured list"); setRemoveDialogOpen(false); setDoctorToRemove(null); fetchDoctors(); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Featured Doctors</h1>
          <p className="text-muted-foreground">Drag to reorder how doctors appear on the homepage</p>
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
        <Input placeholder="Search featured doctors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Featured Doctors List with DnD */}
      <div className="space-y-3">
        {searchQuery ? (
          filteredFeaturedDoctors.map((doctor) => (
            <SortableFeaturedDoctor
              key={doctor.id}
              doctor={doctor}
              index={featuredDoctors.indexOf(doctor)}
              onRemove={(d) => { setDoctorToRemove(d); setRemoveDialogOpen(true); }}
            />
          ))
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={featuredDoctors.map(d => d.id)} strategy={verticalListSortingStrategy}>
              {featuredDoctors.map((doctor, index) => (
                <SortableFeaturedDoctor
                  key={doctor.id}
                  doctor={doctor}
                  index={index}
                  onRemove={(d) => { setDoctorToRemove(d); setRemoveDialogOpen(true); }}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {filteredFeaturedDoctors.length === 0 && (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No featured doctors match your search." : "No featured doctors yet. Add some to display on the homepage!"}
            </p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Featured Doctor</DialogTitle></DialogHeader>
          <div className="py-4">
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
              <SelectTrigger><SelectValue placeholder="Select a doctor" /></SelectTrigger>
              <SelectContent>
                {nonFeaturedDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.full_name} - {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {nonFeaturedDoctors.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">All approved doctors are already featured.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button variant="healthcare" onClick={handleAddFeatured} disabled={!selectedDoctorId}>Add to Featured</Button>
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
            <AlertDialogAction onClick={handleRemoveFeatured}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
