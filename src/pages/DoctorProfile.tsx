import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { 
  Star, CheckCircle2, MapPin, Clock, Phone, Globe, Calendar,
  Building2, GraduationCap, Award, MessageCircle, Share2, Heart,
  ChevronRight, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock doctor data with chamber info
const doctorsData: Record<string, any> = {
  "1": {
    id: 1,
    name: "Dr. Sarah Ahmed",
    specialty: "Cardiologist",
    qualifications: ["MBBS", "MD (Cardiology)", "FACC"],
    experience: "15 years",
    about: "Dr. Sarah Ahmed is a highly experienced cardiologist specializing in interventional cardiology and heart failure management. She has performed over 5,000 cardiac procedures and is known for her patient-centric approach.",
    verified: true,
    rating: 4.9,
    totalReviews: 124,
    patientsServed: "5,000+",
    fee: "৳1,500",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    chambers: [
      {
        id: 1,
        name: "Square Hospital",
        address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka 1205",
        phone: "+880 2-8144400",
        days: ["Sunday", "Tuesday", "Thursday"],
        timing: "4:00 PM - 8:00 PM",
        appointmentFee: "৳1,500",
        serialAvailable: true,
      },
      {
        id: 2,
        name: "Personal Chamber",
        address: "House 45, Road 12, Dhanmondi, Dhaka 1209",
        phone: "+880 1711-123456",
        days: ["Monday", "Wednesday"],
        timing: "6:00 PM - 9:00 PM",
        appointmentFee: "৳1,200",
        serialAvailable: true,
      },
    ],
    education: [
      { degree: "MBBS", institution: "Dhaka Medical College", year: "2005" },
      { degree: "MD (Cardiology)", institution: "National Heart Foundation", year: "2010" },
      { degree: "FACC", institution: "American College of Cardiology", year: "2015" },
    ],
    awards: [
      "Best Cardiologist Award 2022 - Bangladesh Medical Association",
      "Excellence in Patient Care - Square Hospital 2021",
    ],
    reviews: [
      { id: 1, name: "Rahim Uddin", rating: 5, date: "2024-01-10", comment: "Excellent doctor. Very thorough in examination and explains everything clearly." },
      { id: 2, name: "Fatima Begum", rating: 5, date: "2024-01-05", comment: "Dr. Sarah saved my father's life. Forever grateful for her expertise." },
      { id: 3, name: "Kamal Hossain", rating: 4, date: "2023-12-28", comment: "Very professional and caring. Wait time was a bit long but worth it." },
    ],
  },
  "2": {
    id: 2,
    name: "Dr. Mohammad Rahman",
    specialty: "Neurologist",
    qualifications: ["MBBS", "FCPS (Neurology)"],
    experience: "12 years",
    about: "Dr. Mohammad Rahman is a renowned neurologist with expertise in treating epilepsy, stroke, and neurodegenerative disorders.",
    verified: true,
    rating: 4.8,
    totalReviews: 98,
    patientsServed: "3,500+",
    fee: "৳2,000",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    chambers: [
      {
        id: 1,
        name: "Square Hospital",
        address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka 1205",
        phone: "+880 2-8144400",
        days: ["Saturday", "Monday", "Wednesday"],
        timing: "10:00 AM - 2:00 PM",
        appointmentFee: "৳2,000",
        serialAvailable: true,
      },
    ],
    education: [
      { degree: "MBBS", institution: "Sir Salimullah Medical College", year: "2008" },
      { degree: "FCPS (Neurology)", institution: "BCPS", year: "2014" },
    ],
    awards: [],
    reviews: [
      { id: 1, name: "Abdul Karim", rating: 5, date: "2024-01-08", comment: "Best neurologist in Dhaka. Highly recommended!" },
    ],
  },
};

export default function DoctorProfile() {
  const { id } = useParams();
  const doctor = doctorsData[id || "1"];
  const [selectedChamber, setSelectedChamber] = useState(0);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Doctor Not Found</h1>
          <Button asChild variant="healthcare">
            <Link to="/doctors">Browse All Doctors</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-secondary py-12">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-6"
          >
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-primary-foreground/20"
            />
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
                  {doctor.name}
                </h1>
                {doctor.verified && (
                  <CheckCircle2 className="w-6 h-6 text-healthcare-green" />
                )}
              </div>
              <p className="text-lg text-accent mb-2">{doctor.specialty}</p>
              <p className="text-primary-foreground/80 mb-4">{doctor.qualifications.join(" • ")}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-primary-foreground/80">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                  <span className="font-semibold text-primary-foreground">{doctor.rating}</span>
                  <span>({doctor.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{doctor.experience}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{doctor.patientsServed} patients</span>
                </div>
              </div>
            </div>
            <div className="md:ml-auto flex gap-3">
              <Button variant="outline" size="icon" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="healthcare-section">
        <div className="healthcare-container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="healthcare-card"
              >
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground">{doctor.about}</p>
              </motion.div>

              {/* Chambers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="healthcare-card"
              >
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                  <MapPin className="w-5 h-5 inline mr-2 text-primary" />
                  Chamber Locations
                </h2>
                
                <div className="space-y-4">
                  {doctor.chambers.map((chamber: any, index: number) => (
                    <div
                      key={chamber.id}
                      onClick={() => setSelectedChamber(index)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedChamber === index 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            {chamber.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{chamber.address}</p>
                        </div>
                        {chamber.serialAvailable && (
                          <span className="healthcare-badge-success text-xs">Serial Available</span>
                        )}
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{chamber.days.join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{chamber.timing}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{chamber.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Fee:</span>
                          <span className="font-semibold text-foreground">{chamber.appointmentFee}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Education */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="healthcare-card"
              >
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                  <GraduationCap className="w-5 h-5 inline mr-2 text-primary" />
                  Education & Training
                </h2>
                <div className="space-y-3">
                  {doctor.education.map((edu: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="font-medium text-foreground">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="healthcare-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    <MessageCircle className="w-5 h-5 inline mr-2 text-primary" />
                    Patient Reviews
                  </h2>
                  <span className="text-sm text-muted-foreground">{doctor.totalReviews} reviews</span>
                </div>
                
                <div className="space-y-4">
                  {doctor.reviews.map((review: any) => (
                    <div key={review.id} className="p-4 rounded-xl bg-muted">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{review.name}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? "text-accent fill-accent" : "text-muted-foreground"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Booking */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="healthcare-card sticky top-24"
              >
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  Book Appointment
                </h3>
                
                {doctor.chambers[selectedChamber] && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="font-medium text-foreground mb-1">
                        {doctor.chambers[selectedChamber].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doctor.chambers[selectedChamber].days.join(", ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doctor.chambers[selectedChamber].timing}
                      </p>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-b border-border">
                      <span className="text-muted-foreground">Consultation Fee</span>
                      <span className="text-2xl font-bold text-foreground">
                        {doctor.chambers[selectedChamber].appointmentFee}
                      </span>
                    </div>

                    <Button variant="healthcare" size="lg" className="w-full">
                      Book Appointment
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>

                    <Button variant="healthcare-outline" size="lg" className="w-full">
                      <Phone className="w-5 h-5 mr-2" />
                      Call for Appointment
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Awards */}
              {doctor.awards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="healthcare-card mt-6"
                >
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    <Award className="w-5 h-5 inline mr-2 text-accent" />
                    Awards & Recognition
                  </h3>
                  <div className="space-y-2">
                    {doctor.awards.map((award: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{award}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
