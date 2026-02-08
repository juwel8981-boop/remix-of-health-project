import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, Clock, Phone, Plus, Edit2, Trash2, 
  DollarSign, Calendar, Check, X, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Chamber {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  days: string[] | null;
  timing: string | null;
  appointment_fee: string | null;
  serial_available: boolean | null;
}

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const emptyChamber: Omit<Chamber, 'id'> = {
  name: "",
  address: "",
  phone: "",
  days: [],
  timing: "",
  appointment_fee: "",
  serial_available: true,
};

export function DoctorChamberManager() {
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingChamber, setEditingChamber] = useState<Chamber | null>(null);
  const [chamberToDelete, setChamberToDelete] = useState<Chamber | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Omit<Chamber, 'id'>>(emptyChamber);

  useEffect(() => {
    fetchChambers();
  }, []);

  const fetchChambers = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get doctor ID
    const { data: doctorData } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!doctorData) {
      setLoading(false);
      return;
    }

    setDoctorId(doctorData.id);

    // Fetch chambers
    const { data: chambersData, error } = await supabase
      .from("doctor_chambers")
      .select("*")
      .eq("doctor_id", doctorData.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching chambers:", error);
      toast.error("Failed to load chambers");
    } else {
      setChambers(chambersData || []);
    }

    setLoading(false);
  };

  const handleOpenDialog = (chamber?: Chamber) => {
    if (chamber) {
      setEditingChamber(chamber);
      setFormData({
        name: chamber.name,
        address: chamber.address,
        phone: chamber.phone || "",
        days: chamber.days || [],
        timing: chamber.timing || "",
        appointment_fee: chamber.appointment_fee || "",
        serial_available: chamber.serial_available ?? true,
      });
    } else {
      setEditingChamber(null);
      setFormData(emptyChamber);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingChamber(null);
    setFormData(emptyChamber);
  };

  const handleDayToggle = (day: string) => {
    const currentDays = formData.days || [];
    if (currentDays.includes(day)) {
      setFormData({ ...formData, days: currentDays.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, days: [...currentDays, day] });
    }
  };

  const handleSave = async () => {
    if (!doctorId) return;

    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error("Please fill in the required fields");
      return;
    }

    setSaving(true);

    try {
      if (editingChamber) {
        // Update existing chamber
        const { error } = await supabase
          .from("doctor_chambers")
          .update({
            name: formData.name,
            address: formData.address,
            phone: formData.phone || null,
            days: formData.days,
            timing: formData.timing || null,
            appointment_fee: formData.appointment_fee || null,
            serial_available: formData.serial_available,
          })
          .eq("id", editingChamber.id);

        if (error) throw error;
        toast.success("Chamber updated successfully");
      } else {
        // Create new chamber
        const { error } = await supabase
          .from("doctor_chambers")
          .insert({
            doctor_id: doctorId,
            name: formData.name,
            address: formData.address,
            phone: formData.phone || null,
            days: formData.days,
            timing: formData.timing || null,
            appointment_fee: formData.appointment_fee || null,
            serial_available: formData.serial_available,
          });

        if (error) throw error;
        toast.success("Chamber added successfully");
      }

      handleCloseDialog();
      fetchChambers();
    } catch (error: any) {
      console.error("Error saving chamber:", error);
      toast.error(error.message || "Failed to save chamber");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!chamberToDelete) return;

    try {
      const { error } = await supabase
        .from("doctor_chambers")
        .delete()
        .eq("id", chamberToDelete.id);

      if (error) throw error;
      
      toast.success("Chamber deleted successfully");
      setIsDeleteDialogOpen(false);
      setChamberToDelete(null);
      fetchChambers();
    } catch (error: any) {
      console.error("Error deleting chamber:", error);
      toast.error(error.message || "Failed to delete chamber");
    }
  };

  const openDeleteDialog = (chamber: Chamber) => {
    setChamberToDelete(chamber);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            My Chambers
          </h1>
          <p className="text-muted-foreground">
            Manage your practice locations and schedules
          </p>
        </motion.div>

        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Chamber
        </Button>
      </div>

      {/* Chambers List */}
      {chambers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="healthcare-card text-center py-12"
        >
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Chambers Added</h3>
          <p className="text-muted-foreground mb-6">
            Add your practice locations so patients can find and book appointments with you.
          </p>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Chamber
          </Button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {chambers.map((chamber, index) => (
            <motion.div
              key={chamber.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="healthcare-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {chamber.name}
                  </h3>
                  {chamber.serial_available && (
                    <span className="inline-flex items-center gap-1 text-xs bg-healthcare-green-light text-healthcare-green px-2 py-0.5 rounded-full mt-1">
                      <Check className="w-3 h-3" />
                      Serial Available
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(chamber)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => openDeleteDialog(chamber)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">{chamber.address}</p>
                </div>

                {chamber.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">{chamber.phone}</p>
                  </div>
                )}

                {chamber.timing && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">{chamber.timing}</p>
                  </div>
                )}

                {chamber.days && chamber.days.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-primary mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {chamber.days.map((day) => (
                        <span
                          key={day}
                          className="text-xs bg-muted px-2 py-0.5 rounded"
                        >
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {chamber.appointment_fee && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">
                      ৳{chamber.appointment_fee}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingChamber ? "Edit Chamber" : "Add New Chamber"}
            </DialogTitle>
            <DialogDescription>
              {editingChamber 
                ? "Update your practice location details" 
                : "Add a new practice location for patients to book appointments"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Chamber Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Main Clinic, Hospital Chamber"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Full address of your chamber"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., +880 1XXXXXXXXX"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={(formData.days || []).includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <label
                      htmlFor={day}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timing">Timing</Label>
              <Input
                id="timing"
                placeholder="e.g., 9:00 AM - 5:00 PM"
                value={formData.timing || ""}
                onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee">Appointment Fee (৳)</Label>
              <Input
                id="fee"
                type="text"
                placeholder="e.g., 500"
                value={formData.appointment_fee || ""}
                onChange={(e) => setFormData({ ...formData, appointment_fee: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="serial">Serial/Appointment Available</Label>
                <p className="text-xs text-muted-foreground">
                  Allow patients to book appointments at this chamber
                </p>
              </div>
              <Switch
                id="serial"
                checked={formData.serial_available ?? true}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, serial_available: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingChamber ? (
                "Update Chamber"
              ) : (
                "Add Chamber"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chamber</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{chamberToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
