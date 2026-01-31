import { useState, useEffect } from "react";
import { Edit, Eye, EyeOff, Trash2, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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

interface AdminFacilityControlsProps {
  type: "hospital" | "diagnostic";
  facility: Hospital | Diagnostic;
  onUpdate: () => void;
}

const locations = [
  "Dhaka", "Chittagong", "Rajshahi", "Khulna", 
  "Sylhet", "Barisal", "Rangpur", "Mymensingh"
];

const hospitalTypes = ["Government", "Private", "Semi-Government", "Specialized"];

export default function AdminFacilityControls({ type, facility, onUpdate }: AdminFacilityControlsProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Hospital form
  const [hospitalForm, setHospitalForm] = useState({
    name: "",
    type: "Private",
    location: "",
    address: "",
    phone: "",
    beds: "",
    rating: "",
    specialties: "",
    image_url: "",
    latitude: "",
    longitude: "",
  });

  // Diagnostic form
  const [diagnosticForm, setDiagnosticForm] = useState({
    name: "",
    location: "",
    address: "",
    phone: "",
    rating: "",
    open_hours: "",
    image_url: "",
    services: [] as ServiceWithPrice[],
  });

  const [newService, setNewService] = useState({ name: "", price: "" });

  useEffect(() => {
    checkAdminStatus();
    if (type === "hospital") {
      const h = facility as Hospital;
      setHospitalForm({
        name: h.name,
        type: h.type,
        location: h.location,
        address: h.address,
        phone: h.phone || "",
        beds: h.beds?.toString() || "",
        rating: h.rating?.toString() || "",
        specialties: (h.specialties || []).join(", "),
        image_url: h.image_url || "",
        latitude: h.latitude?.toString() || "",
        longitude: h.longitude?.toString() || "",
      });
    } else {
      const d = facility as Diagnostic;
      setDiagnosticForm({
        name: d.name,
        location: d.location,
        address: d.address,
        phone: d.phone || "",
        rating: d.rating?.toString() || "",
        open_hours: d.open_hours || "",
        image_url: d.image_url || "",
        services: d.services || [],
      });
    }
  }, [facility, type]);

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

  const handleToggleStatus = async () => {
    setProcessing(true);
    const newStatus = facility.status === "approved" ? "pending" : "approved";
    const table = type === "hospital" ? "hospitals" : "diagnostics";
    
    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq("id", facility.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Facility ${newStatus === "approved" ? "approved" : "hidden"}`);
      onUpdate();
    }
  };

  const handleUpdateHospital = async () => {
    setProcessing(true);
    const { error } = await supabase
      .from("hospitals")
      .update({
        name: hospitalForm.name,
        type: hospitalForm.type,
        location: hospitalForm.location,
        address: hospitalForm.address,
        phone: hospitalForm.phone || null,
        beds: hospitalForm.beds ? parseInt(hospitalForm.beds) : null,
        rating: hospitalForm.rating ? parseFloat(hospitalForm.rating) : null,
        specialties: hospitalForm.specialties.split(",").map(s => s.trim()).filter(Boolean),
        image_url: hospitalForm.image_url || null,
        latitude: hospitalForm.latitude ? parseFloat(hospitalForm.latitude) : null,
        longitude: hospitalForm.longitude ? parseFloat(hospitalForm.longitude) : null,
      })
      .eq("id", facility.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to update hospital");
      console.error(error);
    } else {
      toast.success("Hospital updated successfully");
      setShowEditDialog(false);
      onUpdate();
    }
  };

  const handleUpdateDiagnostic = async () => {
    setProcessing(true);
    const { error } = await supabase
      .from("diagnostics")
      .update({
        name: diagnosticForm.name,
        location: diagnosticForm.location,
        address: diagnosticForm.address,
        phone: diagnosticForm.phone || null,
        rating: diagnosticForm.rating ? parseFloat(diagnosticForm.rating) : null,
        open_hours: diagnosticForm.open_hours || null,
        image_url: diagnosticForm.image_url || null,
        services: JSON.parse(JSON.stringify(diagnosticForm.services)),
      })
      .eq("id", facility.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to update diagnostic center");
      console.error(error);
    } else {
      toast.success("Diagnostic center updated successfully");
      setShowEditDialog(false);
      onUpdate();
    }
  };

  const handleDelete = async () => {
    setProcessing(true);
    const table = type === "hospital" ? "hospitals" : "diagnostics";
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", facility.id);

    setProcessing(false);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success(`${type === "hospital" ? "Hospital" : "Diagnostic center"} deleted`);
      setShowDeleteDialog(false);
      onUpdate();
    }
  };

  const addService = () => {
    if (newService.name && newService.price) {
      setDiagnosticForm(prev => ({
        ...prev,
        services: [...prev.services, { ...newService }],
      }));
      setNewService({ name: "", price: "" });
    }
  };

  const removeService = (index: number) => {
    setDiagnosticForm(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
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
              onClick={handleToggleStatus}
              disabled={processing}
              className="gap-1"
            >
              {facility.status === "approved" ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Approve
                </>
              )}
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
      </div>

      {/* Edit Dialog - Hospital */}
      {type === "hospital" && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Hospital</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Name *</Label>
                <Input
                  value={hospitalForm.name}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Type *</Label>
                <Select
                  value={hospitalForm.type}
                  onValueChange={(value) => setHospitalForm(prev => ({ ...prev, type: value }))}
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
                <Label>Location *</Label>
                <Select
                  value={hospitalForm.location}
                  onValueChange={(value) => setHospitalForm(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Address *</Label>
                <Textarea
                  value={hospitalForm.address}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={hospitalForm.phone}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label>Beds</Label>
                <Input
                  type="number"
                  value={hospitalForm.beds}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, beds: e.target.value }))}
                />
              </div>
              <div>
                <Label>Rating (0-5)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={hospitalForm.rating}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, rating: e.target.value }))}
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={hospitalForm.image_url}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, image_url: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Specialties (comma separated)</Label>
                <Input
                  value={hospitalForm.specialties}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, specialties: e.target.value }))}
                  placeholder="Cardiology, Neurology, Pediatrics..."
                />
              </div>
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={hospitalForm.latitude}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, latitude: e.target.value }))}
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={hospitalForm.longitude}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, longitude: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateHospital} disabled={processing}>
                {processing ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog - Diagnostic */}
      {type === "diagnostic" && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Diagnostic Center</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Name *</Label>
                <Input
                  value={diagnosticForm.name}
                  onChange={(e) => setDiagnosticForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Location *</Label>
                <Select
                  value={diagnosticForm.location}
                  onValueChange={(value) => setDiagnosticForm(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={diagnosticForm.phone}
                  onChange={(e) => setDiagnosticForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Address *</Label>
                <Textarea
                  value={diagnosticForm.address}
                  onChange={(e) => setDiagnosticForm(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div>
                <Label>Open Hours</Label>
                <Input
                  value={diagnosticForm.open_hours}
                  onChange={(e) => setDiagnosticForm(prev => ({ ...prev, open_hours: e.target.value }))}
                  placeholder="e.g., 8:00 AM - 10:00 PM"
                />
              </div>
              <div>
                <Label>Rating (0-5)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={diagnosticForm.rating}
                  onChange={(e) => setDiagnosticForm(prev => ({ ...prev, rating: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Image URL</Label>
                <Input
                  value={diagnosticForm.image_url}
                  onChange={(e) => setDiagnosticForm(prev => ({ ...prev, image_url: e.target.value }))}
                />
              </div>

              {/* Services Management */}
              <div className="md:col-span-2 border-t pt-4">
                <Label className="mb-2 block">Services & Prices</Label>
                <div className="space-y-2">
                  {diagnosticForm.services.map((service, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-muted p-2 rounded">
                      <span className="flex-1">{service.name}</span>
                      <span className="text-muted-foreground">{service.price}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(idx)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Service name"
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Price"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                    className="w-32"
                  />
                  <Button variant="outline" size="icon" onClick={addService}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateDiagnostic} disabled={processing}>
                {processing ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {type === "hospital" ? "Hospital" : "Diagnostic Center"}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{facility.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {processing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
