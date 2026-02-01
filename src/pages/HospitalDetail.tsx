import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Phone, Star, Building2, Bed, Clock, 
  Edit, Save, X, CheckCircle2, XCircle, Trash2, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Hospital {
  id: string;
  name: string;
  type: string;
  location: string;
  address: string;
  phone: string | null;
  rating: number | null;
  beds: number | null;
  specialties: string[] | null;
  status: string;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

const locations = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"];
const hospitalTypes = ["Government", "Private", "Specialized", "Medical College"];
const allSpecialties = [
  "Cardiology", "Neurology", "Orthopedics", "Pediatrics", 
  "Gynecology", "General Surgery", "Emergency", "ICU",
  "Oncology", "Nephrology", "Dermatology", "ENT"
];

export default function HospitalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Hospital>>({});
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHospital();
      checkAdminStatus();
    }
  }, [id]);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const fetchHospital = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching hospital:", error);
      toast.error("Hospital not found");
      navigate("/hospitals");
    } else {
      setHospital(data);
      setEditForm(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!hospital || !editForm.name || !editForm.location || !editForm.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("hospitals")
      .update({
        name: editForm.name,
        type: editForm.type || "Private",
        location: editForm.location,
        address: editForm.address,
        phone: editForm.phone || null,
        rating: editForm.rating || 0,
        beds: editForm.beds || 0,
        specialties: editForm.specialties || [],
        status: editForm.status || hospital.status,
        image_url: editForm.image_url || null,
        latitude: editForm.latitude || null,
        longitude: editForm.longitude || null,
      })
      .eq("id", hospital.id);

    if (error) {
      toast.error("Failed to update hospital");
      console.error(error);
    } else {
      toast.success("Hospital updated successfully");
      setHospital({ ...hospital, ...editForm } as Hospital);
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleStatusChange = async (status: string) => {
    if (!hospital) return;

    const { error } = await supabase
      .from("hospitals")
      .update({ status })
      .eq("id", hospital.id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Hospital ${status === "approved" ? "approved" : "rejected"}`);
      setHospital({ ...hospital, status });
    }
  };

  const handleDelete = async () => {
    if (!hospital) return;

    const { error } = await supabase
      .from("hospitals")
      .delete()
      .eq("id", hospital.id);

    if (error) {
      toast.error("Failed to delete hospital");
    } else {
      toast.success("Hospital deleted successfully");
      navigate("/hospitals");
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setEditForm((prev) => ({
      ...prev,
      specialties: prev.specialties?.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...(prev.specialties || []), specialty],
    }));
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: hospital?.name, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Hospital Not Found</h1>
          <Link to="/hospitals" className="text-primary hover:underline">
            Back to Hospitals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-64 md:h-80">
        <img
          src={hospital.image_url || "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&h=600&fit=crop"}
          alt={hospital.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            className="bg-card/80 backdrop-blur-sm"
            onClick={() => navigate("/hospitals")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Status badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              hospital.status === "approved"
                ? "bg-healthcare-green text-white"
                : hospital.status === "pending"
                ? "bg-accent text-white"
                : "bg-destructive text-white"
            }`}
          >
            {hospital.status}
          </span>
          <span className="bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-foreground">
            {hospital.type}
          </span>
        </div>
      </section>

      {/* Content */}
      <div className="healthcare-container -mt-16 relative z-10 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-healthcare-lg p-6 md:p-8"
        >
          {/* Header with Admin Controls */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-bold mb-2"
                  placeholder="Hospital Name"
                />
              ) : (
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {hospital.name}
                </h1>
              )}
              
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                  <span className="font-semibold text-foreground">{hospital.rating || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bed className="w-5 h-5" />
                  <span>{hospital.beds || 0} beds</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleShare}>
                      Copy Link
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer">
                        Share on Facebook
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <a href={`https://wa.me/?text=${encodeURIComponent(hospital.name + " " + window.location.href)}`} target="_blank" rel="noopener noreferrer">
                        Share on WhatsApp
                      </a>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {isAdmin && !isEditing && (
                <>
                  <Button variant="healthcare" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  {hospital.status === "pending" && (
                    <>
                      <Button variant="ghost" size="sm" className="text-healthcare-green" onClick={() => handleStatusChange("approved")}>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleStatusChange("rejected")}>
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}

              {isEditing && (
                <>
                  <Button variant="healthcare" size="sm" onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditForm(hospital); }}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Location */}
              <div>
                <Label className="text-muted-foreground text-sm mb-2 block">Location</Label>
                {isEditing ? (
                  <div className="space-y-3">
                    <Select
                      value={editForm.location || ""}
                      onValueChange={(value) => setEditForm((prev) => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      value={editForm.address || ""}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Full address"
                    />
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{hospital.location}</p>
                      <p className="text-muted-foreground">{hospital.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div>
                <Label className="text-muted-foreground text-sm mb-2 block">Contact</Label>
                {isEditing ? (
                  <Input
                    value={editForm.phone || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                ) : hospital.phone ? (
                  <a href={`tel:${hospital.phone}`} className="flex items-center gap-3 text-foreground hover:text-primary">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{hospital.phone}</span>
                  </a>
                ) : (
                  <p className="text-muted-foreground">No phone number available</p>
                )}
              </div>

              {/* Type & Rating (Admin Edit) */}
              {isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm mb-2 block">Type</Label>
                    <Select
                      value={editForm.type || "Private"}
                      onValueChange={(value) => setEditForm((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitalTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm mb-2 block">Beds</Label>
                    <Input
                      type="number"
                      value={editForm.beds || 0}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, beds: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              )}

              {/* Image URL (Admin Edit) */}
              {isEditing && (
                <div>
                  <Label className="text-muted-foreground text-sm mb-2 block">Image URL</Label>
                  <Input
                    value={editForm.image_url || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>

            {/* Right Column - Specialties */}
            <div>
              <Label className="text-muted-foreground text-sm mb-2 block">Specialties</Label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {allSpecialties.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialty(spec)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        editForm.specialties?.includes(spec)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(hospital.specialties || []).length > 0 ? (
                    hospital.specialties?.map((spec) => (
                      <span key={spec} className="healthcare-badge">
                        {spec}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No specialties listed</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact Button */}
          {!isEditing && hospital.phone && (
            <div className="mt-8 pt-6 border-t border-border">
              <Button variant="healthcare" size="lg" className="w-full md:w-auto" asChild>
                <a href={`tel:${hospital.phone}`}>
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Hospital
                </a>
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hospital</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{hospital.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
