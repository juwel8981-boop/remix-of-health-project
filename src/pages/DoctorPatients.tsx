import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Search, Calendar, Phone, Mail, MapPin, 
  Clock, FileText, User, Filter,
  Loader2, ArrowLeft, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PatientWithHistory {
  patient_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  blood_group: string | null;
  address: string | null;
  date_of_birth: string | null;
  total_visits: number;
  last_visit: string;
  first_visit: string;
  appointments: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    reason: string | null;
    status: string;
    notes: string | null;
  }[];
}

export default function DoctorPatients() {
  const [patients, setPatients] = useState<PatientWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "visits" | "name">("recent");
  const [selectedPatient, setSelectedPatient] = useState<PatientWithHistory | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get doctor's ID
      const { data: doctor } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!doctor) return;

      // Get all appointments for this doctor with patient info
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select(`
          id,
          patient_id,
          appointment_date,
          appointment_time,
          reason,
          status,
          notes
        `)
        .eq("doctor_id", doctor.id)
        .order("appointment_date", { ascending: false });

      if (error) throw error;

      // Get unique patient IDs
      const patientIds = [...new Set(appointments?.map(a => a.patient_id) || [])];

      if (patientIds.length === 0) {
        setPatients([]);
        setLoading(false);
        return;
      }

      // Fetch patient details
      const { data: patientsData, error: patientsError } = await supabase
        .from("patients")
        .select("*")
        .in("user_id", patientIds);

      if (patientsError) throw patientsError;

      // Group appointments by patient and build patient history
      const patientMap = new Map<string, PatientWithHistory>();

      patientsData?.forEach(patient => {
        const patientAppointments = appointments?.filter(a => a.patient_id === patient.user_id) || [];
        const completedVisits = patientAppointments.filter(a => a.status === "completed").length;
        
        if (patientAppointments.length > 0) {
          patientMap.set(patient.user_id, {
            patient_id: patient.user_id,
            full_name: patient.full_name,
            email: patient.email,
            phone: patient.phone,
            gender: patient.gender,
            blood_group: patient.blood_group,
            address: patient.address,
            date_of_birth: patient.date_of_birth,
            total_visits: completedVisits,
            last_visit: patientAppointments[0].appointment_date,
            first_visit: patientAppointments[patientAppointments.length - 1].appointment_date,
            appointments: patientAppointments,
          });
        }
      });

      setPatients(Array.from(patientMap.values()));
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients
    .filter(patient => 
      patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone?.includes(searchQuery)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime();
        case "visits":
          return b.total_visits - a.total_visits;
        case "name":
          return a.full_name.localeCompare(b.full_name);
        default:
          return 0;
      }
    });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return styles[status] || styles.pending;
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/doctor">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                My Patients
              </h1>
              <p className="text-muted-foreground">
                View your patient history and appointment records
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="healthcare-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{patients.length}</p>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                </div>
              </div>
            </div>
            <div className="healthcare-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {patients.reduce((sum, p) => sum + p.total_visits, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                </div>
              </div>
            </div>
            <div className="healthcare-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {patients.filter(p => {
                      const lastVisit = new Date(p.last_visit);
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return lastVisit >= thirtyDaysAgo;
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Recent (30 days)</p>
                </div>
              </div>
            </div>
            <div className="healthcare-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {patients.filter(p => p.total_visits > 1).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Returning</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="healthcare-card mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="visits">Most Visits</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="healthcare-card text-center py-12"
          >
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "No patients found" : "No patient history yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search criteria" 
                : "Patients who book appointments with you will appear here"}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.patient_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="healthcare-card hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Patient Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary">
                        {patient.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg">
                        {patient.full_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        {patient.gender && (
                          <span className="capitalize">{patient.gender}</span>
                        )}
                        {patient.date_of_birth && (
                          <span>{calculateAge(patient.date_of_birth)} years</span>
                        )}
                        {patient.blood_group && (
                          <Badge variant="outline" className="text-xs">
                            {patient.blood_group}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-col gap-1 text-sm lg:w-56">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                    {patient.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Visit Stats */}
                  <div className="flex items-center gap-6 lg:w-48">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{patient.total_visits}</p>
                      <p className="text-xs text-muted-foreground">Visits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(patient.last_visit), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">Last Visit</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowHistory(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Patient History Dialog */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {selectedPatient?.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{selectedPatient?.full_name}</p>
                  <p className="text-sm font-normal text-muted-foreground">
                    Patient History
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            {selectedPatient && (
              <div className="space-y-6 mt-4">
                {/* Patient Details */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedPatient.email}</span>
                  </div>
                  {selectedPatient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedPatient.phone}</span>
                    </div>
                  )}
                  {selectedPatient.address && (
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedPatient.address}</span>
                    </div>
                  )}
                  {selectedPatient.blood_group && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Blood Group:</span>
                      <Badge variant="outline">{selectedPatient.blood_group}</Badge>
                    </div>
                  )}
                  {selectedPatient.date_of_birth && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Age:</span>
                      <span className="text-sm">{calculateAge(selectedPatient.date_of_birth)} years</span>
                    </div>
                  )}
                </div>

                {/* Appointment History */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Appointment History ({selectedPatient.appointments.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedPatient.appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {format(new Date(apt.appointment_date), "MMM d, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {apt.appointment_time}
                              </span>
                            </div>
                          </div>
                          <Badge className={getStatusBadge(apt.status)}>
                            {apt.status}
                          </Badge>
                        </div>
                        {apt.reason && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">Reason:</span> {apt.reason}
                          </p>
                        )}
                        {apt.notes && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Notes:</span> {apt.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
