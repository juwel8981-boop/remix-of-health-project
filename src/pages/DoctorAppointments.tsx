import { useState, useEffect } from "react";
import { AppointmentsSkeleton } from "@/components/skeletons/AppointmentsSkeleton";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isToday, isTomorrow, isPast, isFuture, startOfDay } from "date-fns";

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
}

interface Chamber {
  id: string;
  name: string;
  address: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  chamber_id: string | null;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  patient?: Patient;
  chamber?: Chamber;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", icon: AlertCircle },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  no_show: { label: "No Show", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: XCircle },
};

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [_doctorId, setDoctorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view appointments",
          variant: "destructive",
        });
        return;
      }

      // Get doctor ID
      const { data: doctorData, error: doctorError } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (doctorError || !doctorData) {
        console.error("Error fetching doctor:", doctorError);
        setLoading(false);
        return;
      }

      setDoctorId(doctorData.id);

      // Fetch appointments with patient and chamber info
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", doctorData.id)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Fetch patient details for each appointment
      const appointmentsWithDetails = await Promise.all(
        (appointmentsData || []).map(async (appointment) => {
          // Fetch patient info
          const { data: patientData } = await supabase
            .from("patients")
            .select("id, full_name, email, phone, date_of_birth, gender, blood_group")
            .eq("user_id", appointment.patient_id)
            .maybeSingle();

          // Fetch chamber info if available
          let chamberData = null;
          if (appointment.chamber_id) {
            const { data } = await supabase
              .from("doctor_chambers")
              .select("id, name, address")
              .eq("id", appointment.chamber_id)
              .maybeSingle();
            chamberData = data;
          }

          return {
            ...appointment,
            patient: patientData || undefined,
            chamber: chamberData || undefined,
          };
        })
      );

      setAppointments(appointmentsWithDetails);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus, notes: notes || null })
        .eq("id", appointmentId);

      if (error) throw error;

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus, notes: notes || apt.notes } : apt
        )
      );

      toast({
        title: "Success",
        description: `Appointment ${newStatus === "confirmed" ? "confirmed" : newStatus === "completed" ? "marked as completed" : "updated"}`,
      });

      setDetailsOpen(false);
      setNotes("");
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentToCancel);

      if (error) throw error;

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentToCancel ? { ...apt, status: "cancelled" } : apt
        )
      );

      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been cancelled",
      });

      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d, yyyy");
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = parseISO(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      !searchQuery ||
      apt.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;

    const matchesDate =
      !selectedDate ||
      format(parseISO(apt.appointment_date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Separate appointments by timing
  const todayAppointments = filteredAppointments.filter(
    (apt) => isToday(parseISO(apt.appointment_date)) && apt.status !== "cancelled"
  );
  const upcomingAppointments = filteredAppointments.filter(
    (apt) =>
      isFuture(startOfDay(parseISO(apt.appointment_date))) &&
      !isToday(parseISO(apt.appointment_date)) &&
      apt.status !== "cancelled"
  );
  const pastAppointments = filteredAppointments.filter(
    (apt) =>
      isPast(startOfDay(parseISO(apt.appointment_date))) &&
      !isToday(parseISO(apt.appointment_date))
  );
  const cancelledAppointments = filteredAppointments.filter((apt) => apt.status === "cancelled");

  // Get dates with appointments for calendar
  const appointmentDates = appointments.map((apt) => parseISO(apt.appointment_date));

  if (loading) {
    return <AppointmentsSkeleton />;
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const status = statusConfig[appointment.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const patientAge = calculateAge(appointment.patient?.date_of_birth || null);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Patient Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {appointment.patient?.full_name || "Unknown Patient"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {patientAge ? `${patientAge} years` : "Age N/A"}
                {appointment.patient?.gender && ` • ${appointment.patient.gender}`}
                {appointment.patient?.blood_group && ` • ${appointment.patient.blood_group}`}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(appointment.appointment_date)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-foreground">
                {formatTime(appointment.appointment_time)}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <Badge className={`${status.color} gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAppointment(appointment);
                setNotes(appointment.notes || "");
                setDetailsOpen(true);
              }}
            >
              Details
            </Button>
            {(appointment.status === "pending" || appointment.status === "confirmed") && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setAppointmentToCancel(appointment.id);
                  setCancelDialogOpen(true);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Reason */}
        {appointment.reason && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Reason:</span> {appointment.reason}
            </p>
          </div>
        )}

        {/* Chamber Info */}
        {appointment.chamber && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{appointment.chamber.name}</span>
          </div>
        )}
      </motion.div>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/doctor">
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              </Button>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Appointments
              </h1>
            </div>
            <p className="text-muted-foreground ml-12">
              Manage your patient appointments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              {todayAppointments.length} Today
            </Badge>
            <Badge variant="outline" className="text-sm">
              {upcomingAppointments.length} Upcoming
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Calendar & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Calendar</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasAppointment: appointmentDates,
                  }}
                  modifiersStyles={{
                    hasAppointment: {
                      fontWeight: "bold",
                      textDecoration: "underline",
                    },
                  }}
                  className="rounded-md"
                />
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    Clear Date Filter
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Search Patient
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-semibold">{appointments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-semibold text-accent">
                    {appointments.filter((a) => a.status === "pending").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confirmed</span>
                  <span className="font-semibold text-primary">
                    {appointments.filter((a) => a.status === "confirmed").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-semibold text-healthcare-green">
                    {appointments.filter((a) => a.status === "completed").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Appointment Tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="today" className="flex items-center gap-2">
                  Today
                  {todayAppointments.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {todayAppointments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming
                  {upcomingAppointments.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {upcomingAppointments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-4">
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                ) : (
                  <EmptyState message="No appointments scheduled for today" />
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                ) : (
                  <EmptyState message="No upcoming appointments" />
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastAppointments.length > 0 ? (
                  pastAppointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                ) : (
                  <EmptyState message="No past appointments" />
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-4">
                {cancelledAppointments.length > 0 ? (
                  cancelledAppointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                ) : (
                  <EmptyState message="No cancelled appointments" />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View and manage this appointment
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Patient Information
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedAppointment.patient?.full_name || "Unknown Patient"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {calculateAge(selectedAppointment.patient?.date_of_birth || null)
                        ? `${calculateAge(selectedAppointment.patient?.date_of_birth || null)} years`
                        : "Age N/A"}
                      {selectedAppointment.patient?.gender &&
                        ` • ${selectedAppointment.patient.gender}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedAppointment.patient?.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{selectedAppointment.patient.email}</span>
                    </div>
                  )}
                  {selectedAppointment.patient?.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{selectedAppointment.patient.phone}</span>
                    </div>
                  )}
                  {selectedAppointment.patient?.blood_group && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">Blood:</span>
                      <Badge variant="outline">{selectedAppointment.patient.blood_group}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Appointment Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(selectedAppointment.appointment_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{formatTime(selectedAppointment.appointment_time)}</span>
                  </div>
                </div>

                {selectedAppointment.chamber && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {selectedAppointment.chamber.name} - {selectedAppointment.chamber.address}
                    </span>
                  </div>
                )}

                {selectedAppointment.reason && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Reason: </span>
                      {selectedAppointment.reason}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge
                    className={
                      statusConfig[selectedAppointment.status]?.color ||
                      statusConfig.pending.color
                    }
                  >
                    {statusConfig[selectedAppointment.status]?.label || "Pending"}
                  </Badge>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Doctor's Notes</label>
                <Textarea
                  placeholder="Add notes about this appointment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <DialogFooter className="gap-2">
                {selectedAppointment.status === "pending" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateAppointmentStatus(selectedAppointment.id, "confirmed")
                    }
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Confirm
                  </Button>
                )}
                {(selectedAppointment.status === "pending" ||
                  selectedAppointment.status === "confirmed") && (
                  <Button
                    variant="healthcare"
                    onClick={() =>
                      updateAppointmentStatus(selectedAppointment.id, "completed")
                    }
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Mark Complete
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setDetailsOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? The patient will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingStatus}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              disabled={updatingStatus}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updatingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
