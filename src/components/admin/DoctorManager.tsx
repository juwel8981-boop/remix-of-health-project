import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Edit, CheckCircle2, XCircle, Clock,
  Stethoscope, Eye, AlertCircle, Plus, Trash2, MapPin, Power, PowerOff
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

export default function DoctorManager() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
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
  const [showChamberDialog, setShowChamberDialog] = useState(false);
  const [selectedDoctorForChamber, setSelectedDoctorForChamber] = useState<Doctor | null>(null);
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
    }
    setLoading(false);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.registration_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || doctor.verification_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = doctors.filter(d => d.verification_status === "pending").length;
  const approvedCount = doctors.filter(d => d.verification_status === "approved").length;
  const rejectedCount = doctors.filter(d => d.verification_status === "rejected").length;
  const activeCount = doctors.filter(d => d.verification_status === "approved" && d.is_active).length;
  const inactiveCount = doctors.filter(d => d.verification_status === "approved" && !d.is_active).length;

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

  const openChamberDialog = (doctor: Doctor) => {
    setSelectedDoctorForChamber(doctor);
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

  const handleAddChamber = async () => {
    if (!chamberForm.name || !chamberForm.address) {
      toast.error("Please fill chamber name and address");
      return;
    }
    
    if (!selectedDoctorForChamber) {
      toast.error("No doctor selected");
      return;
    }

    setSavingChamber(true);
    
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
      toast.error("Failed to save chamber. Please try again.");
      return;
    }

    toast.success(`Chamber "${chamberForm.name}" added for ${selectedDoctorForChamber.full_name}`);
    setShowChamberDialog(false);
    setChamberForm({
      name: "",
      address: "",
      phone: "",
      timing: "",
      appointment_fee: "",
      days: [],
      serial_available: true,
    });
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
          <p className="text-muted-foreground">Add, verify, and manage doctor profiles</p>
        </div>
        <Button variant="healthcare" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Doctor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
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
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or registration number..."
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

      {/* Doctors Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Doctor</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Specialization</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Registration #</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Active</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <motion.tr
                  key={doctor.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-foreground">{doctor.full_name}</p>
                      <p className="text-sm text-muted-foreground">{doctor.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-foreground">{doctor.specialization}</td>
                  <td className="py-4 px-4 text-muted-foreground font-mono text-sm">
                    {doctor.registration_number}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(doctor.verification_status)}
                    {doctor.rejection_reason && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                        {doctor.rejection_reason}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {doctor.verification_status === "approved" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={doctor.is_active 
                          ? "text-green-600 hover:text-green-700 hover:bg-green-100" 
                          : "text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                        }
                        onClick={() => handleToggleActive(doctor)}
                        disabled={processingId === doctor.id}
                      >
                        {doctor.is_active ? (
                          <>
                            <Power className="w-4 h-4 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <PowerOff className="w-4 h-4 mr-1" />
                            Inactive
                          </>
                        )}
                      </Button>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
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
                      {doctor.verification_status === "rejected" && (
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
                      )}
                      {doctor.verification_status === "approved" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => openRejectDialog(doctor)}
                          disabled={processingId === doctor.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Revoke
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
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary hover:bg-primary hover:text-white"
                        onClick={() => openChamberDialog(doctor)}
                        title="Add chamber location"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Chamber
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
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
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
                {selectedDoctor.rejection_reason && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Rejection Reason</Label>
                    <p className="font-medium text-red-600">{selectedDoctor.rejection_reason}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Registered On</Label>
                  <p className="font-medium">
                    {new Date(selectedDoctor.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
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
                    onClick={() => {
                      setShowRejectDialog(true);
                    }}
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
              This will be visible to the doctor.
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
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{doctorToDelete?.full_name}</strong>? This action cannot be undone.
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

      {/* Add Chamber Dialog */}
      <Dialog open={showChamberDialog} onOpenChange={setShowChamberDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Chamber for {selectedDoctorForChamber?.full_name}</DialogTitle>
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
                {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={chamberForm.days.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setChamberForm(prev => ({
                        ...prev,
                        days: prev.days.includes(day)
                          ? prev.days.filter(d => d !== day)
                          : [...prev.days, day]
                      }));
                    }}
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
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="serialAvailable" className="cursor-pointer">
                Serial Available
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChamberDialog(false)}>Cancel</Button>
            <Button variant="healthcare" onClick={handleAddChamber} disabled={savingChamber}>
              {savingChamber ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Chamber
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
