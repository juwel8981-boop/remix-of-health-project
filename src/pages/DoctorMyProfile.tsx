import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, MapPin, Clock, Phone, Calendar,
  Building2, Edit, Users, ArrowLeft, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DoctorData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  specialization: string;
  hospital_affiliation: string | null;
  experience_years: number | null;
  registration_number: string;
  verification_status: string;
  is_active: boolean;
}

interface Chamber {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  days: string[];
  timing: string | null;
  appointment_fee: string | null;
  serial_available: boolean;
}

export default function DoctorMyProfile() {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChamber, setSelectedChamber] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/login");
          return;
        }

        // Fetch doctor profile
        const { data: doctorData, error: doctorError } = await supabase
          .from("doctors")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (doctorError) throw doctorError;

        if (!doctorData) {
          toast({
            title: "Profile Not Found",
            description: "Doctor profile not found for this user.",
            variant: "destructive",
          });
          navigate("/doctor");
          return;
        }

        setDoctor(doctorData);

        // Fetch doctor chambers
        const { data: chamberData, error: chamberError } = await supabase
          .from("doctor_chambers")
          .select("*")
          .or(`doctor_id.eq.${doctorData.id},doctor_id.eq.${user.id}`);

        if (chamberError) throw chamberError;
        setChambers(chamberData || []);

      } catch (error: any) {
        console.error("Error fetching doctor data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Profile Not Found</h1>
          <Button asChild variant="healthcare">
            <Link to="/doctor">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getVerificationBadge = () => {
    switch (doctor.verification_status) {
      case "approved":
        return <span className="healthcare-badge-success">Verified</span>;
      case "pending":
        return <span className="bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm">Pending Verification</span>;
      case "rejected":
        return <span className="bg-destructive/20 text-destructive px-3 py-1 rounded-full text-sm">Verification Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-secondary py-12">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4"
              onClick={() => navigate("/doctor")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-primary-foreground/20 flex items-center justify-center border-4 border-primary-foreground/20">
                <span className="text-4xl font-bold text-primary-foreground">
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
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  {getVerificationBadge()}
                  {doctor.is_active ? (
                    <span className="healthcare-badge-success">Active</span>
                  ) : (
                    <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">Inactive</span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-primary-foreground/80">
                  {doctor.experience_years && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{doctor.experience_years} years experience</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Reg: {doctor.registration_number}</span>
                  </div>
                </div>
              </div>
              <div className="md:ml-auto">
                <Button 
                  variant="outline" 
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => navigate("/settings")}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
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
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="healthcare-card"
              >
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Contact Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{doctor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{doctor.phone || "Not provided"}</p>
                  </div>
                  {doctor.hospital_affiliation && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Hospital Affiliation</p>
                      <p className="font-medium text-foreground">{doctor.hospital_affiliation}</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Chambers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="healthcare-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    <MapPin className="w-5 h-5 inline mr-2 text-primary" />
                    My Chambers
                  </h2>
                  <span className="text-sm text-muted-foreground">{chambers.length} location(s)</span>
                </div>
                
                {chambers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No chambers added yet.</p>
                    <p className="text-sm">Contact admin to add your chamber locations.</p>
                  </div>
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
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="healthcare-card sticky top-24"
              >
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <Button asChild variant="healthcare" className="w-full">
                    <Link to="/doctor">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Appointments
                    </Link>
                  </Button>
                  
                  <Button asChild variant="healthcare-outline" className="w-full">
                    <Link to="/settings">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile Settings
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
