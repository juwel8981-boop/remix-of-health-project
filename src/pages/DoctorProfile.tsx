import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, MapPin, Clock, Phone, Calendar,
  Building2, Award, ChevronRight, Users, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DoctorProfileActions } from "@/components/doctor/DoctorProfileActions";
import { DoctorRatingDisplay } from "@/components/doctor/DoctorRatingDisplay";
import { DoctorReviewSection } from "@/components/doctor/DoctorReviewSection";
import { DoctorProfileSkeleton } from "@/components/skeletons/DoctorProfileSkeleton";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  hospital_affiliation: string | null;
  experience_years: number | null;
  phone: string | null;
  email: string;
  verification_status: string;
  is_featured: boolean;
}

interface Chamber {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  days: string[] | null;
  timing: string | null;
  appointment_fee: string | null;
  serial_available: boolean | null;
}

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [selectedChamber, setSelectedChamber] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch doctor details
        const { data: doctorData, error: doctorError } = await supabase
          .from("doctors")
          .select("*")
          .eq("id", id)
          .eq("verification_status", "approved")
          .single();

        if (doctorError || !doctorData) {
          console.error("Doctor not found:", doctorError);
          setIsLoading(false);
          return;
        }

        setDoctor(doctorData);

        // Fetch chambers for this doctor
        const { data: chamberData, error: chamberError } = await supabase
          .from("doctor_chambers")
          .select("*")
          .eq("doctor_id", id);

        if (chamberError) {
          console.error("Error fetching chambers:", chamberError);
        } else {
          setChambers(chamberData || []);
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorData();
  }, [id]);

  const handleBookAppointment = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book an appointment.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Navigate to book appointment with doctor and chamber info
    const selectedChamberData = chambers[selectedChamber];
    navigate("/patient/book-appointment", {
      state: {
        doctorId: doctor?.id,
        doctorName: doctor?.full_name,
        chamberId: selectedChamberData?.id,
        chamberName: selectedChamberData?.name,
      },
    });
  };

  if (isLoading) {
    return <DoctorProfileSkeleton />;
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Doctor Not Found</h1>
          <p className="text-muted-foreground mb-6">The doctor you're looking for may not exist or is not yet verified.</p>
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
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-primary-foreground/20 flex items-center justify-center border-4 border-primary-foreground/20">
              <span className="text-4xl md:text-5xl font-bold text-primary-foreground">
                {doctor.full_name.charAt(0)}
              </span>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
                  {doctor.full_name}
                </h1>
                {doctor.verification_status === "approved" && (
                  <CheckCircle2 className="w-6 h-6 text-healthcare-green" />
                )}
              </div>
              <p className="text-lg text-accent mb-2">{doctor.specialization}</p>
              {doctor.hospital_affiliation && (
                <p className="text-primary-foreground/80 mb-4 flex items-center justify-center md:justify-start gap-2">
                  <Building2 className="w-4 h-4" />
                  {doctor.hospital_affiliation}
                </p>
              )}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-primary-foreground/80">
                <DoctorRatingDisplay doctorId={doctor.id} />
                {doctor.experience_years && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{doctor.experience_years} years experience</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{chambers.length} chamber{chambers.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            <div className="md:ml-auto">
              <DoctorProfileActions doctorId={doctor.id} doctorName={doctor.full_name} />
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
                <p className="text-muted-foreground">
                  {doctor.full_name} is a verified {doctor.specialization} 
                  {doctor.hospital_affiliation && ` affiliated with ${doctor.hospital_affiliation}`}
                  {doctor.experience_years && ` with ${doctor.experience_years} years of experience`}.
                </p>
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
                
                {chambers.length === 0 ? (
                  <p className="text-muted-foreground">No chamber information available yet.</p>
                ) : (
                  <div className="space-y-4">
                    {chambers.map((chamber, index) => (
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
                          {chamber.serial_available && (
                            <span className="healthcare-badge-success text-xs">Serial Available</span>
                          )}
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          {chamber.days && chamber.days.length > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{chamber.days.join(", ")}</span>
                            </div>
                          )}
                          {chamber.timing && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{chamber.timing}</span>
                            </div>
                          )}
                          {chamber.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{chamber.phone}</span>
                            </div>
                          )}
                          {chamber.appointment_fee && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Fee:</span>
                              <span className="font-semibold text-foreground">{chamber.appointment_fee}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="healthcare-card"
              >
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                  <Phone className="w-5 h-5 inline mr-2 text-primary" />
                  Contact Information
                </h2>
                <div className="space-y-3">
                  {doctor.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{doctor.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{doctor.email}</span>
                  </div>
                </div>
              </motion.div>

              {/* Reviews Section */}
              <DoctorReviewSection doctorId={doctor.id} doctorName={doctor.full_name} />
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
                
                {chambers.length > 0 && chambers[selectedChamber] ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted">
                      <p className="font-medium text-foreground mb-1">
                        {chambers[selectedChamber].name}
                      </p>
                      {chambers[selectedChamber].days && (
                        <p className="text-sm text-muted-foreground">
                          {chambers[selectedChamber].days?.join(", ")}
                        </p>
                      )}
                      {chambers[selectedChamber].timing && (
                        <p className="text-sm text-muted-foreground">
                          {chambers[selectedChamber].timing}
                        </p>
                      )}
                    </div>

                    {chambers[selectedChamber].appointment_fee && (
                      <div className="flex items-center justify-between py-4 border-t border-b border-border">
                        <span className="text-muted-foreground">Consultation Fee</span>
                        <span className="text-2xl font-bold text-foreground">
                          {chambers[selectedChamber].appointment_fee}
                        </span>
                      </div>
                    )}

                    <Button 
                      variant="healthcare" 
                      size="lg" 
                      className="w-full"
                      onClick={handleBookAppointment}
                    >
                      Book Appointment
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>

                    {chambers[selectedChamber].phone && (
                      <Button 
                        variant="healthcare-outline" 
                        size="lg" 
                        className="w-full"
                        onClick={() => window.location.href = `tel:${chambers[selectedChamber].phone}`}
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call for Appointment
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No chamber information available.</p>
                    <Button 
                      variant="healthcare" 
                      size="lg" 
                      className="w-full"
                      onClick={handleBookAppointment}
                    >
                      Book Appointment
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Featured Badge */}
              {doctor.is_featured && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="healthcare-card mt-6"
                >
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    <Award className="w-5 h-5 inline mr-2 text-accent" />
                    Featured Doctor
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This doctor is featured for their exceptional service and patient care.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
