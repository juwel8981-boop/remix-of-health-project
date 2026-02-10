import { useState, useEffect } from "react";
import { AppointmentsSkeleton } from "@/components/skeletons/AppointmentsSkeleton";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ArrowLeft, Plus, Calendar, Clock, MapPin, User, Loader2, 
  CheckCircle, XCircle, AlertCircle
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  notes: string | null;
  created_at: string;
  doctor: {
    id: string;
    full_name: string;
    specialization: string;
  } | null;
  chamber: {
    id: string;
    name: string;
    address: string;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: AlertCircle },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle },
};

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        reason,
        notes,
        created_at,
        doctor:doctor_id (
          id,
          full_name,
          specialization
        ),
        chamber:chamber_id (
          id,
          name,
          address
        )
      `)
      .eq("patient_id", user.id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (data && !error) {
      setAppointments(data as unknown as Appointment[]);
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    
    setCancelling(true);
    
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", cancelId);

    if (error) {
      toast.error("Failed to cancel appointment");
    } else {
      toast.success("Appointment cancelled successfully");
      fetchAppointments();
    }

    setCancelling(false);
    setCancelId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const upcomingAppointments = appointments.filter(
    a => a.appointment_date >= today && a.status !== "cancelled"
  );
  const pastAppointments = appointments.filter(
    a => a.appointment_date < today || a.status === "cancelled"
  );

  if (loading) {
    return <AppointmentsSkeleton />;
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const status = statusConfig[appointment.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const isPast = appointment.appointment_date < today;
    const canCancel = !isPast && appointment.status === "pending";

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`hover:shadow-md transition-shadow ${isPast ? "opacity-70" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${isPast ? "bg-muted" : "bg-primary/10"} flex-shrink-0`}>
                <Calendar className={`w-6 h-6 ${isPast ? "text-muted-foreground" : "text-primary"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {appointment.doctor?.full_name || "Doctor"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {appointment.doctor?.specialization}
                    </p>
                  </div>
                  <Badge className={status.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatDate(appointment.appointment_date)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatTime(appointment.appointment_time)}
                  </div>
                  {appointment.chamber && (
                    <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{appointment.chamber.name}</span>
                    </div>
                  )}
                </div>

                {appointment.reason && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    <span className="font-medium">Reason:</span> {appointment.reason}
                  </p>
                )}

                {canCancel && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setCancelId(appointment.id)}
                    >
                      Cancel Appointment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/patient")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  My Appointments
                </h1>
                <p className="text-muted-foreground">Manage your doctor appointments</p>
              </div>
            </div>
            <Button variant="healthcare" asChild>
              <Link to="/patient/book-appointment">
                <Plus className="w-4 h-4 mr-2" />
                Book New
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Appointments</h3>
                    <p className="text-muted-foreground mb-4">
                      Book an appointment with a doctor
                    </p>
                    <Button variant="healthcare" asChild>
                      <Link to="/patient/book-appointment">
                        <Plus className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Past Appointments</h3>
                    <p className="text-muted-foreground">
                      Your completed appointments will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pastAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
