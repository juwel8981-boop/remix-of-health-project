import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Edit, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp,
  Stethoscope, Eye, AlertCircle, Plus, Trash2, MapPin, Power, PowerOff,
  Phone, Calendar, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Doctor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  specialization: string;
  registration_number: string;
  experience_years: number | null;
  hospital_affiliation: string | null;
  documents_url: string | null;
  verification_status: string;
  rejection_reason: string | null;
  created_at: string;
  is_active: boolean;
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

const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function DoctorManager() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [chambers, setChambers] = useState<Record<string, Chamber[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);
  const [showChamberDialog, setShowChamberDialog] = useState(false);
  const [selectedDoctorForChamber, setSelectedDoctorForChamber] = useState<Doctor | null>(null);
  const [editingChamber, setEditingChamber] = useState<Chamber | null>(null);
  const [chamberToDelete, setChamberToDelete] = useState<Chamber | null>(null);
  const [showEditDoctorDialog, setShowEditDoctorDialog] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  
  const [newDoctorForm, setNewDoctorForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    registration_number: "",
    experience_years: "",
    hospital_affiliation: "",
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
  
  const [savingChamber, setSavingChamber] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch doctors");
      console.error(error);
      setDoctors([]);
    } else {
      setDoctors(data || []);
      // Fetch chambers for all doctors
      if (data && data.length > 0) {
        fetchAllChambers(data.map(d => d.id));
      }
    }
    setLoading(false);
  };

  const fetchAllChambers = async (doctorIds: string[]) => {
    const { data, error } = await supabase
      .from("doctor_chambers")
      .select("*")
      .in("doctor_id", doctorIds);

    if (error) {
      console.error("Failed to fetch chambers:", error);
      return;
    }

    const chambersByDoctor: Record<string, Chamber[]> = {};
    (data || []).forEach((chamber) => {
      if (!chambersByDoctor[chamber.doctor_id]) {
        chambersByDoctor[chamber.doctor_id] = [];
      }
      chambersByDoctor[chamber.doctor_id].push(chamber);
    });
    setChambers(chambersByDoctor);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || doctor.verification_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = doctors.filter(d => d.verification_status === "pending").length;
  const approvedCount = doctors.filter(d => d.verification_status === "approved").length;
  const rejectedCount = doctors.filter(d => d.verification_status === "rejected").length;
  const totalChambers = Object.values(chambers).flat().length;

  const sendVerificationEmail = async (doctor: Doctor, status: "approved" | "rejected", reason?: string) => {
    try {
      const { error } = await supabase.functions.invoke("send-verification-email", {
        body: {
          doctorName: doctor.full_name,
          doctorEmail: doctor.email,
          status,
          rejectionReason: reason,
        },
      });

      if (error) {
        console.error("Failed to send email:", error);
        toast.error("Status updated but email notification failed");
      } else {
        toast.success(`Email notification sent to ${doctor.email}`);
      }
    } catch (err) {
      console.error("Email sending error:", err);
    }
  };

  const handleApprove = async (doctor: Doctor) => {
    setProcessingId(doctor.id);
    const { error } = await supabase
      .from("doctors")
      .update({ 
        verification_status: "approved",
        rejection_reason: null 
      })
      .eq("id", doctor.id);

    if (error) {
      toast.error("Failed to approve doctor");
      console.error(error);
    } else {
      toast.success(`${doctor.full_name} has been approved`);
      await sendVerificationEmail(doctor, "approved");
      fetchDoctors();
    }
    setProcessingId(null);
  };

  const handleReject = async () => {
    if (!selectedDoctor || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessingId(selectedDoctor.id);
    const { error } = await supabase
      .from("doctors")
      .update({ 
        verification_status: "rejected",
        rejection_reason: rejectionReason 
      })
      .eq("id", selectedDoctor.id);

    if (error) {
      toast.error("Failed to reject doctor");
      console.error(error);
    } else {
      toast.success(`${selectedDoctor.full_name} has been rejected`);
      await sendVerificationEmail(selectedDoctor, "rejected", rejectionReason);
      fetchDoctors();
    }
    setShowRejectDialog(false);
    setSelectedDoctor(null);
    setRejectionReason("");
    setProcessingId(null);
  };

  const openRejectDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setRejectionReason(doctor.rejection_reason || "");
    setShowRejectDialog(true);
  };

  const handleAddDoctor = async () => {
    if (!newDoctorForm.full_name || !newDoctorForm.email || !newDoctorForm.specialization || !newDoctorForm.registration_number) {
      toast.error("Please fill all required fields");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("You must be logged in");
      return;
    }

    const { error } = await supabase.from("doctors").insert({
      user_id: userData.user.id,
      full_name: newDoctorForm.full_name,
      email: newDoctorForm.email,
      phone: newDoctorForm.phone || null,
      specialization: newDoctorForm.specialization,
      registration_number: newDoctorForm.registration_number,
      experience_years: newDoctorForm.experience_years ? parseInt(newDoctorForm.experience_years) : null,
      hospital_affiliation: newDoctorForm.hospital_affiliation || null,
      verification_status: "approved",
    });

    if (error) {
      toast.error("Failed to add doctor");
      console.error(error);
    } else {
      toast.success("Doctor added successfully");
      setShowAddDialog(false);
      setNewDoctorForm({
        full_name: "",
        email: "",
        phone: "",
        specialization: "",
        registration_number: "",
        experience_years: "",
        hospital_affiliation: "",
      });
      fetchDoctors();
    }
  };

  const handleEditDoctor = async () => {
    if (!editingDoctor) return;
    
    const { error } = await supabase
      .from("doctors")
      .update({
        full_name: newDoctorForm.full_name,
        email: newDoctorForm.email,
        phone: newDoctorForm.phone || null,
        specialization: newDoctorForm.specialization,
        registration_number: newDoctorForm.registration_number,
        experience_years: newDoctorForm.experience_years ? parseInt(newDoctorForm.experience_years) : null,
        hospital_affiliation: newDoctorForm.hospital_affiliation || null,
      })
      .eq("id", editingDoctor.id);

    if (error) {
      toast.error("Failed to update doctor");
      console.error(error);
    } else {
      toast.success("Doctor updated successfully");
      setShowEditDoctorDialog(false);
      setEditingDoctor(null);
      setNewDoctorForm({
        full_name: "",
        email: "",
        phone: "",
        specialization: "",
        registration_number: "",
        experience_years: "",
        hospital_affiliation: "",
      });
      fetchDoctors();
    }
  };

  const openEditDoctorDialog = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setNewDoctorForm({
      full_name: doctor.full_name,
      email: doctor.email,
      phone: doctor.phone || "",
      specialization: doctor.specialization,
      registration_number: doctor.registration_number,
      experience_years: doctor.experience_years?.toString() || "",
      hospital_affiliation: doctor.hospital_affiliation || "",
    });
    setShowEditDoctorDialog(true);
  };

  const handleDeleteDoctor = async () => {
    if (!doctorToDelete) return;

    const { error } = await supabase
      .from("doctors")
      .delete()
      .eq("id", doctorToDelete.id);

    if (error) {
      toast.error("Failed to delete doctor");
      console.error(error);
    } else {
      toast.success(`${doctorToDelete.full_name} has been deleted`);
      fetchDoctors();
    }
    setShowDeleteDialog(false);
    setDoctorToDelete(null);
  };

  const handleToggleActive = async (doctor: Doctor) => {
    setProcessingId(doctor.id);
    const newStatus = !doctor.is_active;
    const { error } = await supabase
      .from("doctors")
      .update({ is_active: newStatus })
      .eq("id", doctor.id);

    if (error) {
      toast.error("Failed to update doctor status");
      console.error(error);
    } else {
      toast.success(`${doctor.full_name} has been ${newStatus ? 'activated' : 'deactivated'}`);
      fetchDoctors();
    }
    setProcessingId(null);
  };

  // Chamber functions
  const openAddChamberDialog = (doctor: Doctor) => {
    setSelectedDoctorForChamber(doctor);
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

  const openEditChamberDialog = (doctor: Doctor, chamber: Chamber) => {
    setSelectedDoctorForChamber(doctor);
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

  const handleSaveChamber = async () => {
    if (!chamberForm.name || !chamberForm.address) {
      toast.error("Please fill chamber name and address");
      return;
    }
    
    if (!selectedDoctorForChamber) {
      toast.error("No doctor selected");
      return;
    }

    setSavingChamber(true);

    if (editingChamber) {
      // Update existing chamber
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

      setSavingChamber(false);

      if (error) {
        console.error("Error updating chamber:", error);
        toast.error("Failed to update chamber");
        return;
      }

      toast.success(`Chamber "${chamberForm.name}" updated`);
    } else {
      // Add new chamber
      const { error } = await supabase.from("doctor_chambers").insert({
        doctor_id: selectedDoctorForChamber.id,
        name: chamberForm.name,
        address: chamberForm.address,
        phone: chamberForm.phone || null,
        timing: chamberForm.timing || null,
        appointment_fee: chamberForm.appointment_fee || null,
        days: chamberForm.days,
        serial_available: chamberForm.serial_available,
      });

      setSavingChamber(false);

      if (error) {
        console.error("Error saving chamber:", error);
        toast.error("Failed to save chamber");
        return;
      }

      toast.success(`Chamber "${chamberForm.name}" added for ${selectedDoctorForChamber.full_name}`);
    }

    setShowChamberDialog(false);
    setEditingChamber(null);
    fetchAllChambers(doctors.map(d => d.id));
  };

  const handleDeleteChamber = async () => {
    if (!chamberToDelete) return;

    const { error } = await supabase
      .from("doctor_chambers")
      .delete()
      .eq("id", chamberToDelete.id);

    if (error) {
      toast.error("Failed to delete chamber");
      console.error(error);
    } else {
      toast.success("Chamber deleted");
      fetchAllChambers(doctors.map(d => d.id));
    }
    setChamberToDelete(null);
  };

  const toggleDay = (day: string) => {
    setChamberForm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Doctor Management</h2>
          <p className="text-muted-foreground">Manage doctors, verification, and their chamber locations</p>
        </div>
        <Button variant="healthcare" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Doctor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingCount}</p>
              <p className="text-sm text-amber-600 dark:text-amber-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{approvedCount}</p>
              <p className="text-sm text-green-600 dark:text-green-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{rejectedCount}</p>
              <p className="text-sm text-red-600 dark:text-red-500">Rejected</p>
            </div>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{totalChambers}</p>
              <p className="text-sm text-primary/80">Total Chambers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, specialization, or registration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Doctors List with Expandable Chambers */}
      <div className="space-y-4">
        {filteredDoctors.map((doctor) => {
          const doctorChambers = chambers[doctor.id] || [];
          const isExpanded = expandedDoctor === doctor.id;

          return (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Doctor Row */}
              <div className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">{doctor.full_name}</h3>
                        {getStatusBadge(doctor.verification_status)}
                        {doctor.verification_status === "approved" && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            doctor.is_active 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {doctor.is_active ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                            {doctor.is_active ? "Active" : "Inactive"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{doctor.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {doctor.specialization} • {doctor.registration_number}
                        {doctor.experience_years && ` • ${doctor.experience_years} yrs exp`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {doctor.verification_status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={() => handleApprove(doctor)}
                          disabled={processingId === doctor.id}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => openRejectDialog(doctor)}
                          disabled={processingId === doctor.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {doctor.verification_status === "approved" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={doctor.is_active 
                          ? "text-amber-600 hover:text-amber-700 hover:bg-amber-100" 
                          : "text-green-600 hover:text-green-700 hover:bg-green-100"
                        }
                        onClick={() => handleToggleActive(doctor)}
                        disabled={processingId === doctor.id}
                      >
                        {doctor.is_active ? <PowerOff className="w-4 h-4 mr-1" /> : <Power className="w-4 h-4 mr-1" />}
                        {doctor.is_active ? "Hide" : "Show"}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDoctorDialog(doctor)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      onClick={() => {
                        setDoctorToDelete(doctor);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedDoctor(isExpanded ? null : doctor.id)}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Chambers ({doctorChambers.length})
                      {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                    </Button>
                  </div>
                </div>

                {doctor.rejection_reason && doctor.verification_status === "rejected" && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      <strong>Rejection Reason:</strong> {doctor.rejection_reason}
                    </p>
                  </div>
                )}
              </div>

              {/* Chambers Section */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border overflow-hidden"
                  >
                    <div className="p-4 bg-muted/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">Chamber Locations</h4>
                        <Button
                          variant="healthcare"
                          size="sm"
                          onClick={() => openAddChamberDialog(doctor)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Chamber
                        </Button>
                      </div>

                      {doctorChambers.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No chambers added yet. Add a chamber location for this doctor.
                        </p>
                      ) : (
                        <div className="grid gap-3">
                          {doctorChambers.map((chamber) => (
                            <div
                              key={chamber.id}
                              className="p-4 rounded-xl bg-background border border-border"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-foreground flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                    {chamber.name}
                                  </h5>
                                  <p className="text-sm text-muted-foreground mt-1">{chamber.address}</p>
                                  
                                  <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
                                    {chamber.days && chamber.days.length > 0 && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{chamber.days.join(", ")}</span>
                                      </div>
                                    )}
                                    {chamber.timing && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                        <span>{chamber.timing}</span>
                                      </div>
                                    )}
                                    {chamber.phone && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                        <span>{chamber.phone}</span>
                                      </div>
                                    )}
                                    {chamber.appointment_fee && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Fee:</span>
                                        <span className="font-semibold text-foreground">{chamber.appointment_fee}</span>
                                      </div>
                                    )}
                                  </div>

                                  {chamber.serial_available && (
                                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                      Serial Available
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openEditChamberDialog(doctor, chamber)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => setChamberToDelete(chamber)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {doctors.length === 0 
                ? "No doctor registrations yet." 
                : "No doctors found matching your criteria."}
            </p>
          </div>
        )}
      </div>

      {/* View Doctor Dialog */}
      <Dialog open={selectedDoctor !== null && !showRejectDialog} onOpenChange={() => setSelectedDoctor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Doctor Details</DialogTitle>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedDoctor.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedDoctor.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedDoctor.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Specialization</Label>
                  <p className="font-medium">{selectedDoctor.specialization}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Registration Number</Label>
                  <p className="font-medium font-mono">{selectedDoctor.registration_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Experience</Label>
                  <p className="font-medium">
                    {selectedDoctor.experience_years ? `${selectedDoctor.experience_years} years` : "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Hospital Affiliation</Label>
                  <p className="font-medium">{selectedDoctor.hospital_affiliation || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedDoctor.verification_status)}</div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                {selectedDoctor.verification_status !== "approved" && (
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApprove(selectedDoctor);
                      setSelectedDoctor(null);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
                {selectedDoctor.verification_status !== "rejected" && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Reject Doctor Application
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Please provide a reason for rejecting <strong>{selectedDoctor?.full_name}</strong>'s application.
            </p>
            <div>
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Invalid registration number, incomplete documentation..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processingId !== null}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Doctor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Full Name *</Label>
                <Input
                  value={newDoctorForm.full_name}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Dr. Full Name"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newDoctorForm.email}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="doctor@email.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newDoctorForm.phone}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+880 XXXX-XXXXXX"
                />
              </div>
              <div>
                <Label>Specialization *</Label>
                <Input
                  value={newDoctorForm.specialization}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="e.g., Cardiologist"
                />
              </div>
              <div>
                <Label>Registration Number *</Label>
                <Input
                  value={newDoctorForm.registration_number}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, registration_number: e.target.value }))}
                  placeholder="BMDC-XXXXX"
                />
              </div>
              <div>
                <Label>Experience (Years)</Label>
                <Input
                  type="number"
                  value={newDoctorForm.experience_years}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, experience_years: e.target.value }))}
                  placeholder="10"
                />
              </div>
              <div>
                <Label>Hospital Affiliation</Label>
                <Input
                  value={newDoctorForm.hospital_affiliation}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, hospital_affiliation: e.target.value }))}
                  placeholder="e.g., Square Hospital"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button variant="healthcare" onClick={handleAddDoctor}>
              <Plus className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={showEditDoctorDialog} onOpenChange={setShowEditDoctorDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Full Name *</Label>
                <Input
                  value={newDoctorForm.full_name}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Dr. Full Name"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newDoctorForm.email}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="doctor@email.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newDoctorForm.phone}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+880 XXXX-XXXXXX"
                />
              </div>
              <div>
                <Label>Specialization *</Label>
                <Input
                  value={newDoctorForm.specialization}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="e.g., Cardiologist"
                />
              </div>
              <div>
                <Label>Registration Number *</Label>
                <Input
                  value={newDoctorForm.registration_number}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, registration_number: e.target.value }))}
                  placeholder="BMDC-XXXXX"
                />
              </div>
              <div>
                <Label>Experience (Years)</Label>
                <Input
                  type="number"
                  value={newDoctorForm.experience_years}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, experience_years: e.target.value }))}
                  placeholder="10"
                />
              </div>
              <div>
                <Label>Hospital Affiliation</Label>
                <Input
                  value={newDoctorForm.hospital_affiliation}
                  onChange={(e) => setNewDoctorForm(prev => ({ ...prev, hospital_affiliation: e.target.value }))}
                  placeholder="e.g., Square Hospital"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDoctorDialog(false)}>Cancel</Button>
            <Button variant="healthcare" onClick={handleEditDoctor}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Doctor Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{doctorToDelete?.full_name}</strong>? This will also delete all their chambers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteDoctor}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Chamber Dialog */}
      <AlertDialog open={chamberToDelete !== null} onOpenChange={() => setChamberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chamber</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the chamber "{chamberToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteChamber}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Chamber Dialog */}
      <Dialog open={showChamberDialog} onOpenChange={setShowChamberDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingChamber ? "Edit Chamber" : "Add Chamber"} for {selectedDoctorForChamber?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Chamber Name *</Label>
              <Input
                value={chamberForm.name}
                onChange={(e) => setChamberForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Square Hospital, Personal Chamber"
              />
            </div>
            <div>
              <Label>Address *</Label>
              <Textarea
                value={chamberForm.address}
                onChange={(e) => setChamberForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address with area and city"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={chamberForm.phone}
                  onChange={(e) => setChamberForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+880 XXXX-XXXXXX"
                />
              </div>
              <div>
                <Label>Timing</Label>
                <Input
                  value={chamberForm.timing}
                  onChange={(e) => setChamberForm(prev => ({ ...prev, timing: e.target.value }))}
                  placeholder="e.g., 4:00 PM - 8:00 PM"
                />
              </div>
            </div>
            <div>
              <Label>Appointment Fee</Label>
              <Input
                value={chamberForm.appointment_fee}
                onChange={(e) => setChamberForm(prev => ({ ...prev, appointment_fee: e.target.value }))}
                placeholder="e.g., ৳1,500"
              />
            </div>
            <div>
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={chamberForm.days.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day)}
                  >
                    {day.substring(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="serialAvailable"
                checked={chamberForm.serial_available}
                onChange={(e) => setChamberForm(prev => ({ ...prev, serial_available: e.target.checked }))}
                className="rounded border-border"
              />
              <Label htmlFor="serialAvailable" className="cursor-pointer">Serial Available</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChamberDialog(false)}>Cancel</Button>
            <Button variant="healthcare" onClick={handleSaveChamber} disabled={savingChamber}>
              <Save className="w-4 h-4 mr-2" />
              {savingChamber ? "Saving..." : (editingChamber ? "Update Chamber" : "Add Chamber")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
