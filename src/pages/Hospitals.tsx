import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Phone, Star, Navigation, Building2, Stethoscope, ChevronDown, Map, List, Clock, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FacilitiesMap } from "@/components/FacilitiesMap";
import { supabase } from "@/integrations/supabase/client";
import AdminFacilityControls from "@/components/admin/AdminFacilityControls";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const locationsList = [
  { value: "all", label: "All Locations" },
  { value: "Dhaka", label: "Dhaka" },
  { value: "Chittagong", label: "Chittagong" },
  { value: "Rajshahi", label: "Rajshahi" },
  { value: "Khulna", label: "Khulna" },
  { value: "Sylhet", label: "Sylhet" },
  { value: "Barisal", label: "Barisal" },
  { value: "Rangpur", label: "Rangpur" },
  { value: "Mymensingh", label: "Mymensingh" },
];

const hospitalTypes = ["Government", "Private", "Semi-Government", "Specialized"];

export default function Hospitals() {
  const [activeTab, setActiveTab] = useState<"hospitals" | "diagnostics">("hospitals");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin mode
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [showAddHospitalDialog, setShowAddHospitalDialog] = useState(false);
  const [showAddDiagnosticDialog, setShowAddDiagnosticDialog] = useState(false);
  const [addingFacility, setAddingFacility] = useState(false);

  const [newHospital, setNewHospital] = useState({
    name: "",
    type: "Private",
    location: "Dhaka",
    address: "",
    phone: "",
    beds: "",
    specialties: "",
    image_url: "",
  });

  const [newDiagnostic, setNewDiagnostic] = useState({
    name: "",
    location: "Dhaka",
    address: "",
    phone: "",
    open_hours: "",
    image_url: "",
    services: [] as ServiceWithPrice[],
  });
  const [newService, setNewService] = useState({ name: "", price: "" });

  useEffect(() => {
    checkAdminStatus();
    fetchData();
  }, []);

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

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch hospitals - include all if admin mode
    const hospitalsQuery = supabase
      .from("hospitals")
      .select("*")
      .order("rating", { ascending: false });

    if (!adminMode) {
      hospitalsQuery.eq("status", "approved");
    }

    const { data: hospitalsData, error: hospitalsError } = await hospitalsQuery;

    if (hospitalsError) {
      console.error("Error fetching hospitals:", hospitalsError);
    } else {
      setHospitals(hospitalsData || []);
    }

    // Fetch diagnostics
    const diagnosticsQuery = supabase
      .from("diagnostics")
      .select("*")
      .order("rating", { ascending: false });

    if (!adminMode) {
      diagnosticsQuery.eq("status", "approved");
    }

    const { data: diagnosticsData, error: diagnosticsError } = await diagnosticsQuery;

    if (diagnosticsError) {
      console.error("Error fetching diagnostics:", diagnosticsError);
    } else {
      const parsed = (diagnosticsData || []).map(d => ({
        ...d,
        services: Array.isArray(d.services) ? (d.services as unknown as ServiceWithPrice[]) : []
      }));
      setDiagnostics(parsed);
    }

    setLoading(false);
  };

  // Refetch when admin mode changes
  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [adminMode, isAdmin]);

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === "all" || h.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const filteredDiagnostics = diagnostics.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === "all" || d.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const selectedLocationLabel = locationsList.find(l => l.value === selectedLocation)?.label || "All Locations";

  // Convert for map display
  const hospitalsForMap = filteredHospitals.map(h => ({
    id: parseInt(h.id.slice(0, 8), 16) || 1,
    name: h.name,
    type: h.type,
    location: h.location.toLowerCase(),
    address: h.address,
    phone: h.phone || "",
    rating: h.rating || 0,
    reviews: 0,
    distance: "N/A",
    emergency: true,
    specialties: h.specialties || [],
    image: h.image_url || "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop",
    lat: h.latitude || 23.8103,
    lng: h.longitude || 90.4125,
  }));

  const diagnosticsForMap = filteredDiagnostics.map(d => ({
    id: parseInt(d.id.slice(0, 8), 16) || 1,
    name: d.name,
    location: d.location.toLowerCase(),
    address: d.address,
    phone: d.phone || "",
    rating: d.rating || 0,
    reviews: 0,
    distance: "N/A",
    services: d.services.map(s => s.name),
    image: d.image_url || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop",
    lat: 23.8103,
    lng: 90.4125,
  }));

  const handleAddHospital = async () => {
    if (!newHospital.name || !newHospital.address) {
      toast.error("Please fill required fields");
      return;
    }
    setAddingFacility(true);

    const { error } = await supabase.from("hospitals").insert({
      name: newHospital.name,
      type: newHospital.type,
      location: newHospital.location,
      address: newHospital.address,
      phone: newHospital.phone || null,
      beds: newHospital.beds ? parseInt(newHospital.beds) : null,
      specialties: newHospital.specialties.split(",").map(s => s.trim()).filter(Boolean),
      image_url: newHospital.image_url || null,
      status: "approved",
    });

    setAddingFacility(false);

    if (error) {
      toast.error("Failed to add hospital");
      console.error(error);
    } else {
      toast.success("Hospital added successfully");
      setShowAddHospitalDialog(false);
      setNewHospital({
        name: "",
        type: "Private",
        location: "Dhaka",
        address: "",
        phone: "",
        beds: "",
        specialties: "",
        image_url: "",
      });
      fetchData();
    }
  };

  const handleAddDiagnostic = async () => {
    if (!newDiagnostic.name || !newDiagnostic.address) {
      toast.error("Please fill required fields");
      return;
    }
    setAddingFacility(true);

    const { error } = await supabase.from("diagnostics").insert({
      name: newDiagnostic.name,
      location: newDiagnostic.location,
      address: newDiagnostic.address,
      phone: newDiagnostic.phone || null,
      open_hours: newDiagnostic.open_hours || null,
      image_url: newDiagnostic.image_url || null,
      services: JSON.parse(JSON.stringify(newDiagnostic.services)),
      status: "approved",
    });

    setAddingFacility(false);

    if (error) {
      toast.error("Failed to add diagnostic center");
      console.error(error);
    } else {
      toast.success("Diagnostic center added successfully");
      setShowAddDiagnosticDialog(false);
      setNewDiagnostic({
        name: "",
        location: "Dhaka",
        address: "",
        phone: "",
        open_hours: "",
        image_url: "",
        services: [],
      });
      fetchData();
    }
  };

  const addServiceToNew = () => {
    if (newService.name && newService.price) {
      setNewDiagnostic(prev => ({
        ...prev,
        services: [...prev.services, { ...newService }],
      }));
      setNewService({ name: "", price: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-secondary py-16">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Find Healthcare Facilities
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Discover hospitals and diagnostic centers near you
            </p>
          </motion.div>

          {/* Admin Mode Toggle */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mb-6"
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

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-2 shadow-healthcare-lg max-w-3xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-muted">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or location..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-muted sm:w-52 w-full"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{selectedLocationLabel}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-healthcare-lg z-50 overflow-hidden">
                    <ul className="py-2 max-h-64 overflow-y-auto">
                      {locationsList.map((location) => (
                        <li key={location.value}>
                          <button
                            onClick={() => {
                              setSelectedLocation(location.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 hover:bg-muted transition-colors ${
                              selectedLocation === location.value 
                                ? "bg-primary/10 text-primary font-medium" 
                                : "text-foreground"
                            }`}
                          >
                            {location.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button variant="accent" size="lg">
                <Navigation className="w-5 h-5" />
                <span className="hidden sm:inline ml-2">Search</span>
              </Button>
            </div>
          </motion.div>

          {/* Tabs & View Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("hospitals")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "hospitals"
                    ? "bg-card text-foreground shadow-healthcare"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                <Building2 className="w-5 h-5 inline-block mr-2" />
                Hospitals
              </button>
              <button
                onClick={() => setActiveTab("diagnostics")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "diagnostics"
                    ? "bg-card text-foreground shadow-healthcare"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                <Stethoscope className="w-5 h-5 inline-block mr-2" />
                Diagnostics
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-card/20 backdrop-blur-sm rounded-xl p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === "map"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="healthcare-section">
        <div className="healthcare-container">
          {/* Admin Add Button */}
          {adminMode && (
            <div className="flex justify-end mb-6">
              <Button
                variant="healthcare"
                onClick={() => activeTab === "hospitals" ? setShowAddHospitalDialog(true) : setShowAddDiagnosticDialog(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add {activeTab === "hospitals" ? "Hospital" : "Diagnostic Center"}
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : viewMode === "map" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FacilitiesMap
                hospitals={hospitalsForMap}
                diagnostics={diagnosticsForMap}
                activeTab={activeTab}
                selectedLocation={selectedLocation.toLowerCase()}
              />
            </motion.div>
          ) : (
            <>
              {activeTab === "hospitals" ? (
                <>
                  {filteredHospitals.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hospitals found. Check back later or try a different search.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredHospitals.map((hospital, index) => (
                        <motion.div
                          key={hospital.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="healthcare-card overflow-hidden"
                        >
                          {/* Admin Controls */}
                          {adminMode && (
                            <AdminFacilityControls
                              type="hospital"
                              facility={hospital}
                              onUpdate={fetchData}
                            />
                          )}

                          {/* Status Badge for Admin */}
                          {adminMode && hospital.status !== "approved" && (
                            <div className="mb-3">
                              <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                                {hospital.status}
                              </span>
                            </div>
                          )}

                          <div className="relative h-48 -m-6 mb-4">
                            <img
                              src={hospital.image_url || "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop"}
                              alt={hospital.name}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-4 right-4 bg-healthcare-green text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                              24/7 Emergency
                            </span>
                            <span className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-medium">
                              {hospital.type}
                            </span>
                          </div>

                          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                            {hospital.name}
                          </h3>

                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{hospital.address}</span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {(hospital.specialties || []).slice(0, 3).map((spec) => (
                              <span key={spec} className="healthcare-badge text-xs">
                                {spec}
                              </span>
                            ))}
                            {(hospital.specialties || []).length > 3 && (
                              <span className="healthcare-badge text-xs">
                                +{(hospital.specialties || []).length - 3} more
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-accent fill-accent" />
                                <span className="font-semibold text-foreground">{hospital.rating || 0}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                <Building2 className="w-4 h-4" />
                                <span>{hospital.beds || 0} beds</span>
                              </div>
                            </div>
                            {hospital.phone && (
                              <Button variant="healthcare" size="sm" asChild>
                                <a href={`tel:${hospital.phone}`}>
                                  <Phone className="w-4 h-4 mr-1" />
                                  Contact
                                </a>
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {filteredDiagnostics.length === 0 ? (
                    <div className="text-center py-12">
                      <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No diagnostic centers found. Check back later or try a different search.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredDiagnostics.map((diagnostic, index) => (
                        <motion.div
                          key={diagnostic.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="healthcare-card overflow-hidden"
                        >
                          {/* Admin Controls */}
                          {adminMode && (
                            <AdminFacilityControls
                              type="diagnostic"
                              facility={diagnostic}
                              onUpdate={fetchData}
                            />
                          )}

                          {/* Status Badge for Admin */}
                          {adminMode && diagnostic.status !== "approved" && (
                            <div className="mb-3">
                              <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                                {diagnostic.status}
                              </span>
                            </div>
                          )}

                          <div className="relative h-40 -m-6 mb-4">
                            <img
                              src={diagnostic.image_url || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop"}
                              alt={diagnostic.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                            {diagnostic.name}
                          </h3>

                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{diagnostic.address}</span>
                          </div>

                          {diagnostic.open_hours && (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                              <Clock className="w-4 h-4" />
                              <span>{diagnostic.open_hours}</span>
                            </div>
                          )}

                          <div className="space-y-1 mb-4">
                            <p className="text-xs font-medium text-muted-foreground">Services & Prices:</p>
                            {diagnostic.services.slice(0, 3).map((s, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{s.name}</span>
                                <span className="font-medium text-foreground">{s.price || "N/A"}</span>
                              </div>
                            ))}
                            {diagnostic.services.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{diagnostic.services.length - 3} more services
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-accent fill-accent" />
                              <span className="font-semibold text-foreground">{diagnostic.rating || 0}</span>
                            </div>
                            {diagnostic.phone && (
                              <Button variant="healthcare" size="sm" asChild>
                                <a href={`tel:${diagnostic.phone}`}>
                                  <Phone className="w-4 h-4 mr-1" />
                                  Contact
                                </a>
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Add Hospital Dialog */}
      <Dialog open={showAddHospitalDialog} onOpenChange={setShowAddHospitalDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Hospital</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Name *</Label>
              <Input
                value={newHospital.name}
                onChange={(e) => setNewHospital(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Type *</Label>
              <Select
                value={newHospital.type}
                onValueChange={(value) => setNewHospital(prev => ({ ...prev, type: value }))}
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
                value={newHospital.location}
                onValueChange={(value) => setNewHospital(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locationsList.filter(l => l.value !== "all").map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Address *</Label>
              <Textarea
                value={newHospital.address}
                onChange={(e) => setNewHospital(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newHospital.phone}
                onChange={(e) => setNewHospital(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Beds</Label>
              <Input
                type="number"
                value={newHospital.beds}
                onChange={(e) => setNewHospital(prev => ({ ...prev, beds: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Specialties (comma separated)</Label>
              <Input
                value={newHospital.specialties}
                onChange={(e) => setNewHospital(prev => ({ ...prev, specialties: e.target.value }))}
                placeholder="Cardiology, Neurology, Pediatrics..."
              />
            </div>
            <div className="md:col-span-2">
              <Label>Image URL</Label>
              <Input
                value={newHospital.image_url}
                onChange={(e) => setNewHospital(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddHospitalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHospital} disabled={addingFacility}>
              {addingFacility ? "Adding..." : "Add Hospital"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Diagnostic Dialog */}
      <Dialog open={showAddDiagnosticDialog} onOpenChange={setShowAddDiagnosticDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Diagnostic Center</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Name *</Label>
              <Input
                value={newDiagnostic.name}
                onChange={(e) => setNewDiagnostic(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Location *</Label>
              <Select
                value={newDiagnostic.location}
                onValueChange={(value) => setNewDiagnostic(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locationsList.filter(l => l.value !== "all").map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newDiagnostic.phone}
                onChange={(e) => setNewDiagnostic(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Address *</Label>
              <Textarea
                value={newDiagnostic.address}
                onChange={(e) => setNewDiagnostic(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <Label>Open Hours</Label>
              <Input
                value={newDiagnostic.open_hours}
                onChange={(e) => setNewDiagnostic(prev => ({ ...prev, open_hours: e.target.value }))}
                placeholder="e.g., 8:00 AM - 10:00 PM"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={newDiagnostic.image_url}
                onChange={(e) => setNewDiagnostic(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>

            {/* Services */}
            <div className="md:col-span-2 border-t pt-4">
              <Label className="mb-2 block">Services & Prices</Label>
              <div className="space-y-2">
                {newDiagnostic.services.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-muted p-2 rounded text-sm">
                    <span className="flex-1">{service.name}</span>
                    <span className="text-muted-foreground">{service.price}</span>
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
                <Button variant="outline" size="icon" onClick={addServiceToNew}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDiagnosticDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDiagnostic} disabled={addingFacility}>
              {addingFacility ? "Adding..." : "Add Diagnostic Center"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
