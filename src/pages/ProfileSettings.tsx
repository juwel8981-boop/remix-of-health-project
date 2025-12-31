import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Lock, Shield, Loader2, Save, ArrowLeft } from "lucide-react";
import { z } from "zod";

const passwordSchema = z.string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must be less than 72 characters");

interface PatientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  address: string | null;
  emergency_contact: string | null;
}

interface DoctorProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  specialization: string;
  registration_number: string;
  experience_years: number | null;
  hospital_affiliation: string | null;
}

type UserType = "patient" | "doctor" | null;

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if user is a patient
    const { data: patient } = await supabase
      .from("patients")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (patient) {
      setUserType("patient");
      setPatientProfile(patient);
      setLoading(false);
      return;
    }

    // Check if user is a doctor
    const { data: doctor } = await supabase
      .from("doctors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (doctor) {
      setUserType("doctor");
      setDoctorProfile(doctor);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const handleSavePatientProfile = async () => {
    if (!patientProfile) return;
    
    setSaving(true);
    const { error } = await supabase
      .from("patients")
      .update({
        full_name: patientProfile.full_name,
        phone: patientProfile.phone,
        date_of_birth: patientProfile.date_of_birth,
        gender: patientProfile.gender,
        blood_group: patientProfile.blood_group,
        address: patientProfile.address,
        emergency_contact: patientProfile.emergency_contact,
      })
      .eq("id", patientProfile.id);

    if (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } else {
      toast.success("Profile updated successfully");
    }
    setSaving(false);
  };

  const handleSaveDoctorProfile = async () => {
    if (!doctorProfile) return;
    
    setSaving(true);
    const { error } = await supabase
      .from("doctors")
      .update({
        full_name: doctorProfile.full_name,
        phone: doctorProfile.phone,
        specialization: doctorProfile.specialization,
        experience_years: doctorProfile.experience_years,
        hospital_affiliation: doctorProfile.hospital_affiliation,
      })
      .eq("id", doctorProfile.id);

    if (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } else {
      toast.success("Profile updated successfully");
    }
    setSaving(false);
  };

  const validatePasswordForm = () => {
    const errors: { current?: string; new?: string; confirm?: string } = {};
    
    if (!currentPassword) {
      errors.current = "Current password is required";
    }
    
    const newPasswordResult = passwordSchema.safeParse(newPassword);
    if (!newPasswordResult.success) {
      errors.new = newPasswordResult.error.errors[0].message;
    }
    
    if (newPassword !== confirmPassword) {
      errors.confirm = "Passwords do not match";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    
    setChangingPassword(true);
    
    // First verify current password by trying to sign in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      toast.error("Unable to verify user");
      setChangingPassword(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordErrors({ current: "Current password is incorrect" });
      setChangingPassword(false);
      return;
    }

    // Update password
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast.error("Failed to update password: " + error.message);
    } else {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Profile not found</h2>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your account information and security</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details. Email cannot be changed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {userType === "patient" && patientProfile && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={patientProfile.full_name}
                            onChange={(e) => setPatientProfile({ ...patientProfile, full_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            value={patientProfile.email}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={patientProfile.phone || ""}
                            onChange={(e) => setPatientProfile({ ...patientProfile, phone: e.target.value })}
                            placeholder="+880 1XXX-XXXXXX"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input
                            id="dob"
                            type="date"
                            value={patientProfile.date_of_birth || ""}
                            onChange={(e) => setPatientProfile({ ...patientProfile, date_of_birth: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={patientProfile.gender || ""}
                            onValueChange={(value) => setPatientProfile({ ...patientProfile, gender: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bloodGroup">Blood Group</Label>
                          <Select
                            value={patientProfile.blood_group || ""}
                            onValueChange={(value) => setPatientProfile({ ...patientProfile, blood_group: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={patientProfile.address || ""}
                          onChange={(e) => setPatientProfile({ ...patientProfile, address: e.target.value })}
                          placeholder="Your full address"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergency">Emergency Contact</Label>
                        <Input
                          id="emergency"
                          value={patientProfile.emergency_contact || ""}
                          onChange={(e) => setPatientProfile({ ...patientProfile, emergency_contact: e.target.value })}
                          placeholder="Emergency contact number"
                        />
                      </div>

                      <Button 
                        variant="healthcare" 
                        onClick={handleSavePatientProfile}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                      </Button>
                    </>
                  )}

                  {userType === "doctor" && doctorProfile && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={doctorProfile.full_name}
                            onChange={(e) => setDoctorProfile({ ...doctorProfile, full_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            value={doctorProfile.email}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={doctorProfile.phone || ""}
                            onChange={(e) => setDoctorProfile({ ...doctorProfile, phone: e.target.value })}
                            placeholder="+880 1XXX-XXXXXX"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="regNumber">Registration Number</Label>
                          <Input
                            id="regNumber"
                            value={doctorProfile.registration_number}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input
                            id="specialization"
                            value={doctorProfile.specialization}
                            onChange={(e) => setDoctorProfile({ ...doctorProfile, specialization: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experience">Years of Experience</Label>
                          <Input
                            id="experience"
                            type="number"
                            value={doctorProfile.experience_years || ""}
                            onChange={(e) => setDoctorProfile({ ...doctorProfile, experience_years: parseInt(e.target.value) || null })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hospital">Hospital Affiliation</Label>
                        <Input
                          id="hospital"
                          value={doctorProfile.hospital_affiliation || ""}
                          onChange={(e) => setDoctorProfile({ ...doctorProfile, hospital_affiliation: e.target.value })}
                          placeholder="Primary hospital or clinic"
                        />
                      </div>

                      <Button 
                        variant="healthcare" 
                        onClick={handleSaveDoctorProfile}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      {passwordErrors.current && (
                        <p className="text-sm text-destructive">{passwordErrors.current}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      {passwordErrors.new && (
                        <p className="text-sm text-destructive">{passwordErrors.new}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      {passwordErrors.confirm && (
                        <p className="text-sm text-destructive">{passwordErrors.confirm}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      variant="healthcare"
                      disabled={changingPassword}
                    >
                      {changingPassword ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
