import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, Edit, Trash2, CheckCircle2, XCircle, 
  MapPin, Phone, Star, TestTube, Save, Clock
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  created_at: string;
}

const locations = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur"];

export default function DiagnosticManager() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingDiagnostic, setEditingDiagnostic] = useState<Diagnostic | null>(null);
  const [isAddingDiagnostic, setIsAddingDiagnostic] = useState(false);
  const [diagnosticForm, setDiagnosticForm] = useState<Partial<Diagnostic>>({});
  const [serviceInputs, setServiceInputs] = useState<ServiceWithPrice[]>([{ name: "", price: "" }]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diagnosticToDelete, setDiagnosticToDelete] = useState<Diagnostic | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("diagnostics")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch diagnostic centers");
      console.error(error);
      setDiagnostics([]);
    } else {
      // Parse services from JSONB
      const parsed = (data || []).map(d => ({
        ...d,
        services: Array.isArray(d.services) ? (d.services as unknown as ServiceWithPrice[]) : []
      }));
      setDiagnostics(parsed);
    }
    setLoading(false);
  };

  const filteredDiagnostics = diagnostics.filter((diagnostic) => {
    const matchesSearch =
      diagnostic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diagnostic.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === "all" || diagnostic.location === filterLocation;
    const matchesStatus = filterStatus === "all" || diagnostic.status === filterStatus;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  const pendingCount = diagnostics.filter(d => d.status === "pending").length;
  const approvedCount = diagnostics.filter(d => d.status === "approved").length;

  const handleAddDiagnostic = () => {
    setIsAddingDiagnostic(true);
    setDiagnosticForm({
      name: "",
      location: "",
      address: "",
      phone: "",
      rating: 0,
      services: [],
      status: "pending",
      image_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
      open_hours: "",
    });
    setServiceInputs([{ name: "", price: "" }]);
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

  const handleSaveDiagnostic = async () => {
    if (!diagnosticForm.name || !diagnosticForm.location || !diagnosticForm.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    const validServices = serviceInputs.filter(s => s.name.trim() !== "");

    if (editingDiagnostic) {
      setProcessingId(editingDiagnostic.id);
      const { error } = await supabase
        .from("diagnostics")
        .update({
          name: diagnosticForm.name,
          location: diagnosticForm.location,
          address: diagnosticForm.address,
          phone: diagnosticForm.phone || null,
          rating: diagnosticForm.rating || 0,
          services: validServices as unknown as Json,
          status: diagnosticForm.status || "pending",
          image_url: diagnosticForm.image_url || null,
          open_hours: diagnosticForm.open_hours || null,
        })
        .eq("id", editingDiagnostic.id);

      if (error) {
        toast.error("Failed to update diagnostic center");
        console.error(error);
      } else {
        toast.success("Diagnostic center updated successfully");
        fetchDiagnostics();
      }
      setEditingDiagnostic(null);
      setProcessingId(null);
    } else if (isAddingDiagnostic) {
      const { error } = await supabase
        .from("diagnostics")
        .insert({
          name: diagnosticForm.name!,
          location: diagnosticForm.location!,
          address: diagnosticForm.address!,
          phone: diagnosticForm.phone || null,
          rating: diagnosticForm.rating || 0,
          services: validServices as unknown as Json,
          status: diagnosticForm.status || "pending",
          image_url: diagnosticForm.image_url || null,
          open_hours: diagnosticForm.open_hours || null,
        });

      if (error) {
        toast.error("Failed to add diagnostic center");
        console.error(error);
      } else {
        toast.success("Diagnostic center added successfully");
        fetchDiagnostics();
      }
      setIsAddingDiagnostic(false);
    }
    setDiagnosticForm({});
    setServiceInputs([{ name: "", price: "" }]);
  };

  const handleEditDiagnostic = (diagnostic: Diagnostic) => {
    setEditingDiagnostic(diagnostic);
    setDiagnosticForm({ ...diagnostic });
    setServiceInputs(diagnostic.services.length > 0 ? diagnostic.services : [{ name: "", price: "" }]);
  };

  const handleDeleteDiagnostic = async () => {
    if (!diagnosticToDelete) return;

    setProcessingId(diagnosticToDelete.id);
    const { error } = await supabase
      .from("diagnostics")
      .delete()
      .eq("id", diagnosticToDelete.id);

    if (error) {
      toast.error("Failed to delete diagnostic center");
      console.error(error);
    } else {
      toast.success("Diagnostic center deleted successfully");
      fetchDiagnostics();
    }
    setDeleteDialogOpen(false);
    setDiagnosticToDelete(null);
    setProcessingId(null);
  };

  const handleStatusChange = async (diagnostic: Diagnostic, status: string) => {
    setProcessingId(diagnostic.id);
    const { error } = await supabase
      .from("diagnostics")
      .update({ status })
      .eq("id", diagnostic.id);

    if (error) {
      toast.error("Failed to update status");
      console.error(error);
    } else {
      toast.success(`Diagnostic center ${status === "approved" ? "approved" : "rejected"}`);
      fetchDiagnostics();
    }
    setProcessingId(null);
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
          <h2 className="text-xl font-bold text-foreground">Diagnostic Center Management</h2>
          <p className="text-muted-foreground">Manage all registered diagnostic centers</p>
        </div>
        <Button variant="healthcare" onClick={handleAddDiagnostic}>
          <Plus className="w-4 h-4 mr-2" />
          Add Diagnostic Center
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="healthcare-card text-center">
          <p className="text-2xl font-bold text-foreground">{diagnostics.length}</p>
          <p className="text-sm text-muted-foreground">Total Centers</p>
        </div>
        <div className="healthcare-card text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="healthcare-card text-center">
          <p className="text-2xl font-bold text-healthcare-green">{approvedCount}</p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search diagnostic centers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiagnostics.map((diagnostic) => (
          <motion.div
            key={diagnostic.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="aspect-video relative">
              <img
                src={diagnostic.image_url || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800"}
                alt={diagnostic.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span
                className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
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
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground">{diagnostic.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="font-medium text-foreground">{diagnostic.rating || 0}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{diagnostic.location}</span>
                </div>
                {diagnostic.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{diagnostic.phone}</span>
                  </div>
                )}
                {diagnostic.open_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{diagnostic.open_hours}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Services & Prices:</p>
                {diagnostic.services.slice(0, 3).map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="font-medium text-foreground">{s.price || "N/A"}</span>
                  </div>
                ))}
                {diagnostic.services.length > 3 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    +{diagnostic.services.length - 3} more services
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {diagnostic.status === "pending" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-healthcare-green"
                      onClick={() => handleStatusChange(diagnostic, "approved")}
                      disabled={processingId === diagnostic.id}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-destructive"
                      onClick={() => handleStatusChange(diagnostic, "rejected")}
                      disabled={processingId === diagnostic.id}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEditDiagnostic(diagnostic)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => {
                    setDiagnosticToDelete(diagnostic);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDiagnostics.length === 0 && (
        <div className="text-center py-12">
          <TestTube className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No diagnostic centers found matching your criteria.</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Diagnostic Center</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{diagnosticToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDiagnostic} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit/Add Diagnostic Dialog */}
      <Dialog
        open={editingDiagnostic !== null || isAddingDiagnostic}
        onOpenChange={() => {
          setEditingDiagnostic(null);
          setIsAddingDiagnostic(false);
          setDiagnosticForm({});
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDiagnostic ? "Edit Diagnostic Center" : "Add New Diagnostic Center"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Center Name *</Label>
              <Input
                value={diagnosticForm.name || ""}
                onChange={(e) => setDiagnosticForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Diagnostic center name"
              />
            </div>

            <div>
              <Label>Location *</Label>
              <Select
                value={diagnosticForm.location || ""}
                onValueChange={(value) => setDiagnosticForm((prev) => ({ ...prev, location: value }))}
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
            </div>

            <div>
              <Label>Full Address *</Label>
              <Textarea
                value={diagnosticForm.address || ""}
                onChange={(e) => setDiagnosticForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Complete address"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={diagnosticForm.phone || ""}
                  onChange={(e) => setDiagnosticForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+880 X-XXXXXXX"
                />
              </div>
              <div>
                <Label>Opening Hours</Label>
                <Input
                  value={diagnosticForm.open_hours || ""}
                  onChange={(e) => setDiagnosticForm((prev) => ({ ...prev, open_hours: e.target.value }))}
                  placeholder="7:00 AM - 10:00 PM"
                />
              </div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                value={diagnosticForm.image_url || ""}
                onChange={(e) => setDiagnosticForm((prev) => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label className="flex items-center justify-between mb-2">
                <span>Services & Prices</span>
                <Button type="button" variant="outline" size="sm" onClick={addServiceInput}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add Service
                </Button>
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {serviceInputs.map((service, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Service name (e.g., X-Ray)"
                      value={service.name}
                      onChange={(e) => updateServiceInput(index, "name", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Price (e.g., ৳500)"
                      value={service.price}
                      onChange={(e) => updateServiceInput(index, "price", e.target.value)}
                      className="w-32"
                    />
                    {serviceInputs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeServiceInput(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {editingDiagnostic && (
              <div>
                <Label>Status</Label>
                <Select
                  value={diagnosticForm.status || "pending"}
                  onValueChange={(value) =>
                    setDiagnosticForm((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingDiagnostic(null);
                setIsAddingDiagnostic(false);
                setDiagnosticForm({});
              }}
            >
              Cancel
            </Button>
            <Button variant="healthcare" onClick={handleSaveDiagnostic}>
              <Save className="w-4 h-4 mr-2" />
              {editingDiagnostic ? "Save Changes" : "Add Center"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
