import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Sparkles, ArrowRight, Stethoscope, Heart, Activity, 
  Thermometer, HeadphonesIcon, Eye, Bone, Baby, Clock, CheckCircle2, MapPin, 
  Send, Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const symptomCategories = [
  { id: "general", name: "General", nameBn: "সাধারণ", icon: Activity, symptoms: [
    { en: "Fever", bn: "জ্বর" },
    { en: "Fatigue", bn: "ক্লান্তি" },
    { en: "Weight Loss", bn: "ওজন কমা" },
    { en: "Weakness", bn: "দুর্বলতা" }
  ]},
  { id: "respiratory", name: "Respiratory", nameBn: "শ্বাসতন্ত্র", icon: HeadphonesIcon, symptoms: [
    { en: "Cough", bn: "কাশি" },
    { en: "Shortness of Breath", bn: "শ্বাসকষ্ট" },
    { en: "Chest Pain", bn: "বুকে ব্যথা" },
    { en: "Wheezing", bn: "শ্বাসে শব্দ" }
  ]},
  { id: "cardiac", name: "Heart", nameBn: "হৃদয়", icon: Heart, symptoms: [
    { en: "Palpitations", bn: "বুক ধড়ফড়" },
    { en: "Chest Tightness", bn: "বুকে চাপ" },
    { en: "Dizziness", bn: "মাথা ঘোরা" },
    { en: "Swelling", bn: "ফোলা" }
  ]},
  { id: "digestive", name: "Digestive", nameBn: "হজম", icon: Thermometer, symptoms: [
    { en: "Stomach Pain", bn: "পেটে ব্যথা" },
    { en: "Nausea", bn: "বমি বমি ভাব" },
    { en: "Bloating", bn: "পেট ফাঁপা" },
    { en: "Diarrhea", bn: "ডায়রিয়া" }
  ]},
  { id: "neurological", name: "Neurological", nameBn: "স্নায়বিক", icon: Brain, symptoms: [
    { en: "Headache", bn: "মাথা ব্যথা" },
    { en: "Numbness", bn: "অসাড়তা" },
    { en: "Memory Issues", bn: "স্মৃতি সমস্যা" },
    { en: "Tremors", bn: "কাঁপুনি" }
  ]},
  { id: "vision", name: "Vision", nameBn: "দৃষ্টি", icon: Eye, symptoms: [
    { en: "Blurred Vision", bn: "ঝাপসা দৃষ্টি" },
    { en: "Eye Pain", bn: "চোখে ব্যথা" },
    { en: "Redness", bn: "চোখ লাল" },
    { en: "Light Sensitivity", bn: "আলো সংবেদনশীলতা" }
  ]},
  { id: "musculoskeletal", name: "Bones & Joints", nameBn: "হাড় ও জয়েন্ট", icon: Bone, symptoms: [
    { en: "Joint Pain", bn: "জয়েন্টে ব্যথা" },
    { en: "Back Pain", bn: "পিঠে ব্যথা" },
    { en: "Stiffness", bn: "শক্ত হওয়া" },
    { en: "Swelling", bn: "ফোলা" }
  ]},
  { id: "pediatric", name: "Child Health", nameBn: "শিশু স্বাস্থ্য", icon: Baby, symptoms: [
    { en: "Growth Issues", bn: "বৃদ্ধি সমস্যা" },
    { en: "Feeding Problems", bn: "খাওয়ার সমস্যা" },
    { en: "Rashes", bn: "র‍্যাশ" },
    { en: "Behavioral", bn: "আচরণগত" }
  ]},
];

// Fallback doctors for recommendations
const fallbackDoctors = [
  { id: 1, name: "Dr. Aminul Islam", specialty: "General Physician", hospital: "Labaid Hospital", rating: 4.7, fee: "৳800", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
  { id: 21, name: "Dr. Shoaib Ahmad", specialty: "General Physician", hospital: "Praava Health", rating: 4.8, fee: "৳800", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face" },
];

const specialtyDoctors: Record<string, any[]> = {
  "General Physician": [
    { id: 21, name: "Dr. Shoaib Ahmad", hospital: "Praava Health", rating: 4.8, fee: "৳800", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face" },
    { id: 22, name: "Dr. Kabir Ahmed Khan", hospital: "Praava Health", rating: 4.7, fee: "৳1,000", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
  ],
  "Cardiologist": [
    { id: 1, name: "Dr. Fazle Rabbi Chowdhury", hospital: "Square Hospital", rating: 4.9, fee: "৳2,500", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
    { id: 2, name: "Dr. Mir Jamal Uddin", hospital: "United Hospital", rating: 4.8, fee: "৳2,000", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
  ],
  "Neurologist": [
    { id: 4, name: "Dr. Quazi Deen Mohammad", hospital: "National Institute of Neurosciences", rating: 4.9, fee: "৳2,500", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" },
    { id: 5, name: "Dr. Mohammad Shah Kamal", hospital: "Square Hospital", rating: 4.8, fee: "৳2,000", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
  ],
  "Pediatrician": [
    { id: 6, name: "Dr. Syeda Afroza", hospital: "Dhaka Shishu Hospital", rating: 4.9, fee: "৳1,500", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face" },
    { id: 7, name: "Dr. Md. Benzir Ahmed", hospital: "Apollo Hospital", rating: 4.8, fee: "৳1,200", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
  ],
  "Dermatologist": [
    { id: 9, name: "Dr. Rashida Begum", hospital: "Labaid Hospital", rating: 4.8, fee: "৳1,500", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face" },
    { id: 10, name: "Dr. Md. Shahidullah Sikder", hospital: "Square Hospital", rating: 4.7, fee: "৳1,800", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face" },
  ],
  "Gynecologist": [
    { id: 11, name: "Dr. Ferdousi Begum", hospital: "Dhaka Medical College", rating: 4.9, fee: "৳2,000", image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=100&h=100&fit=crop&crop=face" },
    { id: 12, name: "Dr. Mariha Alam Chowdhury", hospital: "Praava Health", rating: 4.8, fee: "৳1,500", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" },
  ],
  "Orthopedic": [
    { id: 14, name: "Dr. Rezaul Karim", hospital: "National Institute of Traumatology", rating: 4.9, fee: "৳2,000", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
    { id: 15, name: "Dr. Khandaker Abu Taleb", hospital: "Square Hospital", rating: 4.8, fee: "৳2,500", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
  ],
  "ENT Specialist": [
    { id: 17, name: "Dr. Kamrul Hassan Tarafder", hospital: "BSMMU", rating: 4.9, fee: "৳2,000", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
    { id: 18, name: "Dr. Belayat Hossain Siddique", hospital: "Square Hospital", rating: 4.8, fee: "৳1,800", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
  ],
  "Psychiatrist": [
    { id: 19, name: "Dr. Mohammad Waziul Alam Chowdhury", hospital: "National Institute of Mental Health", rating: 4.9, fee: "৳2,000", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" },
    { id: 20, name: "Dr. Helal Uddin Ahmed", hospital: "United Hospital", rating: 4.8, fee: "৳1,800", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
  ],
};

interface AIRecommendation {
  specialty: string;
  specialty_bn?: string;
  reason: string;
  urgency: "low" | "medium" | "high";
  disclaimer: string;
}

export default function AIDoctorFinder() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [step, setStep] = useState<"select" | "analyzing" | "result">("select");
  const [inputMode, setInputMode] = useState<"buttons" | "text">("buttons");

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const analyzeSymptoms = async () => {
    const symptomsText = inputMode === "text" 
      ? customSymptoms 
      : selectedSymptoms.join(", ");
    
    if (!symptomsText.trim()) {
      toast.error("Please describe your symptoms / আপনার লক্ষণগুলো বর্ণনা করুন");
      return;
    }
    
    setIsAnalyzing(true);
    setStep("analyzing");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-symptoms", {
        body: { symptoms: symptomsText }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setRecommendation(data);
      setStep("result");
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      toast.error("Failed to analyze symptoms. Please try again. / লক্ষণ বিশ্লেষণে ব্যর্থ। আবার চেষ্টা করুন।");
      setStep("select");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetFinder = () => {
    setSelectedSymptoms([]);
    setCustomSymptoms("");
    setRecommendation(null);
    setStep("select");
  };

  const getDoctorsForSpecialty = (specialty: string) => {
    return specialtyDoctors[specialty] || fallbackDoctors;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-destructive bg-destructive/10";
      case "medium": return "text-accent bg-accent/10";
      default: return "text-primary bg-primary/10";
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
            className="text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              AI Doctor Finder
            </h1>
            <p className="text-primary-foreground/80 mb-2">
              Describe your symptoms and our AI will recommend the right specialist for you
            </p>
            <p className="text-primary-foreground/70 text-sm flex items-center justify-center gap-2">
              <Languages className="w-4 h-4" />
              English & বাংলা supported
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
                  {/* Input Mode Toggle */}
                  <div className="flex items-center gap-2 mb-6 p-1 bg-muted rounded-lg w-fit">
                    <button
                      onClick={() => setInputMode("buttons")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        inputMode === "buttons"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Select Symptoms
                    </button>
                    <button
                      onClick={() => setInputMode("text")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        inputMode === "text"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Type in English/বাংলা
                    </button>
                  </div>

                  {inputMode === "buttons" ? (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="w-6 h-6 text-accent" />
                        <h2 className="font-display text-xl font-semibold text-foreground">
                          Select Your Symptoms / আপনার লক্ষণ নির্বাচন করুন
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
                              <h3 className="font-medium text-foreground">
                                {category.name} <span className="text-muted-foreground text-sm">({category.nameBn})</span>
                              </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {category.symptoms.map((symptom) => (
                                <button
                                  key={symptom.en}
                                  onClick={() => toggleSymptom(symptom.en)}
                                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    selectedSymptoms.includes(symptom.en)
                                      ? "bg-primary text-primary-foreground shadow-md"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                                >
                                  {symptom.en} ({symptom.bn})
                                  {selectedSymptoms.includes(symptom.en) && (
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
                            <Button variant="healthcare" size="lg" onClick={analyzeSymptoms} disabled={isAnalyzing}>
                              <Brain className="w-5 h-5 mr-2" />
                              Find Doctor
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <Languages className="w-6 h-6 text-accent" />
                        <h2 className="font-display text-xl font-semibold text-foreground">
                          Describe Your Symptoms / আপনার লক্ষণ বর্ণনা করুন
                        </h2>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Type your symptoms in English or Bangla. Our AI understands both languages.
                      </p>
                      <p className="text-muted-foreground mb-6 text-sm">
                        ইংরেজি বা বাংলায় আপনার লক্ষণ লিখুন। আমাদের AI উভয় ভাষা বোঝে।
                      </p>

                      <Textarea
                        value={customSymptoms}
                        onChange={(e) => setCustomSymptoms(e.target.value)}
                        placeholder="Example: I have fever and headache for 3 days...&#10;উদাহরণ: আমার ৩ দিন ধরে জ্বর ও মাথা ব্যথা..."
                        className="min-h-[150px] text-base"
                      />

                      <div className="mt-6 flex justify-end">
                        <Button 
                          variant="healthcare" 
                          size="lg" 
                          onClick={analyzeSymptoms} 
                          disabled={isAnalyzing || !customSymptoms.trim()}
                        >
                          <Send className="w-5 h-5 mr-2" />
                          Analyze / বিশ্লেষণ করুন
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </>
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
                  Analyzing Your Symptoms / লক্ষণ বিশ্লেষণ করা হচ্ছে
                </h2>
                <p className="text-muted-foreground">
                  Our AI is finding the best specialist for you...
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  আমাদের AI আপনার জন্য সেরা বিশেষজ্ঞ খুঁজছে...
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
                    <div className="flex-1">
                      <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                        Recommended Specialist / প্রস্তাবিত বিশেষজ্ঞ
                      </h2>
                      <p className="text-2xl font-bold text-primary">
                        {recommendation.specialty}
                        {recommendation.specialty_bn && (
                          <span className="text-lg font-normal text-muted-foreground ml-2">
                            ({recommendation.specialty_bn})
                          </span>
                        )}
                      </p>
                    </div>
                    {recommendation.urgency && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getUrgencyColor(recommendation.urgency)}`}>
                        {recommendation.urgency === "high" ? "জরুরি / Urgent" : 
                         recommendation.urgency === "medium" ? "মাঝারি / Moderate" : "সাধারণ / Normal"}
                      </span>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-muted mb-6">
                    <p className="text-muted-foreground">
                      <Sparkles className="w-4 h-4 inline mr-2 text-accent" />
                      {recommendation.reason}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">Based on / ভিত্তিতে:</span>
                    {inputMode === "text" ? (
                      <span className="healthcare-badge text-xs">{customSymptoms.slice(0, 50)}...</span>
                    ) : (
                      selectedSymptoms.map(symptom => (
                        <span key={symptom} className="healthcare-badge text-xs">{symptom}</span>
                      ))
                    )}
                  </div>
                </div>

                {/* Recommended Doctors */}
                <div className="healthcare-card">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Available {recommendation.specialty}s / উপলব্ধ বিশেষজ্ঞরা
                  </h3>

                  <div className="space-y-4">
                    {getDoctorsForSpecialty(recommendation.specialty).map((doctor) => (
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
                          <p className="text-sm text-primary">{recommendation.specialty}</p>
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
                      Try Different Symptoms / আবার চেষ্টা করুন
                    </Button>
                    <Button variant="healthcare" asChild className="flex-1">
                      <Link to="/doctors">View All Doctors / সব ডাক্তার</Link>
                    </Button>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Disclaimer / দাবিত্যাগ:</strong> {recommendation.disclaimer || "This AI-powered recommendation is for informational purposes only and does not constitute medical advice. Please consult with a healthcare professional for proper diagnosis and treatment. এই AI-চালিত সুপারিশ শুধুমাত্র তথ্যের জন্য এবং চিকিৎসা পরামর্শ নয়।"}
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
