import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Filter, Star, CheckCircle2, Clock, Building2, ChevronDown, Brain, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

const symptomCategories = [
  { id: "general", name: "General", symptoms: ["Fever", "Fatigue", "Weight Loss", "Weakness"] },
  { id: "respiratory", name: "Respiratory", symptoms: ["Cough", "Shortness of Breath", "Chest Pain", "Wheezing"] },
  { id: "cardiac", name: "Heart", symptoms: ["Palpitations", "Chest Tightness", "Dizziness", "Swelling"] },
  { id: "neurological", name: "Neurological", symptoms: ["Headache", "Numbness", "Memory Issues", "Tremors"] },
  { id: "musculoskeletal", name: "Bones & Joints", symptoms: ["Joint Pain", "Back Pain", "Stiffness"] },
];

const symptomToSpecialty: Record<string, string> = {
  "Fever": "General Physician", "Fatigue": "General Physician", "Weight Loss": "General Physician", "Weakness": "General Physician",
  "Cough": "General Physician", "Shortness of Breath": "Cardiologist", "Chest Pain": "Cardiologist", "Wheezing": "General Physician",
  "Palpitations": "Cardiologist", "Chest Tightness": "Cardiologist", "Dizziness": "Neurologist", "Swelling": "Cardiologist",
  "Headache": "Neurologist", "Numbness": "Neurologist", "Memory Issues": "Neurologist", "Tremors": "Neurologist",
  "Joint Pain": "Orthopedic", "Back Pain": "Orthopedic", "Stiffness": "Orthopedic",
};

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Ahmed",
    specialty: "Cardiologist",
    hospital: "Dhaka Medical College",
    area: "Dhaka",
    rating: 4.9,
    reviews: 124,
    verified: true,
    experience: "15 years",
    fee: "৳1,500",
    available: true,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Dr. Mohammad Rahman",
    specialty: "Neurologist",
    hospital: "Square Hospital",
    area: "Dhaka",
    rating: 4.8,
    reviews: 98,
    verified: true,
    experience: "12 years",
    fee: "৳2,000",
    available: true,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Dr. Fatima Khan",
    specialty: "Pediatrician",
    hospital: "Apollo Hospital",
    area: "Chittagong",
    rating: 4.9,
    reviews: 156,
    verified: true,
    experience: "10 years",
    fee: "৳1,200",
    available: false,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Dr. Aminul Islam",
    specialty: "Dermatologist",
    hospital: "Labaid Hospital",
    area: "Dhaka",
    rating: 4.7,
    reviews: 89,
    verified: true,
    experience: "8 years",
    fee: "৳1,000",
    available: true,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Dr. Rubina Akter",
    specialty: "Gynecologist",
    hospital: "United Hospital",
    area: "Dhaka",
    rating: 4.9,
    reviews: 203,
    verified: true,
    experience: "18 years",
    fee: "৳1,800",
    available: true,
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 6,
    name: "Dr. Kamal Hossain",
    specialty: "Orthopedic",
    hospital: "Ibn Sina Hospital",
    area: "Sylhet",
    rating: 4.6,
    reviews: 76,
    verified: true,
    experience: "14 years",
    fee: "৳1,500",
    available: true,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
  },
];

export default function Doctors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [showFilters, setShowFilters] = useState(false);
  
  // AI Doctor Finder state
  const [showAIFinder, setShowAIFinder] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // Find most common specialty from selected symptoms
      const specialtyCounts: Record<string, number> = {};
      selectedSymptoms.forEach(symptom => {
        const spec = symptomToSpecialty[symptom] || "General Physician";
        specialtyCounts[spec] = (specialtyCounts[spec] || 0) + 1;
      });
      
      const recommendedSpecialty = Object.entries(specialtyCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
      
      setAiRecommendation(recommendedSpecialty);
      setSelectedSpecialty(recommendedSpecialty);
      setIsAnalyzing(false);
      setShowAIFinder(false);
      setSelectedSymptoms([]);
    }, 1500);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All Specialties" || doctor.specialty === selectedSpecialty;
    const matchesArea = selectedArea === "All Areas" || doctor.area === selectedArea;
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
              Search from over 10,000+ verified doctors across Bangladesh
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

          {/* AI Doctor Finder Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mt-6"
          >
            <Button 
              onClick={() => setShowAIFinder(true)}
              className="bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20 gap-2"
            >
              <Brain className="w-5 h-5" />
              <span>AI Doctor Finder</span>
              <Sparkles className="w-4 h-4" />
            </Button>
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
              >
                <p className="text-muted-foreground mb-4">
                  Select your symptoms and our AI will recommend the right specialist.
                </p>
                
                <div className="space-y-4">
                  {symptomCategories.map((category) => (
                    <div key={category.id}>
                      <h4 className="font-medium text-foreground mb-2">{category.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.symptoms.map((symptom) => (
                          <button
                            key={symptom}
                            onClick={() => toggleSymptom(symptom)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                              selectedSymptoms.includes(symptom)
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {symptom}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedSymptoms.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-4 border-t"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Selected: <span className="text-foreground font-medium">{selectedSymptoms.join(", ")}</span>
                      </p>
                      <Button onClick={analyzeSymptoms} className="gap-2">
                        <Brain className="w-4 h-4" />
                        Find Doctor
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
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

              {/* Doctor Cards */}
              <div className="space-y-4">
                {filteredDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/doctors/${doctor.id}`} className="block healthcare-card">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover mx-auto sm:mx-0"
                        />
                        <div className="flex-1 text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-display text-lg font-semibold text-foreground">
                              {doctor.name}
                            </h3>
                            {doctor.verified && (
                              <div className="flex items-center gap-1 justify-center sm:justify-start">
                                <CheckCircle2 className="w-4 h-4 text-healthcare-green" />
                                <span className="text-xs text-healthcare-green font-medium">Verified</span>
                              </div>
                            )}
                          </div>
                          <p className="text-primary font-medium mb-1">{doctor.specialty}</p>
                          <div className="flex items-center gap-2 justify-center sm:justify-start text-muted-foreground text-sm mb-2">
                            <Building2 className="w-4 h-4" />
                            <span>{doctor.hospital}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-accent fill-accent" />
                              <span className="font-semibold text-foreground">{doctor.rating}</span>
                              <span className="text-muted-foreground">({doctor.reviews})</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{doctor.experience}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{doctor.area}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center sm:items-end justify-between gap-4">
                          <div className="text-center sm:text-right">
                            <p className="text-2xl font-bold text-foreground">{doctor.fee}</p>
                            <p className="text-xs text-muted-foreground">Consultation Fee</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {doctor.available ? (
                              <span className="healthcare-badge-success text-xs">
                                <span className="w-2 h-2 rounded-full bg-healthcare-green mr-1" />
                                Available Today
                              </span>
                            ) : (
                              <span className="healthcare-badge text-xs">
                                Next Available: Tomorrow
                              </span>
                            )}
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

              {filteredDoctors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No doctors found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
