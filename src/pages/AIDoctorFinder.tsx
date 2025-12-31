import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Sparkles, ArrowRight, Stethoscope, Heart, Activity, 
  Thermometer, HeadphonesIcon, Eye, Bone, Baby, Clock, CheckCircle2, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const symptomCategories = [
  { id: "general", name: "General", icon: Activity, symptoms: ["Fever", "Fatigue", "Weight Loss", "Weakness"] },
  { id: "respiratory", name: "Respiratory", icon: HeadphonesIcon, symptoms: ["Cough", "Shortness of Breath", "Chest Pain", "Wheezing"] },
  { id: "cardiac", name: "Heart", icon: Heart, symptoms: ["Palpitations", "Chest Tightness", "Dizziness", "Swelling"] },
  { id: "digestive", name: "Digestive", icon: Thermometer, symptoms: ["Stomach Pain", "Nausea", "Bloating", "Diarrhea"] },
  { id: "neurological", name: "Neurological", icon: Brain, symptoms: ["Headache", "Numbness", "Memory Issues", "Tremors"] },
  { id: "vision", name: "Vision", icon: Eye, symptoms: ["Blurred Vision", "Eye Pain", "Redness", "Light Sensitivity"] },
  { id: "musculoskeletal", name: "Bones & Joints", icon: Bone, symptoms: ["Joint Pain", "Back Pain", "Stiffness", "Swelling"] },
  { id: "pediatric", name: "Child Health", icon: Baby, symptoms: ["Growth Issues", "Feeding Problems", "Rashes", "Behavioral"] },
];

const doctorRecommendations: Record<string, { specialty: string; reason: string; doctors: any[] }> = {
  "Fever,Cough": {
    specialty: "General Physician",
    reason: "Your symptoms suggest a possible respiratory infection. A General Physician can diagnose and treat common infections.",
    doctors: [
      { id: 1, name: "Dr. Aminul Islam", specialty: "General Physician", hospital: "Labaid Hospital", rating: 4.7, fee: "৳800", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
      { id: 2, name: "Dr. Nasreen Akter", specialty: "General Physician", hospital: "United Hospital", rating: 4.8, fee: "৳1,000", image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=100&h=100&fit=crop&crop=face" },
    ]
  },
  "Palpitations,Chest Tightness": {
    specialty: "Cardiologist",
    reason: "Heart-related symptoms require evaluation by a Cardiologist to assess your cardiovascular health.",
    doctors: [
      { id: 1, name: "Dr. Sarah Ahmed", specialty: "Cardiologist", hospital: "Square Hospital", rating: 4.9, fee: "৳1,500", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" },
    ]
  },
  "Headache,Numbness": {
    specialty: "Neurologist",
    reason: "Neurological symptoms should be evaluated by a specialist to rule out any underlying conditions.",
    doctors: [
      { id: 1, name: "Dr. Mohammad Rahman", specialty: "Neurologist", hospital: "Square Hospital", rating: 4.8, fee: "৳2,000", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
    ]
  },
  "Joint Pain,Stiffness": {
    specialty: "Orthopedic Surgeon",
    reason: "Joint and bone problems require specialized care from an Orthopedic Surgeon.",
    doctors: [
      { id: 1, name: "Dr. Kamal Hossain", specialty: "Orthopedic", hospital: "Ibn Sina Hospital", rating: 4.6, fee: "৳1,500", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face" },
    ]
  },
  "default": {
    specialty: "General Physician",
    reason: "Based on your symptoms, we recommend starting with a General Physician who can provide initial assessment and refer you to a specialist if needed.",
    doctors: [
      { id: 1, name: "Dr. Aminul Islam", specialty: "General Physician", hospital: "Labaid Hospital", rating: 4.7, fee: "৳800", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
    ]
  }
};

export default function AIDoctorFinder() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<typeof doctorRecommendations["default"] | null>(null);
  const [step, setStep] = useState<"select" | "analyzing" | "result">("select");

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) return;
    
    setIsAnalyzing(true);
    setStep("analyzing");

    setTimeout(() => {
      // Find matching recommendation
      const symptomKey = selectedSymptoms.slice(0, 2).join(",");
      const rec = doctorRecommendations[symptomKey] || doctorRecommendations["default"];
      setRecommendation(rec);
      setIsAnalyzing(false);
      setStep("result");
    }, 2500);
  };

  const resetFinder = () => {
    setSelectedSymptoms([]);
    setRecommendation(null);
    setStep("select");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-secondary py-16">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              AI Doctor Finder
            </h1>
            <p className="text-primary-foreground/80">
              Describe your symptoms and our AI will recommend the right specialist for you
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="healthcare-section">
        <div className="healthcare-container max-w-4xl">
          <AnimatePresence mode="wait">
            {step === "select" && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="healthcare-card">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-accent" />
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Select Your Symptoms
                    </h2>
                  </div>
                  <p className="text-muted-foreground mb-8">
                    Choose the symptoms you're experiencing. Select multiple symptoms for more accurate recommendations.
                  </p>

                  <div className="space-y-6">
                    {symptomCategories.map((category) => (
                      <div key={category.id}>
                        <div className="flex items-center gap-2 mb-3">
                          <category.icon className="w-5 h-5 text-primary" />
                          <h3 className="font-medium text-foreground">{category.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {category.symptoms.map((symptom) => (
                            <button
                              key={symptom}
                              onClick={() => toggleSymptom(symptom)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedSymptoms.includes(symptom)
                                  ? "bg-primary text-primary-foreground shadow-md"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {symptom}
                              {selectedSymptoms.includes(symptom) && (
                                <CheckCircle2 className="w-4 h-4 ml-1 inline" />
                              )}
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
                      className="mt-8 pt-6 border-t border-border"
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Selected symptoms:</p>
                          <p className="font-medium text-foreground">{selectedSymptoms.join(", ")}</p>
                        </div>
                        <Button variant="healthcare" size="lg" onClick={analyzeSymptoms}>
                          <Brain className="w-5 h-5 mr-2" />
                          Find Doctor
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {step === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 relative">
                  <Brain className="w-12 h-12 text-primary" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                  Analyzing Your Symptoms
                </h2>
                <p className="text-muted-foreground">
                  Our AI is finding the best specialist for you...
                </p>
              </motion.div>
            )}

            {step === "result" && recommendation && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Recommendation Card */}
                <div className="healthcare-card border-2 border-primary">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                        Recommended Specialist
                      </h2>
                      <p className="text-2xl font-bold text-primary">{recommendation.specialty}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted mb-6">
                    <p className="text-muted-foreground">
                      <Sparkles className="w-4 h-4 inline mr-2 text-accent" />
                      {recommendation.reason}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">Based on:</span>
                    {selectedSymptoms.map(symptom => (
                      <span key={symptom} className="healthcare-badge text-xs">{symptom}</span>
                    ))}
                  </div>
                </div>

                {/* Recommended Doctors */}
                <div className="healthcare-card">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Available {recommendation.specialty}s
                  </h3>

                  <div className="space-y-4">
                    {recommendation.doctors.map((doctor) => (
                      <Link
                        key={doctor.id}
                        to={`/doctors/${doctor.id}`}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{doctor.name}</h4>
                          <p className="text-sm text-primary">{doctor.specialty}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {doctor.hospital}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{doctor.fee}</p>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-accent">★</span>
                            <span className="text-foreground">{doctor.rating}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="healthcare-outline" onClick={resetFinder} className="flex-1">
                      Try Different Symptoms
                    </Button>
                    <Button variant="healthcare" asChild className="flex-1">
                      <Link to="/doctors">View All Doctors</Link>
                    </Button>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Disclaimer:</strong> This AI-powered recommendation is for informational purposes only 
                    and does not constitute medical advice. Please consult with a healthcare professional for proper diagnosis and treatment.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
