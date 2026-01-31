import { useState, useEffect } from "react";
import { Edit, Eye, EyeOff, Trash2, Plus, Settings, MapPin, CheckCircle2, XCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  hospital_affiliation: string | null;
  experience_years: number | null;
  phone: string | null;
  email: string;
  registration_number: string;
  verification_status: string;
  is_active: boolean;
  is_featured: boolean;
  featured_rank: number | null;
}

interface Chamber {
  id: string;
  doctor_id: string;
  name: string;
  address: string;
  phone: string | null;
  days: string[] | null;
  timing: string | null;
  appointment_fee: string | null;
  serial_available: boolean | null;
}

interface AdminDoctorControlsProps {
  doctor: Doctor;
  chambers: Chamber[];
  onUpdate: () => void;
}

const specialties = [
  "General Physician",
  "Cardiologist",
  "Neurologist",
  "Pediatrician",
  "Dermatologist",
  "Orthopedic",
  "Gynecologist",
  "ENT Specialist",
  "Psychiatrist",
  "Ophthalmologist",
  "Urologist",
  "Gastroenterologist",
];

const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function AdminDoctorControls({ doctor, chambers, onUpdate }: AdminDoctorControlsProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChamberDialog, setShowChamberDialog] = useState(false);
  const [editingChamber, setEditingChamber] = useState<Chamber | null>(null);
  const [processing, setProcessing] = useState(false);

  const [doctorForm, setDoctorForm] = useState({
    full_name: doctor.full_name,
    email: doctor.email,
    phone: doctor.phone || "",
    specialization: doctor.specialization,
    registration_number: doctor.registration_number,
    experience_years: doctor.experience_years?.toString() || "",
    hospital_affiliation: doctor.hospital_affiliation || "",
    is_featured: doctor.is_featured,
    featured_rank: doctor.featured_rank?.toString() || "",
  });

  const [chamberForm, setChamberForm] = useState({
    name: "",
    address: "",
    phone: "",
    timing: "",
    appointment_fee: "",
    days: [] as string[],
    serial_available: true,
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  };

  if (!isAdmin) return null;

  const handleUpdateDoctor = async () => {
    setProcessing(true);
    const { error } = await supabase
      .from("doctors")
      .update({
        full_name: doctorForm.full_name,
        email: doctorForm.email,
        phone: doctorForm.phone || null,
        specialization: doctorForm.specialization,
        registration_number: doctorForm.registration_number,
        experience_years: doctorForm.experience_years ? parseInt(doctorForm.experience_years) : null,
        hospital_affiliation: doctorForm.hospital_affiliation || null,
        is_featured: doctorForm.is_featured,
        featured_rank: doctorForm.featured_rank ? parseInt(doctorForm.featured_rank) : null,
      })
      .eq("id", doctor.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to update doctor");
      console.error(error);
    } else {
      toast.success("Doctor updated successfully");
      setShowEditDialog(false);
      onUpdate();
    }
  };

  const handleToggleActive = async () => {
    setProcessing(true);
    const newStatus = !doctor.is_active;
    const { error } = await supabase
      .from("doctors")
      .update({ is_active: newStatus })
      .eq("id", doctor.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Doctor ${newStatus ? "activated" : "hidden"}`);
      onUpdate();
    }
  };

  const handleToggleVerification = async (status: "approved" | "rejected") => {
    setProcessing(true);
    const { error } = await supabase
      .from("doctors")
      .update({ verification_status: status })
      .eq("id", doctor.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to update verification");
    } else {
      toast.success(`Doctor ${status}`);
      onUpdate();
    }
  };

  const handleDeleteDoctor = async () => {
    setProcessing(true);
    const { error } = await supabase
      .from("doctors")
      .delete()
      .eq("id", doctor.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to delete doctor");
    } else {
      toast.success("Doctor deleted");
      setShowDeleteDialog(false);
      onUpdate();
    }
  };

  const openEditChamber = (chamber: Chamber) => {
    setEditingChamber(chamber);
    setChamberForm({
      name: chamber.name,
      address: chamber.address,
      phone: chamber.phone || "",
      timing: chamber.timing || "",
      appointment_fee: chamber.appointment_fee || "",
      days: chamber.days || [],
      serial_available: chamber.serial_available ?? true,
    });
    setShowChamberDialog(true);
  };

  const openAddChamber = () => {
    setEditingChamber(null);
    setChamberForm({
      name: "",
      address: "",
      phone: "",
      timing: "",
      appointment_fee: "",
      days: [],
      serial_available: true,
    });
    setShowChamberDialog(true);
  };

  const handleSaveChamber = async () => {
    if (!chamberForm.name || !chamberForm.address) {
      toast.error("Please fill chamber name and address");
      return;
    }

    setProcessing(true);

    if (editingChamber) {
      const { error } = await supabase
        .from("doctor_chambers")
        .update({
          name: chamberForm.name,
          address: chamberForm.address,
          phone: chamberForm.phone || null,
          timing: chamberForm.timing || null,
          appointment_fee: chamberForm.appointment_fee || null,
          days: chamberForm.days,
          serial_available: chamberForm.serial_available,
        })
        .eq("id", editingChamber.id);

      if (error) {
        toast.error("Failed to update chamber");
      } else {
        toast.success("Chamber updated");
        setShowChamberDialog(false);
        onUpdate();
      }
    } else {
      const { error } = await supabase.from("doctor_chambers").insert({
        doctor_id: doctor.id,
        name: chamberForm.name,
        address: chamberForm.address,
        phone: chamberForm.phone || null,
        timing: chamberForm.timing || null,
        appointment_fee: chamberForm.appointment_fee || null,
        days: chamberForm.days,
        serial_available: chamberForm.serial_available,
      });

      if (error) {
        toast.error("Failed to add chamber");
      } else {
        toast.success("Chamber added");
        setShowChamberDialog(false);
        onUpdate();
      }
    }

    setProcessing(false);
  };

  const handleDeleteChamber = async (chamberId: string) => {
    const { error } = await supabase
      .from("doctor_chambers")
      .delete()
      .eq("id", chamberId);

    if (error) {
      toast.error("Failed to delete chamber");
    } else {
      toast.success("Chamber deleted");
      onUpdate();
    }
  };

  const toggleDay = (day: string) => {
    setChamberForm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  return (
    <>
      {/* Admin Control Bar */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Admin Controls</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleActive}
              disabled={processing}
              className="gap-1"
            >
              {doctor.is_active ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openAddChamber}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Chamber
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Chamber Quick Edit */}
        {chambers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-primary/20">
            <p className="text-xs text-muted-foreground mb-2">Chambers ({chambers.length})</p>
            <div className="flex flex-wrap gap-2">
              {chambers.map((chamber) => (
                <button
                  key={chamber.id}
                  onClick={() => openEditChamber(chamber)}
                  className="flex items-center gap-1 px-2 py-1 bg-background rounded text-xs hover:bg-muted transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  {chamber.name}
                  <Edit className="w-3 h-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Doctor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={doctorForm.full_name}
                onChange={(e) => setDoctorForm(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={doctorForm.email}
                onChange={(e) => setDoctorForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={doctorForm.phone}
                onChange={(e) => setDoctorForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Specialization *</Label>
              <Select
                value={doctorForm.specialization}
                onValueChange={(value) => setDoctorForm(prev => ({ ...prev, specialization: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Registration Number *</Label>
              <Input
                value={doctorForm.registration_number}
                onChange={(e) => setDoctorForm(prev => ({ ...prev, registration_number: e.target.value }))}
              />
            </div>
            <div>
              <Label>Experience (Years)</Label>
              <Input
                type="number"
                value={doctorForm.experience_years}
                onChange={(e) => setDoctorForm(prev => ({ ...prev, experience_years: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Hospital Affiliation</Label>
              <Input
                value={doctorForm.hospital_affiliation}
                onChange={(e) => setDoctorForm(prev => ({ ...prev, hospital_affiliation: e.target.value }))}
              />
            </div>
            <div>
              <Label>Featured</Label>
              <Select
                value={doctorForm.is_featured ? "yes" : "no"}
                onValueChange={(value) => setDoctorForm(prev => ({ ...prev, is_featured: value === "yes" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes - Featured</SelectItem>
                  <SelectItem value="no">No - Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Featured Rank</Label>
              <Input
                type="number"
                placeholder="1 = highest priority"
                value={doctorForm.featured_rank}
                onChange={(e) => setDoctorForm(prev => ({ ...prev, featured_rank: e.target.value }))}
              />
            </div>
          </div>

          {/* Quick Status Controls */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Quick Actions:</span>
            {doctor.verification_status !== "approved" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleVerification("approved")}
                disabled={processing}
                className="gap-1 text-healthcare-green border-healthcare-green"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </Button>
            )}
            {doctor.verification_status !== "rejected" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleVerification("rejected")}
                disabled={processing}
                className="gap-1 text-destructive border-destructive"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDoctor} disabled={processing}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chamber Dialog */}
      <Dialog open={showChamberDialog} onOpenChange={setShowChamberDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingChamber ? "Edit Chamber" : "Add Chamber"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Chamber Name *</Label>
              <Input
                placeholder="e.g., Main Clinic"
                value={chamberForm.name}
                onChange={(e) => setChamberForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Address *</Label>
              <Input
                placeholder="Full address"
                value={chamberForm.address}
                onChange={(e) => setChamberForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                placeholder="Contact number"
                value={chamberForm.phone}
                onChange={(e) => setChamberForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Timing</Label>
              <Input
                placeholder="e.g., 5:00 PM - 9:00 PM"
                value={chamberForm.timing}
                onChange={(e) => setChamberForm(prev => ({ ...prev, timing: e.target.value }))}
              />
            </div>
            <div>
              <Label>Appointment Fee (৳)</Label>
              <Input
                placeholder="e.g., 500"
                value={chamberForm.appointment_fee}
                onChange={(e) => setChamberForm(prev => ({ ...prev, appointment_fee: e.target.value }))}
              />
            </div>
            <div>
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      chamberForm.days.includes(day)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="serial_available"
                checked={chamberForm.serial_available}
                onChange={(e) => setChamberForm(prev => ({ ...prev, serial_available: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label htmlFor="serial_available" className="cursor-pointer">
                Serial/Appointment Available
              </Label>
            </div>

            {editingChamber && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  handleDeleteChamber(editingChamber.id);
                  setShowChamberDialog(false);
                }}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete This Chamber
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChamberDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChamber} disabled={processing}>
              {editingChamber ? "Update Chamber" : "Add Chamber"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {doctor.full_name} and all their chambers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDoctor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
