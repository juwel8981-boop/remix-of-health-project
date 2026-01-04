import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, MapPin, Loader2, Search, Check } from "lucide-react";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  experience_years: number | null;
  hospital_affiliation: string | null;
}

interface Chamber {
  id: string;
  name: string;
  address: string;
  days: string[];
  timing: string | null;
  appointment_fee: string | null;
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get("doctor");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedChamber, setSelectedChamber] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (preselectedDoctorId) {
      setSelectedDoctor(preselectedDoctorId);
    }
  }, [preselectedDoctorId]);

  useEffect(() => {
    if (selectedDoctor) {
      fetchChambers(selectedDoctor);
    } else {
      setChambers([]);
      setSelectedChamber("");
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select("id, full_name, specialization, experience_years, hospital_affiliation")
      .eq("verification_status", "approved")
      .eq("is_active", true)
      .order("full_name");

    if (data && !error) {
      setDoctors(data);
    }
    setLoading(false);
  };

  const fetchChambers = async (doctorId: string) => {
    const { data, error } = await supabase
      .from("doctor_chambers")
      .select("id, name, address, days, timing, appointment_fee")
      .eq("doctor_id", doctorId);

    if (data && !error) {
      setChambers(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to book an appointment");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      patient_id: user.id,
      doctor_id: selectedDoctor,
      chamber_id: selectedChamber || null,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      reason: reason || null,
      status: "pending"
    });

    if (error) {
      console.error("Appointment error:", error);
      toast.error("Failed to book appointment. Please try again.");
    } else {
      setSuccess(true);
      toast.success("Appointment booked successfully!");
      setTimeout(() => navigate("/patient"), 2000);
    }

    setSubmitting(false);
  };

  const filteredDoctors = doctors.filter(d => 
    d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-healthcare-green-light flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-healthcare-green" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Appointment Booked!</h2>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Book Appointment</h1>
              <p className="text-muted-foreground">Schedule a visit with your preferred doctor</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Doctor Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Select Doctor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search doctors by name or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredDoctors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No doctors found</p>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        type="button"
                        onClick={() => setSelectedDoctor(doctor.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          selectedDoctor === doctor.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {doctor.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{doctor.full_name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {doctor.specialization}
                            {doctor.experience_years && ` • ${doctor.experience_years} years exp.`}
                          </p>
                        </div>
                        {selectedDoctor === doctor.id && (
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chamber Selection */}
            {selectedDoctor && chambers.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Select Chamber (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {chambers.map((chamber) => (
                      <button
                        key={chamber.id}
                        type="button"
                        onClick={() => setSelectedChamber(chamber.id === selectedChamber ? "" : chamber.id)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          selectedChamber === chamber.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{chamber.name}</p>
                          <p className="text-sm text-muted-foreground">{chamber.address}</p>
                          {chamber.timing && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {chamber.days?.join(", ")} • {chamber.timing}
                            </p>
                          )}
                          {chamber.appointment_fee && (
                            <p className="text-sm font-medium text-primary mt-1">
                              Fee: ৳{chamber.appointment_fee}
                            </p>
                          )}
                        </div>
                        {selectedChamber === chamber.id && (
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Date & Time */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Select Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Appointment Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Preferred Time *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reason */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Reason for Visit</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Briefly describe the reason for your visit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="healthcare" 
                className="flex-1"
                disabled={!selectedDoctor || !appointmentDate || !appointmentTime || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Appointment"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
