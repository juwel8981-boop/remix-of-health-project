import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Phone, Star, Navigation, Building2, Stethoscope, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const locations = [
  { value: "all", label: "All Locations" },
  { value: "dhaka", label: "Dhaka" },
  { value: "chattogram", label: "Chattogram" },
  { value: "rajshahi", label: "Rajshahi" },
  { value: "khulna", label: "Khulna" },
  { value: "sylhet", label: "Sylhet" },
  { value: "barisal", label: "Barisal" },
  { value: "rangpur", label: "Rangpur" },
  { value: "mymensingh", label: "Mymensingh" },
];

const hospitals = [
  {
    id: 1,
    name: "Dhaka Medical College Hospital",
    type: "Government",
    location: "dhaka",
    address: "Secretariat Road, Dhaka 1000",
    phone: "+880 2-55165001",
    rating: 4.5,
    reviews: 324,
    distance: "2.5 km",
    emergency: true,
    specialties: ["Cardiology", "Neurology", "Orthopedics", "Oncology"],
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Square Hospital",
    type: "Private",
    location: "dhaka",
    address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, Dhaka",
    phone: "+880 2-8144400",
    rating: 4.8,
    reviews: 512,
    distance: "4.2 km",
    emergency: true,
    specialties: ["Cardiac Surgery", "Nephrology", "Gastroenterology"],
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Chattogram Medical College Hospital",
    type: "Government",
    location: "chattogram",
    address: "K.B. Fazlul Kader Road, Chattogram",
    phone: "+880 31-630335",
    rating: 4.4,
    reviews: 298,
    distance: "3.2 km",
    emergency: true,
    specialties: ["General Surgery", "Medicine", "Pediatrics"],
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Rajshahi Medical College Hospital",
    type: "Government",
    location: "rajshahi",
    address: "Medical College Road, Rajshahi",
    phone: "+880 721-772150",
    rating: 4.3,
    reviews: 186,
    distance: "1.8 km",
    emergency: true,
    specialties: ["Cardiology", "Orthopedics", "Gynecology"],
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    name: "Apollo Hospital Dhaka",
    type: "Private",
    location: "dhaka",
    address: "Plot 81, Block E, Bashundhara, Dhaka",
    phone: "+880 2-8401661",
    rating: 4.7,
    reviews: 428,
    distance: "6.8 km",
    emergency: true,
    specialties: ["Transplant Surgery", "Oncology", "Neurosurgery"],
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
  },
  {
    id: 6,
    name: "Sylhet MAG Osmani Medical College",
    type: "Government",
    location: "sylhet",
    address: "Medical Road, Sylhet 3100",
    phone: "+880 821-713667",
    rating: 4.2,
    reviews: 145,
    distance: "2.1 km",
    emergency: true,
    specialties: ["Medicine", "Surgery", "ENT"],
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop",
  },
];

const diagnostics = [
  {
    id: 1,
    name: "Popular Diagnostic Centre",
    location: "dhaka",
    address: "House 16, Road 2, Dhanmondi, Dhaka",
    phone: "+880 2-9116491",
    rating: 4.6,
    reviews: 289,
    distance: "1.8 km",
    services: ["Blood Tests", "X-Ray", "MRI", "CT Scan", "ECG"],
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Ibn Sina Diagnostic",
    location: "dhaka",
    address: "House 48, Road 9/A, Dhanmondi, Dhaka",
    phone: "+880 2-9144269",
    rating: 4.5,
    reviews: 234,
    distance: "2.3 km",
    services: ["Pathology", "Radiology", "Ultrasound", "Endoscopy"],
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Labaid Diagnostics Chattogram",
    location: "chattogram",
    address: "CDA Avenue, Chattogram",
    phone: "+880 31-654321",
    rating: 4.7,
    reviews: 312,
    distance: "2.5 km",
    services: ["All Lab Tests", "Imaging", "Health Packages"],
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Medinova Diagnostic Rajshahi",
    location: "rajshahi",
    address: "Shaheb Bazar, Rajshahi",
    phone: "+880 721-812345",
    rating: 4.4,
    reviews: 156,
    distance: "1.5 km",
    services: ["Blood Tests", "ECG", "X-Ray", "Ultrasound"],
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    name: "Sylhet Diagnostic Centre",
    location: "sylhet",
    address: "Zindabazar, Sylhet",
    phone: "+880 821-723456",
    rating: 4.3,
    reviews: 98,
    distance: "1.2 km",
    services: ["Pathology", "Radiology", "Health Checkup"],
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=400&fit=crop",
  },
];

export default function Hospitals() {
  const [activeTab, setActiveTab] = useState<"hospitals" | "diagnostics">("hospitals");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const selectedLocationLabel = locations.find(l => l.value === selectedLocation)?.label || "All Locations";

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
                      {locations.map((location) => (
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

          {/* Tabs */}
          <div className="flex justify-center gap-4 mt-8">
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
        </div>
      </section>

      {/* Main Content */}
      <section className="healthcare-section">
        <div className="healthcare-container">
          {activeTab === "hospitals" ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredHospitals.map((hospital, index) => (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="healthcare-card overflow-hidden"
                >
                  <div className="relative h-48 -m-6 mb-4">
                    <img
                      src={hospital.image}
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                    />
                    {hospital.emergency && (
                      <span className="absolute top-4 right-4 bg-healthcare-red text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        24/7 Emergency
                      </span>
                    )}
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
                    {hospital.specialties.slice(0, 3).map((spec) => (
                      <span key={spec} className="healthcare-badge text-xs">
                        {spec}
                      </span>
                    ))}
                    {hospital.specialties.length > 3 && (
                      <span className="healthcare-badge text-xs">
                        +{hospital.specialties.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-semibold text-foreground">{hospital.rating}</span>
                        <span className="text-sm text-muted-foreground">({hospital.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Navigation className="w-4 h-4" />
                        <span>{hospital.distance}</span>
                      </div>
                    </div>
                    <Button variant="healthcare" size="sm">
                      <Phone className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </motion.div>
              ))}
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
                  <div className="relative h-40 -m-6 mb-4">
                    <img
                      src={diagnostic.image}
                      alt={diagnostic.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {diagnostic.name}
                  </h3>

                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{diagnostic.address}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {diagnostic.services.slice(0, 3).map((service) => (
                      <span key={service} className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">
                        {service}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="font-semibold text-foreground">{diagnostic.rating}</span>
                      <span className="text-xs text-muted-foreground">({diagnostic.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Navigation className="w-4 h-4" />
                      <span>{diagnostic.distance}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {((activeTab === "hospitals" && filteredHospitals.length === 0) ||
            (activeTab === "diagnostics" && filteredDiagnostics.length === 0)) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No facilities found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
