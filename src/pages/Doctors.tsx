import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Filter, Star, CheckCircle2, Clock, Building2, ChevronDown, Brain, Sparkles, Send, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import AdminDoctorControls from "@/components/admin/AdminDoctorControls";

interface Doctor {
  id: string;
  full_name: string;
  email: string;
  registration_number: string;
  specialization: string;
  hospital_affiliation: string | null;
  experience_years: number | null;
  phone: string | null;
  verification_status: string;
  is_active: boolean;
  is_featured: boolean;
  featured_rank: number | null;
}

interface Chamber {
  id: string;
  doctor_id: string;
  name: string;
  address: string;
  phone: string | null;
  days: string[] | null;
  timing: string | null;
  appointment_fee: string | null;
  serial_available: boolean | null;
}

const specialties = [
  "All Specialties",
  "General Physician",
  "Cardiologist",
  "Neurologist",
  "Pediatrician",
  "Dermatologist",
  "Orthopedic",
  "Gynecologist",
  "ENT Specialist",
  "Psychiatrist",
];

const areas = [
  "All Areas",
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Mymensingh",
];

// Symptom keywords mapped to specialties for AI analysis
const symptomKeywords: { keywords: string[]; specialty: string }[] = [
  { keywords: ["heart", "chest pain", "palpitation", "blood pressure", "hypertension", "cardiac", "heartbeat", "angina"], specialty: "Cardiologist" },
  { keywords: ["headache", "migraine", "seizure", "numbness", "memory", "tremor", "nerve", "brain", "stroke", "paralysis"], specialty: "Neurologist" },
  { keywords: ["skin", "rash", "acne", "eczema", "itching", "allergy", "hair loss", "psoriasis", "dermatitis"], specialty: "Dermatologist" },
  { keywords: ["bone", "joint", "fracture", "back pain", "spine", "arthritis", "knee", "shoulder", "hip", "muscle pain"], specialty: "Orthopedic" },
  { keywords: ["pregnancy", "menstrual", "period", "gynec", "uterus", "ovary", "fertility", "contraception", "menopause"], specialty: "Gynecologist" },
  { keywords: ["child", "baby", "infant", "pediatric", "vaccination", "growth", "developmental"], specialty: "Pediatrician" },
  { keywords: ["ear", "nose", "throat", "hearing", "sinus", "tonsil", "vertigo", "snoring", "voice"], specialty: "ENT Specialist" },
  { keywords: ["anxiety", "depression", "stress", "mental", "sleep disorder", "insomnia", "mood", "panic", "psychiatric"], specialty: "Psychiatrist" },
  { keywords: ["fever", "cold", "cough", "flu", "fatigue", "weakness", "general", "body ache", "infection"], specialty: "General Physician" },
];

export default function Doctors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [showFilters, setShowFilters] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [chambers, setChambers] = useState<Record<string, Chamber[]>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  
  // AI Doctor Finder state
  const [showAIFinder, setShowAIFinder] = useState(false);
  const [symptomText, setSymptomText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
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
    checkAdmin();
  }, []);

  // Fetch doctors function (moved outside useEffect so it can be called from AdminDoctorControls)
  const fetchDoctors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("featured_rank", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      // In admin mode, show all doctors; otherwise only approved+active
      const filteredData = adminMode 
        ? data 
        : data.filter(d => d.verification_status === "approved" && d.is_active);
      setDoctors(filteredData);
      // Fetch chambers for all doctors
      if (data.length > 0) {
        fetchChambers(data.map(d => d.id));
      }
    }
    setLoading(false);
  };

  // Fetch approved and active doctors from database
  useEffect(() => {
    fetchDoctors();
  }, [adminMode]);

  const fetchChambers = async (doctorIds: string[]) => {
    const { data, error } = await supabase
      .from("doctor_chambers")
      .select("*")
      .in("doctor_id", doctorIds);

    if (!error && data) {
      const chambersByDoctor: Record<string, Chamber[]> = {};
      data.forEach((chamber) => {
        if (!chambersByDoctor[chamber.doctor_id]) {
          chambersByDoctor[chamber.doctor_id] = [];
        }
        chambersByDoctor[chamber.doctor_id].push(chamber);
      });
      setChambers(chambersByDoctor);
    }
  };

  // Get first chamber's fee for display
  const getDisplayFee = (doctorId: string) => {
    const doctorChambers = chambers[doctorId];
    if (doctorChambers && doctorChambers.length > 0) {
      const fee = doctorChambers[0].appointment_fee;
      return fee ? `৳${fee}` : "Contact for fee";
    }
    return "Contact for fee";
  };

  // Get area from first chamber
  const getDisplayArea = (doctorId: string) => {
    const doctorChambers = chambers[doctorId];
    if (doctorChambers && doctorChambers.length > 0) {
      const address = doctorChambers[0].address.toLowerCase();
      for (const area of areas.slice(1)) {
        if (address.includes(area.toLowerCase())) {
          return area;
        }
      }
    }
    return "Dhaka"; // Default
  };

  const analyzeSymptoms = () => {
    if (symptomText.trim().length === 0) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const text = symptomText.toLowerCase();
      const specialtyCounts: Record<string, number> = {};
      
      // Match keywords in user's text to find relevant specialties
      symptomKeywords.forEach(({ keywords, specialty }) => {
        keywords.forEach(keyword => {
          if (text.includes(keyword.toLowerCase())) {
            specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
          }
        });
      });
      
      // Get the specialty with most keyword matches, default to General Physician
      const recommendedSpecialty = Object.entries(specialtyCounts).length > 0
        ? Object.entries(specialtyCounts).sort((a, b) => b[1] - a[1])[0][0]
        : "General Physician";
      
      setAiRecommendation(recommendedSpecialty);
      setSelectedSpecialty(recommendedSpecialty);
      setIsAnalyzing(false);
      setShowAIFinder(false);
      setSymptomText("");
    }, 1500);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doctor.hospital_affiliation || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All Specialties" || doctor.specialization === selectedSpecialty;
    const doctorArea = getDisplayArea(doctor.id);
    const matchesArea = selectedArea === "All Areas" || doctorArea === selectedArea;
    return matchesSearch && matchesSpecialty && matchesArea;
  });

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
              Find Your Doctor
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Search from verified doctors across Bangladesh
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-2 shadow-healthcare-lg max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-muted">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors, specialties..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted md:w-48">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground"
                >
                  {areas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
              <Button variant="accent" size="lg">
                <Search className="w-5 h-5" />
                <span className="hidden md:inline ml-2">Search</span>
              </Button>
            </div>
          </motion.div>

          {/* AI Doctor Finder Button + Admin Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-3 mt-6"
          >
            <Button 
              onClick={() => setShowAIFinder(true)}
              className="bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20 gap-2"
            >
              <Brain className="w-5 h-5" />
              <span>AI Doctor Finder</span>
              <Sparkles className="w-4 h-4" />
            </Button>
            
            {isAdmin && (
              <Button
                onClick={() => setAdminMode(!adminMode)}
                className={`gap-2 ${
                  adminMode
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>{adminMode ? "Exit Admin Mode" : "Admin Mode"}</span>
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* AI Doctor Finder Dialog */}
      <Dialog open={showAIFinder} onOpenChange={setShowAIFinder}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              AI Doctor Finder
            </DialogTitle>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            {!isAnalyzing ? (
              <motion.div
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-muted-foreground">
                  Describe your symptoms in detail and our AI will recommend the right specialist.
                </p>
                
                <Textarea
                  placeholder="E.g., I've been having severe headaches for the past week, along with dizziness and sometimes blurred vision..."
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  className="min-h-[120px] resize-none"
                />

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Be as detailed as possible for better recommendations
                  </p>
                  <Button 
                    onClick={analyzeSymptoms} 
                    disabled={symptomText.trim().length === 0}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Analyze Symptoms
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                  <Brain className="w-8 h-8 text-primary" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                </div>
                <p className="text-foreground font-medium">Analyzing symptoms...</p>
                <p className="text-sm text-muted-foreground">Finding the best specialist for you</p>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* AI Recommendation Banner */}
      {aiRecommendation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border-b border-primary/20"
        >
          <div className="healthcare-container py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-foreground">
                  <span className="font-medium">AI Recommendation:</span> Based on your symptoms, we suggest seeing a{" "}
                  <span className="text-primary font-semibold">{aiRecommendation}</span>
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                setAiRecommendation(null);
                setSelectedSpecialty("All Specialties");
              }}>
                Clear
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <section className="healthcare-section">
        <div className="healthcare-container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`lg:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}
            >
              <div className="healthcare-card sticky top-24">
                <h3 className="font-display font-semibold text-foreground mb-4">Filters</h3>

                {/* Specialty Filter */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Specialty
                  </label>
                  <div className="space-y-2">
                    {specialties.map((specialty) => (
                      <label
                        key={specialty}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="specialty"
                          checked={selectedSpecialty === specialty}
                          onChange={() => setSelectedSpecialty(specialty)}
                          className="w-4 h-4 text-primary border-border focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Availability
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-primary border-border focus:ring-primary" />
                      <span className="text-sm text-foreground">Available Today</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-primary border-border focus:ring-primary" />
                      <span className="text-sm text-foreground">Online Consultation</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredDoctors.length}</span> doctors found
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                    Relevance <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {/* Doctor Cards */}
              {!loading && (
                <div className="space-y-4">
                  {filteredDoctors.map((doctor, index) => (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {/* Admin Controls - Show when admin mode is enabled */}
                      {adminMode && (
                        <AdminDoctorControls
                          doctor={doctor}
                          chambers={chambers[doctor.id] || []}
                          onUpdate={fetchDoctors}
                        />
                      )}
                      
                      <Link to={`/doctors/${doctor.id}`} className="block healthcare-card hover:shadow-healthcare-lg transition-shadow">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img
                            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face"
                            alt={doctor.full_name}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover mx-auto sm:mx-0"
                          />
                          <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="font-display text-lg font-semibold text-foreground">
                                {doctor.full_name}
                              </h3>
                              <div className="flex items-center gap-1 justify-center sm:justify-start">
                                <CheckCircle2 className="w-4 h-4 text-healthcare-green" />
                                <span className="text-xs text-healthcare-green font-medium">Verified</span>
                              </div>
                              {doctor.is_featured && (
                                <div className="flex items-center gap-1 justify-center sm:justify-start">
                                  <Star className="w-4 h-4 text-accent fill-accent" />
                                  <span className="text-xs text-accent font-medium">Featured</span>
                                </div>
                              )}
                              {adminMode && !doctor.is_active && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-primary font-medium mb-1">{doctor.specialization}</p>
                            <div className="flex items-center gap-2 justify-center sm:justify-start text-muted-foreground text-sm mb-2">
                              <Building2 className="w-4 h-4" />
                              <span>{doctor.hospital_affiliation || "Independent Practice"}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{doctor.experience_years ? `${doctor.experience_years} years` : "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{getDisplayArea(doctor.id)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center sm:items-end justify-between gap-4">
                            <div className="text-center sm:text-right">
                              <p className="text-2xl font-bold text-foreground">{getDisplayFee(doctor.id)}</p>
                              <p className="text-xs text-muted-foreground">Consultation Fee</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <span className="healthcare-badge-success text-xs">
                                <span className="w-2 h-2 rounded-full bg-healthcare-green mr-1" />
                                Available
                              </span>
                              <Button variant="healthcare" size="sm">
                                Book Appointment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && filteredDoctors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No doctors found matching your criteria.</p>
                  <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
