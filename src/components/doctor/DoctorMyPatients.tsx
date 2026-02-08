import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, ChevronRight, Calendar, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  blood_group: string | null;
  appointment_count: number;
  last_visit: string | null;
}

export function DoctorMyPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get the doctor's ID
    const { data: doctorData } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!doctorData) {
      setLoading(false);
      return;
    }

    // Get unique patients who have had appointments with this doctor
    const { data: appointments } = await supabase
      .from("appointments")
      .select("patient_id, appointment_date")
      .eq("doctor_id", doctorData.id)
      .order("appointment_date", { ascending: false });

    if (!appointments || appointments.length === 0) {
      setLoading(false);
      return;
    }

    // Group appointments by patient
    const patientMap = new Map<string, { count: number; lastVisit: string }>();
    appointments.forEach((apt) => {
      const existing = patientMap.get(apt.patient_id);
      if (existing) {
        existing.count++;
      } else {
        patientMap.set(apt.patient_id, { count: 1, lastVisit: apt.appointment_date });
      }
    });

    // Get patient details
    const patientIds = Array.from(patientMap.keys());
    const { data: patientsData } = await supabase
      .from("patients")
      .select("id, full_name, email, phone, gender, blood_group, user_id")
      .in("user_id", patientIds);

    if (patientsData) {
      const formattedPatients = patientsData.map((p) => {
        const stats = patientMap.get(p.user_id);
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          gender: p.gender,
          blood_group: p.blood_group,
          appointment_count: stats?.count || 0,
          last_visit: stats?.lastVisit || null,
        };
      });
      setPatients(formattedPatients);
    }
    setLoading(false);
  };

  const filteredPatients = patients.filter((p) =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            My Patients
          </h1>
          <p className="text-muted-foreground">
            View and manage your patient list
          </p>
        </motion.div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="healthcare-card text-center py-12"
        >
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Patients Found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "No patients match your search criteria." : "You haven't had any patient appointments yet."}
          </p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="healthcare-card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {patient.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{patient.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {patient.gender || "—"} • {patient.blood_group || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{patient.email}</span>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{patient.appointment_count} appointment{patient.appointment_count !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {patient.last_visit && (
                <p className="text-xs text-muted-foreground">
                  Last visit: {new Date(patient.last_visit).toLocaleDateString()}
                </p>
              )}

              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link to="/doctor/patients">
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
