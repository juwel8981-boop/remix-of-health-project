import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DoctorStats {
  todayAppointments: number;
  totalPatients: number;
  avgRating: number;
  reviewCount: number;
}

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  patient?: {
    full_name: string;
    date_of_birth: string | null;
  };
}

interface Chamber {
  id: string;
  name: string;
  address: string;
  timing: string | null;
  days: string[] | null;
}

interface UseDoctorRealtimeOptions {
  doctorId: string | null;
  onNewAppointment?: (appointment: Appointment) => void;
  onAppointmentUpdate?: (appointment: Appointment) => void;
}

export function useDoctorRealtime({ doctorId, onNewAppointment, onAppointmentUpdate }: UseDoctorRealtimeOptions) {
  const [stats, setStats] = useState<DoctorStats>({
    todayAppointments: 0,
    totalPatients: 0,
    avgRating: 0,
    reviewCount: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = useCallback(async () => {
    if (!doctorId) return;

    const today = new Date().toISOString().split('T')[0];

    // Fetch today's appointments count
    const { count: todayCount } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", doctorId)
      .eq("appointment_date", today);

    // Fetch total unique patients
    const { data: patientData } = await supabase
      .from("appointments")
      .select("patient_id")
      .eq("doctor_id", doctorId);

    const uniquePatients = new Set(patientData?.map(p => p.patient_id)).size;

    // Fetch reviews count
    const { count: reviewCount } = await supabase
      .from("doctor_reviews")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", doctorId)
      .eq("status", "approved");

    // Fetch average rating
    const { data: ratingData } = await supabase
      .rpc("get_doctor_average_rating", { doctor_uuid: doctorId });

    setStats({
      todayAppointments: todayCount || 0,
      totalPatients: uniquePatients,
      avgRating: ratingData || 0,
      reviewCount: reviewCount || 0,
    });

    setLastUpdated(new Date());
  }, [doctorId]);

  const fetchTodayAppointments = useCallback(async () => {
    if (!doctorId) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        patient_id,
        appointment_date,
        appointment_time,
        status,
        reason
      `)
      .eq("doctor_id", doctorId)
      .eq("appointment_date", today)
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      return;
    }

    // Fetch patient details separately
    if (data && data.length > 0) {
      const patientIds = [...new Set(data.map(a => a.patient_id))];
      const { data: patients } = await supabase
        .from("patients")
        .select("user_id, full_name, date_of_birth")
        .in("user_id", patientIds);

      const patientMap = new Map(patients?.map(p => [p.user_id, p]));

      const appointmentsWithPatients = data.map(apt => ({
        ...apt,
        patient: patientMap.get(apt.patient_id) || undefined
      }));

      setTodayAppointments(appointmentsWithPatients);
    } else {
      setTodayAppointments([]);
    }

    setIsLoading(false);
  }, [doctorId]);

  const fetchChambers = useCallback(async () => {
    if (!doctorId) return;

    const { data, error } = await supabase
      .from("doctor_chambers")
      .select("id, name, address, timing, days")
      .eq("doctor_id", doctorId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching chambers:", error);
      return;
    }

    setChambers(data || []);
  }, [doctorId]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchTodayAppointments(), fetchChambers()]);
    setIsLoading(false);
  }, [fetchStats, fetchTodayAppointments, fetchChambers]);

  // Initial fetch
  useEffect(() => {
    if (doctorId) {
      refresh();
    }
  }, [doctorId, refresh]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!doctorId) return;

    // Subscribe to appointments changes
    const appointmentsChannel = supabase
      .channel(`doctor-appointments-${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${doctorId}`
        },
        async (payload) => {
          console.log('Appointment change:', payload);
          
          if (payload.eventType === 'INSERT') {
            toast.info("New appointment booked!", {
              description: "A patient has booked a new appointment.",
            });
            onNewAppointment?.(payload.new as Appointment);
          } else if (payload.eventType === 'UPDATE') {
            toast.info("Appointment updated", {
              description: "An appointment status has been updated.",
            });
            onAppointmentUpdate?.(payload.new as Appointment);
          }
          
          // Refresh data
          await refresh();
        }
      )
      .subscribe();

    // Subscribe to reviews changes
    const reviewsChannel = supabase
      .channel(`doctor-reviews-${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctor_reviews',
          filter: `doctor_id=eq.${doctorId}`
        },
        async (payload) => {
          console.log('Review change:', payload);
          
          if (payload.eventType === 'INSERT') {
            toast.success("New review received!", {
              description: "A patient has left you a review.",
            });
          }
          
          // Refresh stats
          await fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(reviewsChannel);
    };
  }, [doctorId, refresh, fetchStats, onNewAppointment, onAppointmentUpdate]);

  // Auto-refresh every 30 seconds as fallback
  useEffect(() => {
    if (!doctorId) return;

    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [doctorId, refresh]);

  return {
    stats,
    todayAppointments,
    chambers,
    isLoading,
    lastUpdated,
    refresh,
  };
}
