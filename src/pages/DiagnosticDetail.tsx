import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Phone, Star, TestTube, Clock, 
  Edit, Save, X, CheckCircle2, XCircle, Trash2, Share2, Plus
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServiceWithPrice {
  name: string;
  price: string;
}

interface Diagnostic {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string | null;
  rating: number | null;
  services: ServiceWithPrice[];
  status: string;
  image_url: string | null;
  open_hours: string | null;
}

const locations = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"];

export default function DiagnosticDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Diagnostic>>({});
  const [serviceInputs, setServiceInputs] = useState<ServiceWithPrice[]>([{ name: "", price: "" }]);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDiagnostic();
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

  const fetchDiagnostic = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("diagnostics")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching diagnostic:", error);
      toast.error("Diagnostic center not found");
      navigate("/diagnostics");
    } else {
      const parsed = {
        ...data,
        services: Array.isArray(data.services) ? (data.services as unknown as ServiceWithPrice[]) : []
      };
      setDiagnostic(parsed);
      setEditForm(parsed);
      setServiceInputs(parsed.services.length > 0 ? parsed.services : [{ name: "", price: "" }]);
    }
    setLoading(false);
  };

  const addServiceInput = () => {
    setServiceInputs([...serviceInputs, { name: "", price: "" }]);
  };

  const updateServiceInput = (index: number, field: "name" | "price", value: string) => {
    const updated = [...serviceInputs];
    updated[index][field] = value;
    setServiceInputs(updated);
  };

  const removeServiceInput = (index: number) => {
    setServiceInputs(serviceInputs.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!diagnostic || !editForm.name || !editForm.location || !editForm.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    const validServices = serviceInputs.filter(s => s.name.trim() !== "");

    setSaving(true);
    const { error } = await supabase
      .from("diagnostics")
      .update({
        name: editForm.name,
        location: editForm.location,
        address: editForm.address,
        phone: editForm.phone || null,
        rating: editForm.rating || 0,
        services: validServices as unknown as Json,
        status: editForm.status || diagnostic.status,
        image_url: editForm.image_url || null,
        open_hours: editForm.open_hours || null,
      })
      .eq("id", diagnostic.id);

    if (error) {
      toast.error("Failed to update diagnostic center");
      console.error(error);
    } else {
      toast.success("Diagnostic center updated successfully");
      const updated = { ...diagnostic, ...editForm, services: validServices } as Diagnostic;
      setDiagnostic(updated);
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleStatusChange = async (status: string) => {
    if (!diagnostic) return;

    const { error } = await supabase
      .from("diagnostics")
      .update({ status })
      .eq("id", diagnostic.id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Diagnostic center ${status === "approved" ? "approved" : "rejected"}`);
      setDiagnostic({ ...diagnostic, status });
    }
  };

  const handleDelete = async () => {
    if (!diagnostic) return;

    const { error } = await supabase
      .from("diagnostics")
      .delete()
      .eq("id", diagnostic.id);

    if (error) {
      toast.error("Failed to delete diagnostic center");
    } else {
      toast.success("Diagnostic center deleted successfully");
      navigate("/diagnostics");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: diagnostic?.name, url });
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

  if (!diagnostic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <TestTube className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Diagnostic Center Not Found</h1>
          <Link to="/diagnostics" className="text-primary hover:underline">
            Back to Diagnostics
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
          src={diagnostic.image_url || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=600&fit=crop"}
          alt={diagnostic.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            className="bg-card/80 backdrop-blur-sm"
            onClick={() => navigate("/diagnostics")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              diagnostic.status === "approved"
                ? "bg-healthcare-green text-white"
                : diagnostic.status === "pending"
                ? "bg-accent text-white"
                : "bg-destructive text-white"
            }`}
          >
            {diagnostic.status}
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
                  placeholder="Center Name"
                />
              ) : (
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {diagnostic.name}
                </h1>
              )}
              
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                  <span className="font-semibold text-foreground">{diagnostic.rating || 0}</span>
                </div>
                {diagnostic.open_hours && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-5 h-5" />
                    <span>{diagnostic.open_hours}</span>
                  </div>
                )}
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
                      <a href={`https://wa.me/?text=${encodeURIComponent(diagnostic.name + " " + window.location.href)}`} target="_blank" rel="noopener noreferrer">
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
                  {diagnostic.status === "pending" && (
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
                  <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditForm(diagnostic); setServiceInputs(diagnostic.services.length > 0 ? diagnostic.services : [{ name: "", price: "" }]); }}>
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
                      <p className="font-medium text-foreground">{diagnostic.location}</p>
                      <p className="text-muted-foreground">{diagnostic.address}</p>
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
                ) : diagnostic.phone ? (
                  <a href={`tel:${diagnostic.phone}`} className="flex items-center gap-3 text-foreground hover:text-primary">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{diagnostic.phone}</span>
                  </a>
                ) : (
                  <p className="text-muted-foreground">No phone number available</p>
                )}
              </div>

              {/* Open Hours (Admin Edit) */}
              {isEditing && (
                <div>
                  <Label className="text-muted-foreground text-sm mb-2 block">Open Hours</Label>
                  <Input
                    value={editForm.open_hours || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, open_hours: e.target.value }))}
                    placeholder="e.g., 8 AM - 10 PM"
                  />
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

            {/* Right Column - Services */}
            <div>
              <Label className="text-muted-foreground text-sm mb-2 block">Services & Prices</Label>
              {isEditing ? (
                <div className="space-y-3">
                  {serviceInputs.map((service, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Service name"
                        value={service.name}
                        onChange={(e) => updateServiceInput(index, "name", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Price"
                        value={service.price}
                        onChange={(e) => updateServiceInput(index, "price", e.target.value)}
                        className="w-28"
                      />
                      {serviceInputs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-10 w-10"
                          onClick={() => removeServiceInput(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addServiceInput}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {diagnostic.services.length > 0 ? (
                    diagnostic.services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-foreground">{service.name}</span>
                        <span className="font-semibold text-primary">{service.price || "N/A"}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No services listed</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact Button */}
          {!isEditing && diagnostic.phone && (
            <div className="mt-8 pt-6 border-t border-border">
              <Button variant="healthcare" size="lg" className="w-full md:w-auto" asChild>
                <a href={`tel:${diagnostic.phone}`}>
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Center
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
            <AlertDialogTitle>Delete Diagnostic Center</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{diagnostic.name}"? This action cannot be undone.
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
