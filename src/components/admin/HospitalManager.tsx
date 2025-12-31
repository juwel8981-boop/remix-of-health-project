import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";

interface Hospital {
  id: number;
  name: string;
  type: string;
  location: string;
  address: string;
  phone: string;
  rating: number;
  beds: number;
  specialties: string[];
  status: "approved" | "pending" | "rejected";
  image: string;
  coordinates: { lat: number; lng: number };
}

const locations = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur"];
const hospitalTypes = ["Government", "Private", "Specialized", "Medical College"];
const allSpecialties = [
  "Cardiology", "Neurology", "Orthopedics", "Pediatrics", 
  "Gynecology", "General Surgery", "Emergency", "ICU",
  "Oncology", "Nephrology", "Dermatology", "ENT"
];

const initialHospitals: Hospital[] = [
  {
    id: 1,
    name: "Square Hospital",
    type: "Private",
    location: "Dhaka",
    address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka 1205",
    phone: "+880 2-8144400",
    rating: 4.8,
    beds: 400,
    specialties: ["Cardiology", "Neurology", "Orthopedics", "Oncology"],
    status: "approved",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800",
    coordinates: { lat: 23.7505, lng: 90.3812 },
  },
  {
    id: 2,
    name: "United Hospital",
    type: "Private",
    location: "Dhaka",
    address: "Plot 15, Road 71, Gulshan, Dhaka 1212",
    phone: "+880 2-8431661",
    rating: 4.7,
    beds: 450,
    specialties: ["Cardiology", "Gynecology", "General Surgery", "ICU"],
    status: "approved",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
    coordinates: { lat: 23.7957, lng: 90.4149 },
  },
  {
    id: 3,
    name: "City General Hospital",
    type: "Private",
    location: "Rajshahi",
    address: "Station Road, Rajshahi",
    phone: "+880 721-774411",
    rating: 4.2,
    beds: 250,
    specialties: ["General Surgery", "Emergency", "Pediatrics"],
    status: "pending",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800",
    coordinates: { lat: 24.3745, lng: 88.6042 },
  },
];

export default function HospitalManager() {
  const [hospitals, setHospitals] = useState<Hospital[]>(initialHospitals);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [isAddingHospital, setIsAddingHospital] = useState(false);
  const [hospitalForm, setHospitalForm] = useState<Partial<Hospital>>({});

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch =
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === "all" || hospital.location === filterLocation;
    const matchesStatus = filterStatus === "all" || hospital.status === filterStatus;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  const handleEditHospital = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setHospitalForm({ ...hospital });
  };

  const handleAddHospital = () => {
    setIsAddingHospital(true);
    setHospitalForm({
      name: "",
      type: "",
      location: "",
      address: "",
      phone: "",
      rating: 0,
      beds: 0,
      specialties: [],
      status: "pending",
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800",
      coordinates: { lat: 23.8103, lng: 90.4125 },
    });
  };

  const handleSaveHospital = () => {
    if (editingHospital) {
      setHospitals((prev) =>
        prev.map((h) => (h.id === editingHospital.id ? { ...h, ...hospitalForm } as Hospital : h))
      );
      setEditingHospital(null);
    } else if (isAddingHospital) {
      const newHospital: Hospital = {
        id: Date.now(),
        name: hospitalForm.name || "",
        type: hospitalForm.type || "",
        location: hospitalForm.location || "",
        address: hospitalForm.address || "",
        phone: hospitalForm.phone || "",
        rating: hospitalForm.rating || 0,
        beds: hospitalForm.beds || 0,
        specialties: hospitalForm.specialties || [],
        status: hospitalForm.status || "pending",
        image: hospitalForm.image || "",
        coordinates: hospitalForm.coordinates || { lat: 23.8103, lng: 90.4125 },
      };
      setHospitals((prev) => [newHospital, ...prev]);
      setIsAddingHospital(false);
    }
    setHospitalForm({});
  };

  const handleDeleteHospital = (id: number) => {
    setHospitals((prev) => prev.filter((h) => h.id !== id));
  };

  const handleStatusChange = (id: number, status: "approved" | "pending" | "rejected") => {
    setHospitals((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status } : h))
    );
  };

  const toggleSpecialty = (specialty: string) => {
    setHospitalForm((prev) => ({
      ...prev,
      specialties: prev.specialties?.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...(prev.specialties || []), specialty],
    }));
  };

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
                src={hospital.image}
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
                  <span className="font-medium text-foreground">{hospital.rating}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{hospital.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  <span>{hospital.beds} beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{hospital.phone}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {hospital.specialties.slice(0, 3).map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    {s}
                  </span>
                ))}
                {hospital.specialties.length > 3 && (
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                    +{hospital.specialties.length - 3} more
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
                      onClick={() => handleStatusChange(hospital.id, "approved")}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-destructive"
                      onClick={() => handleStatusChange(hospital.id, "rejected")}
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
                  onClick={() => handleDeleteHospital(hospital.id)}
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
              <Label>Hospital Name</Label>
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
                  value={hospitalForm.type || ""}
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
                <Label>Location</Label>
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
              <Label>Full Address</Label>
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
                value={hospitalForm.image || ""}
                onChange={(e) => setHospitalForm((prev) => ({ ...prev, image: e.target.value }))}
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
                    setHospitalForm((prev) => ({ ...prev, status: value as Hospital["status"] }))
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
              Save Hospital
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
