import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, Edit, Trash2, CheckCircle2, XCircle, 
  Building2, MapPin, Phone, Star, Bed, Save
} from "lucide-react";
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
  created_at: string;
}

const locations = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur"];
const hospitalTypes = ["Government", "Private", "Specialized", "Medical College"];
const allSpecialties = [
  "Cardiology", "Neurology", "Orthopedics", "Pediatrics", 
  "Gynecology", "General Surgery", "Emergency", "ICU",
  "Oncology", "Nephrology", "Dermatology", "ENT"
];

export default function HospitalManager() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [isAddingHospital, setIsAddingHospital] = useState(false);
  const [hospitalForm, setHospitalForm] = useState<Partial<Hospital>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch hospitals");
      console.error(error);
      setHospitals([]);
    } else {
      setHospitals(data || []);
    }
    setLoading(false);
  };

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch =
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === "all" || hospital.location === filterLocation;
    const matchesStatus = filterStatus === "all" || hospital.status === filterStatus;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  const pendingCount = hospitals.filter(h => h.status === "pending").length;
  const approvedCount = hospitals.filter(h => h.status === "approved").length;

  const handleEditHospital = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setHospitalForm({ ...hospital });
  };

  const handleAddHospital = () => {
    setIsAddingHospital(true);
    setHospitalForm({
      name: "",
      type: "Private",
      location: "",
      address: "",
      phone: "",
      rating: 0,
      beds: 0,
      specialties: [],
      status: "pending",
      image_url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800",
    });
  };

  const handleSaveHospital = async () => {
    if (!hospitalForm.name || !hospitalForm.location || !hospitalForm.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingHospital) {
      setProcessingId(editingHospital.id);
      const { error } = await supabase
        .from("hospitals")
        .update({
          name: hospitalForm.name,
          type: hospitalForm.type || "Private",
          location: hospitalForm.location,
          address: hospitalForm.address,
          phone: hospitalForm.phone || null,
          rating: hospitalForm.rating || 0,
          beds: hospitalForm.beds || 0,
          specialties: hospitalForm.specialties || [],
          status: hospitalForm.status || "pending",
          image_url: hospitalForm.image_url || null,
        })
        .eq("id", editingHospital.id);

      if (error) {
        toast.error("Failed to update hospital");
        console.error(error);
      } else {
        toast.success("Hospital updated successfully");
        fetchHospitals();
      }
      setEditingHospital(null);
      setProcessingId(null);
    } else if (isAddingHospital) {
      const { error } = await supabase
        .from("hospitals")
        .insert({
          name: hospitalForm.name,
          type: hospitalForm.type || "Private",
          location: hospitalForm.location,
          address: hospitalForm.address,
          phone: hospitalForm.phone || null,
          rating: hospitalForm.rating || 0,
          beds: hospitalForm.beds || 0,
          specialties: hospitalForm.specialties || [],
          status: hospitalForm.status || "pending",
          image_url: hospitalForm.image_url || null,
        });

      if (error) {
        toast.error("Failed to add hospital");
        console.error(error);
      } else {
        toast.success("Hospital added successfully");
        fetchHospitals();
      }
      setIsAddingHospital(false);
    }
    setHospitalForm({});
  };

  const handleDeleteHospital = async () => {
    if (!hospitalToDelete) return;

    setProcessingId(hospitalToDelete.id);
    const { error } = await supabase
      .from("hospitals")
      .delete()
      .eq("id", hospitalToDelete.id);

    if (error) {
      toast.error("Failed to delete hospital");
      console.error(error);
    } else {
      toast.success("Hospital deleted successfully");
      fetchHospitals();
    }
    setDeleteDialogOpen(false);
    setHospitalToDelete(null);
    setProcessingId(null);
  };

  const handleStatusChange = async (hospital: Hospital, status: string) => {
    setProcessingId(hospital.id);
    const { error } = await supabase
      .from("hospitals")
      .update({ status })
      .eq("id", hospital.id);

    if (error) {
      toast.error("Failed to update status");
      console.error(error);
    } else {
      toast.success(`Hospital ${status === "approved" ? "approved" : "rejected"}`);
      fetchHospitals();
    }
    setProcessingId(null);
  };

  const toggleSpecialty = (specialty: string) => {
    setHospitalForm((prev) => ({
      ...prev,
      specialties: prev.specialties?.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...(prev.specialties || []), specialty],
    }));
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
          <h2 className="text-xl font-bold text-foreground">Hospital Management</h2>
          <p className="text-muted-foreground">Manage all registered hospitals and medical centers</p>
        </div>
        <Button variant="healthcare" onClick={handleAddHospital}>
          <Plus className="w-4 h-4 mr-2" />
          Add Hospital
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="healthcare-card text-center">
          <p className="text-2xl font-bold text-foreground">{hospitals.length}</p>
          <p className="text-sm text-muted-foreground">Total Hospitals</p>
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
            placeholder="Search hospitals..."
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

      {/* Hospitals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <motion.div
            key={hospital.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="aspect-video relative">
              <img
                src={hospital.image_url || "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800"}
                alt={hospital.name}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                  hospital.status === "approved"
                    ? "bg-healthcare-green text-white"
                    : hospital.status === "pending"
                    ? "bg-accent text-white"
                    : "bg-destructive text-white"
                }`}
              >
                {hospital.status}
              </span>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground">{hospital.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="font-medium text-foreground">{hospital.rating || 0}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{hospital.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  <span>{hospital.beds || 0} beds</span>
                </div>
                {hospital.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{hospital.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {(hospital.specialties || []).slice(0, 3).map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    {s}
                  </span>
                ))}
                {(hospital.specialties || []).length > 3 && (
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                    +{(hospital.specialties || []).length - 3} more
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {hospital.status === "pending" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-healthcare-green"
                      onClick={() => handleStatusChange(hospital, "approved")}
                      disabled={processingId === hospital.id}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-destructive"
                      onClick={() => handleStatusChange(hospital, "rejected")}
                      disabled={processingId === hospital.id}
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
                  onClick={() => handleEditHospital(hospital)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => {
                    setHospitalToDelete(hospital);
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

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hospitals found matching your criteria.</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hospital</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{hospitalToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHospital} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit/Add Hospital Dialog */}
      <Dialog
        open={editingHospital !== null || isAddingHospital}
        onOpenChange={() => {
          setEditingHospital(null);
          setIsAddingHospital(false);
          setHospitalForm({});
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHospital ? "Edit Hospital" : "Add New Hospital"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Hospital Name *</Label>
              <Input
                value={hospitalForm.name || ""}
                onChange={(e) => setHospitalForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Hospital name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={hospitalForm.type || "Private"}
                  onValueChange={(value) => setHospitalForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
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
                  value={hospitalForm.location || ""}
                  onValueChange={(value) => setHospitalForm((prev) => ({ ...prev, location: value }))}
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
            </div>

            <div>
              <Label>Full Address *</Label>
              <Textarea
                value={hospitalForm.address || ""}
                onChange={(e) => setHospitalForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Complete address"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={hospitalForm.phone || ""}
                  onChange={(e) => setHospitalForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+880 X-XXXXXXX"
                />
              </div>
              <div>
                <Label>Number of Beds</Label>
                <Input
                  type="number"
                  value={hospitalForm.beds || ""}
                  onChange={(e) => setHospitalForm((prev) => ({ ...prev, beds: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 250"
                />
              </div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                value={hospitalForm.image_url || ""}
                onChange={(e) => setHospitalForm((prev) => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Specialties</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allSpecialties.map((specialty) => (
                  <Button
                    key={specialty}
                    type="button"
                    variant={hospitalForm.specialties?.includes(specialty) ? "healthcare" : "outline"}
                    size="sm"
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
            </div>

            {editingHospital && (
              <div>
                <Label>Status</Label>
                <Select
                  value={hospitalForm.status || "pending"}
                  onValueChange={(value) =>
                    setHospitalForm((prev) => ({ ...prev, status: value }))
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
                setEditingHospital(null);
                setIsAddingHospital(false);
                setHospitalForm({});
              }}
            >
              Cancel
            </Button>
            <Button variant="healthcare" onClick={handleSaveHospital}>
              <Save className="w-4 h-4 mr-2" />
              {editingHospital ? "Save Changes" : "Add Hospital"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
