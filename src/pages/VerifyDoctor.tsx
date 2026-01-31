import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, XCircle, Shield, AlertCircle, User, Building2, GraduationCap, Calendar, Settings, Eye, EyeOff, Edit, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Doctor {
  id: string;
  full_name: string;
  registration_number: string;
  specialization: string;
  hospital_affiliation: string | null;
  experience_years: number | null;
  verification_status: string;
  is_active: boolean;
  created_at: string;
  email: string;
  phone: string | null;
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

export default function VerifyDoctor() {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [searchResult, setSearchResult] = useState<Doctor | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // Admin mode
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [processing, setProcessing] = useState(false);

  const [doctorForm, setDoctorForm] = useState({
    full_name: "",
    registration_number: "",
    specialization: "",
    hospital_affiliation: "",
    experience_years: "",
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (adminMode) {
      fetchAllDoctors();
    }
  }, [adminMode]);

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

  const fetchAllDoctors = async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching doctors:", error);
    } else {
      setAllDoctors(data || []);
    }
  };

  const handleSearch = async () => {
    if (!registrationNumber.trim()) return;
    
    setIsSearching(true);
    setSearched(false);

    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .ilike("registration_number", registrationNumber.trim())
        .eq("verification_status", "approved")
        .eq("is_active", true)
        .single();

      if (error) {
        setSearchResult(null);
      } else {
        setSearchResult(data);
      }
    } catch (error) {
      console.error("Error searching doctor:", error);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
      setSearched(true);
    }
  };

  const openEditDialog = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({
      full_name: doctor.full_name,
      registration_number: doctor.registration_number,
      specialization: doctor.specialization,
      hospital_affiliation: doctor.hospital_affiliation || "",
      experience_years: doctor.experience_years?.toString() || "",
    });
    setShowEditDialog(true);
  };

  const handleUpdateDoctor = async () => {
    if (!editingDoctor) return;
    setProcessing(true);

    const { error } = await supabase
      .from("doctors")
      .update({
        full_name: doctorForm.full_name,
        registration_number: doctorForm.registration_number,
        specialization: doctorForm.specialization,
        hospital_affiliation: doctorForm.hospital_affiliation || null,
        experience_years: doctorForm.experience_years ? parseInt(doctorForm.experience_years) : null,
      })
      .eq("id", editingDoctor.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to update doctor");
    } else {
      toast.success("Doctor updated successfully");
      setShowEditDialog(false);
      fetchAllDoctors();
    }
  };

  const handleToggleVerification = async (doctor: Doctor, status: "approved" | "rejected") => {
    setProcessing(true);
    const { error } = await supabase
      .from("doctors")
      .update({ verification_status: status })
      .eq("id", doctor.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Doctor ${status}`);
      fetchAllDoctors();
    }
  };

  const handleToggleActive = async (doctor: Doctor) => {
    setProcessing(true);
    const { error } = await supabase
      .from("doctors")
      .update({ is_active: !doctor.is_active })
      .eq("id", doctor.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Doctor ${!doctor.is_active ? "activated" : "hidden"}`);
      fetchAllDoctors();
    }
  };

  const getStatusBadge = (doctor: Doctor) => {
    if (doctor.verification_status === "pending") {
      return <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">Pending</span>;
    }
    if (doctor.verification_status === "rejected") {
      return <span className="text-xs px-2 py-1 bg-destructive/20 text-destructive rounded">Rejected</span>;
    }
    if (!doctor.is_active) {
      return <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">Hidden</span>;
    }
    return <span className="text-xs px-2 py-1 bg-healthcare-green/20 text-healthcare-green rounded">Active</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-secondary py-16">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Verify Doctor Credentials
            </h1>
            <p className="text-primary-foreground/80">
              Ensure your doctor is registered with the Bangladesh Medical & Dental Council (BM&DC)
            </p>
          </motion.div>

          {/* Admin Mode Toggle */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mt-6"
            >
              <Button
                variant={adminMode ? "accent" : "outline"}
                onClick={() => setAdminMode(!adminMode)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                {adminMode ? "Exit Admin Mode" : "Admin Mode"}
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Admin Panel - Doctor List */}
      {adminMode && (
        <section className="healthcare-section">
          <div className="healthcare-container">
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                All Registered Doctors ({allDoctors.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage doctor verification status and visibility
              </p>
            </div>

            <div className="grid gap-4">
              {allDoctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="healthcare-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{doctor.full_name}</h3>
                          {getStatusBadge(doctor)}
                        </div>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reg: {doctor.registration_number} • {doctor.hospital_affiliation || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(doctor)}
                        className="gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(doctor)}
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
                      {doctor.verification_status !== "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleVerification(doctor, "approved")}
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
                          onClick={() => handleToggleVerification(doctor, "rejected")}
                          disabled={processing}
                          className="gap-1 text-destructive border-destructive"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {allDoctors.length === 0 && (
                <div className="text-center py-12">
                  <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No doctors registered yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Search Section - Public */}
      {!adminMode && (
        <section className="healthcare-section">
          <div className="healthcare-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="healthcare-card">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Enter Registration Number
                </h2>
                <p className="text-muted-foreground mb-6">
                  Enter the doctor's BM&DC registration number to verify their credentials.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-input bg-background">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g., BM&DC-12345"
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground uppercase"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Button
                    variant="healthcare"
                    size="lg"
                    onClick={handleSearch}
                    disabled={!registrationNumber.trim() || isSearching}
                  >
                    {isSearching ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-muted">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Search by Registration Number:</p>
                      <p>Enter the doctor's official registration number to verify their credentials.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              {searched && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  {searchResult ? (
                    <div className="healthcare-card border-2 border-healthcare-green">
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                        <div className="w-12 h-12 rounded-full bg-healthcare-green-light flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-healthcare-green" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-semibold text-healthcare-green">
                            Verified Doctor
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            This doctor is registered and verified
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-32 h-32 rounded-xl bg-primary/10 flex items-center justify-center mx-auto sm:mx-0">
                          <Stethoscope className="w-12 h-12 text-primary" />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Full Name</p>
                              <p className="font-semibold text-foreground">{searchResult.full_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Registration Number</p>
                              <p className="font-semibold text-foreground">{searchResult.registration_number}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <GraduationCap className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Specialization</p>
                              <p className="font-semibold text-foreground">{searchResult.specialization}</p>
                            </div>
                          </div>
                          {searchResult.hospital_affiliation && (
                            <div className="flex items-center gap-3">
                              <Building2 className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Hospital Affiliation</p>
                                <p className="font-semibold text-foreground">{searchResult.hospital_affiliation}</p>
                              </div>
                            </div>
                          )}
                          {searchResult.experience_years && (
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Experience</p>
                                <p className="font-semibold text-foreground">{searchResult.experience_years} years</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-border">
                        <span className="healthcare-badge-success">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Verified & Active
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="healthcare-card border-2 border-healthcare-red">
                      <div className="flex items-center gap-3 text-center sm:text-left">
                        <div className="w-12 h-12 rounded-full bg-healthcare-red-light flex items-center justify-center mx-auto sm:mx-0">
                          <XCircle className="w-6 h-6 text-healthcare-red" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-semibold text-healthcare-red">
                            Doctor Not Found
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            No verified doctor found with the registration number "{registrationNumber}".
                            Please check the number and try again.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Info Section */}
      {!adminMode && (
        <section className="healthcare-section bg-muted">
          <div className="healthcare-container">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6 text-center">
                Why Verify Your Doctor?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Ensure Authenticity</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify that your doctor has valid credentials and is licensed to practice.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Prevent Fraud</h3>
                  <p className="text-sm text-muted-foreground">
                    Protect yourself from unqualified practitioners and medical fraud.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Peace of Mind</h3>
                  <p className="text-sm text-muted-foreground">
                    Trust your healthcare provider with confidence in their qualifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Edit Doctor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={doctorForm.full_name}
                onChange={(e) => setDoctorForm(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Registration Number *</Label>
              <Input
                value={doctorForm.registration_number}
                onChange={(e) => setDoctorForm(prev => ({ ...prev, registration_number: e.target.value }))}
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
              <Label>Hospital Affiliation</Label>
              <Input
                value={doctorForm.hospital_affiliation}
                onChange={(e) => setDoctorForm(prev => ({ ...prev, hospital_affiliation: e.target.value }))}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDoctor} disabled={processing}>
              {processing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
