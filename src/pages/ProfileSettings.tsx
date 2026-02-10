import { useState, useEffect, useRef } from "react";
import { ProfileSettingsSkeleton } from "@/components/skeletons/ProfileSettingsSkeleton";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Lock, Shield, Loader2, Save, ArrowLeft, Camera } from "lucide-react";
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
  weight: number | null;
  height: number | null;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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

    setUserId(user.id);

    // Get avatar URL from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      // Create unique file path with timestamp to avoid caching issues
      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const filePath = `${userId}/avatar-${timestamp}.${fileExt}`;

      // First, try to delete any existing avatar files for this user
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(userId);
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage.from("avatars").remove(filesToDelete);
      }

      // Upload new file to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Upsert profiles table (insert if not exists, update if exists)
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ 
          id: userId, 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id' 
        });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Profile photo updated successfully");
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload profile photo: " + (error.message || "Unknown error"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getInitials = () => {
    const name = patientProfile?.full_name || doctorProfile?.full_name || "";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
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
        weight: patientProfile.weight,
        height: patientProfile.height,
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
    return <ProfileSettingsSkeleton />;
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
                  {/* Avatar Upload Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarUrl || undefined} alt="Profile photo" />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Profile Photo</h3>
                      <p className="text-sm text-muted-foreground">
                        Click the camera icon to upload a new photo. Max 2MB.
                      </p>
                    </div>
                  </div>

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

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            value={patientProfile.weight || ""}
                            onChange={(e) => setPatientProfile({ ...patientProfile, weight: e.target.value ? parseFloat(e.target.value) : null })}
                            placeholder="e.g., 70"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input
                            id="height"
                            type="number"
                            step="0.1"
                            value={patientProfile.height || ""}
                            onChange={(e) => setPatientProfile({ ...patientProfile, height: e.target.value ? parseFloat(e.target.value) : null })}
                            placeholder="e.g., 170"
                          />
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
