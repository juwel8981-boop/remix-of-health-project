import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, Edit, Trash2, CheckCircle2, XCircle, 
  Building2, MapPin, Phone, Star, TestTube, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ServiceWithPrice {
  name: string;
  price: string;
}

interface Diagnostic {
  id: number;
  name: string;
  location: string;
  address: string;
  phone: string;
  rating: number;
  services: ServiceWithPrice[];
  status: "approved" | "pending" | "rejected";
  image: string;
  openHours: string;
}

const locations = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur"];
const allServices = [
  "X-Ray", "MRI", "CT Scan", "Ultrasound", "ECG", "Blood Test",
  "Urine Test", "Pathology", "Endoscopy", "Colonoscopy",
  "Mammography", "Bone Density", "PET Scan", "Biopsy"
];

const initialDiagnostics: Diagnostic[] = [
  {
    id: 1,
    name: "Popular Diagnostic Centre",
    location: "Dhaka",
    address: "House 16, Road 2, Dhanmondi, Dhaka 1205",
    phone: "+880 2-9666778",
    rating: 4.7,
    services: [
      { name: "X-Ray", price: "৳500" },
      { name: "MRI", price: "৳8,000" },
      { name: "CT Scan", price: "৳6,000" },
      { name: "Blood Test", price: "৳300" },
      { name: "Ultrasound", price: "৳1,500" },
    ],
    status: "approved",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
    openHours: "7:00 AM - 10:00 PM",
  },
  {
    id: 2,
    name: "Ibn Sina Diagnostic",
    location: "Dhaka",
    address: "House 48, Road 9/A, Dhanmondi, Dhaka 1209",
    phone: "+880 2-9128853",
    rating: 4.6,
    services: [
      { name: "X-Ray", price: "৳450" },
      { name: "Ultrasound", price: "৳1,200" },
      { name: "ECG", price: "৳800" },
      { name: "Blood Test", price: "৳250" },
      { name: "Pathology", price: "৳400" },
    ],
    status: "approved",
    image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800",
    openHours: "6:00 AM - 11:00 PM",
  },
  {
    id: 3,
    name: "Lab Aid Diagnostic",
    location: "Chittagong",
    address: "Station Road, Chittagong",
    phone: "+880 31-654321",
    rating: 4.4,
    services: [
      { name: "Blood Test", price: "৳200" },
      { name: "X-Ray", price: "৳400" },
      { name: "ECG", price: "৳700" },
    ],
    status: "pending",
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800",
    openHours: "8:00 AM - 9:00 PM",
  },
];

export default function DiagnosticManager() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>(initialDiagnostics);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingDiagnostic, setEditingDiagnostic] = useState<Diagnostic | null>(null);
  const [isAddingDiagnostic, setIsAddingDiagnostic] = useState(false);
  const [diagnosticForm, setDiagnosticForm] = useState<Partial<Diagnostic>>({});

  const filteredDiagnostics = diagnostics.filter((diagnostic) => {
    const matchesSearch =
      diagnostic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diagnostic.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === "all" || diagnostic.location === filterLocation;
    const matchesStatus = filterStatus === "all" || diagnostic.status === filterStatus;
    return matchesSearch && matchesLocation && matchesStatus;
  });


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
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
      openHours: "",
    });
    setServiceInputs([{ name: "", price: "" }]);
  };

  const [serviceInputs, setServiceInputs] = useState<{ name: string; price: string }[]>([{ name: "", price: "" }]);

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

  const handleSaveDiagnostic = () => {
    const validServices = serviceInputs.filter(s => s.name.trim() !== "");
    
    if (editingDiagnostic) {
      setDiagnostics((prev) =>
        prev.map((d) => (d.id === editingDiagnostic.id ? { ...d, ...diagnosticForm, services: validServices } as Diagnostic : d))
      );
      setEditingDiagnostic(null);
    } else if (isAddingDiagnostic) {
      const newDiagnostic: Diagnostic = {
        id: Date.now(),
        name: diagnosticForm.name || "",
        location: diagnosticForm.location || "",
        address: diagnosticForm.address || "",
        phone: diagnosticForm.phone || "",
        rating: diagnosticForm.rating || 0,
        services: validServices,
        status: diagnosticForm.status || "pending",
        image: diagnosticForm.image || "",
        openHours: diagnosticForm.openHours || "",
      };
      setDiagnostics((prev) => [newDiagnostic, ...prev]);
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

  const handleDeleteDiagnostic = (id: number) => {
    setDiagnostics((prev) => prev.filter((d) => d.id !== id));
  };

  const handleStatusChange = (id: number, status: "approved" | "pending" | "rejected") => {
    setDiagnostics((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  // Remove old toggleService function - no longer needed

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
                src={diagnostic.image}
                alt={diagnostic.name}
                className="w-full h-full object-cover"
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
                  <span className="font-medium text-foreground">{diagnostic.rating}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{diagnostic.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{diagnostic.phone}</span>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Services & Prices:</p>
                {diagnostic.services.slice(0, 3).map((s) => (
                  <div key={s.name} className="flex justify-between items-center text-sm">
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
                      onClick={() => handleStatusChange(diagnostic.id, "approved")}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-destructive"
                      onClick={() => handleStatusChange(diagnostic.id, "rejected")}
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
                  onClick={() => handleDeleteDiagnostic(diagnostic.id)}
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
              <Label>Center Name</Label>
              <Input
                value={diagnosticForm.name || ""}
                onChange={(e) => setDiagnosticForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Diagnostic center name"
              />
            </div>

            <div>
              <Label>Location</Label>
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
              <Label>Full Address</Label>
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
                  value={diagnosticForm.openHours || ""}
                  onChange={(e) => setDiagnosticForm((prev) => ({ ...prev, openHours: e.target.value }))}
                  placeholder="7:00 AM - 10:00 PM"
                />
              </div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                value={diagnosticForm.image || ""}
                onChange={(e) => setDiagnosticForm((prev) => ({ ...prev, image: e.target.value }))}
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
                    setDiagnosticForm((prev) => ({ ...prev, status: value as Diagnostic["status"] }))
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
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
