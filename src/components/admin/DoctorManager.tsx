import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Edit, CheckCircle2, XCircle, Clock,
  Stethoscope, Eye, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      <div>
        <h2 className="text-xl font-bold text-foreground">Doctor Verification</h2>
        <p className="text-muted-foreground">Review and verify doctor registration requests</p>
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
    </div>
  );
}
