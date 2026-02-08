import { motion } from "framer-motion";
import { 
  Calendar, Clock, Users, Star, ChevronRight, MapPin, 
  FileText, Plus, Edit, TrendingUp, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

interface DoctorOverviewProps {
  doctorProfile: {
    full_name: string;
    specialization: string;
    verification_status: string;
  } | null;
  stats: {
    todayAppointments: number;
    totalPatients: number;
    avgRating: number;
    reviewCount: number;
  };
  appointments?: Appointment[];
  chambers?: Chamber[];
  isLoading?: boolean;
  lastUpdated?: Date;
  onRefresh?: () => void;
  onManageChambers?: () => void;
}

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

const recentReviews = [
  {
    id: 1,
    patient: "Rahim Uddin",
    rating: 5,
    comment: "Excellent doctor! Very thorough and caring.",
    date: "2 days ago",
  },
  {
    id: 2,
    patient: "Nasreen Akter",
    rating: 5,
    comment: "Very professional and knowledgeable.",
    date: "5 days ago",
  },
];

export function DoctorOverview({ 
  doctorProfile, 
  stats, 
  appointments = [], 
  chambers = [],
  isLoading = false,
  lastUpdated,
  onRefresh,
  onManageChambers
}: DoctorOverviewProps) {
  const firstName = doctorProfile?.full_name?.split(' ')[0] || "Doctor";
  const isApproved = doctorProfile?.verification_status === "approved";
  const primaryChamber = chambers[0];

  const statsData = [
    { label: "Today's Appointments", value: stats.todayAppointments.toString(), icon: Calendar },
    { label: "Total Patients", value: stats.totalPatients.toLocaleString(), icon: Users },
    { label: "Avg. Rating", value: stats.avgRating.toFixed(1), icon: Star },
    { label: "Reviews", value: stats.reviewCount.toString(), icon: TrendingUp },
  ];

  return (
    <>
      {/* Header with refresh */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Welcome back, {firstName}!
            </h1>
            <p className="text-muted-foreground">
              {isApproved 
                ? `You have ${stats.todayAppointments} appointments scheduled for today.`
                : "Complete your profile while waiting for verification."}
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </p>
            )}
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="healthcare-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="w-2 h-2 rounded-full bg-healthcare-green animate-pulse" title="Live" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            )}
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 healthcare-card"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Today's Appointments
              </h2>
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-healthcare-green animate-pulse" />
                Live
              </span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/appointments">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const age = calculateAge(appointment.patient?.date_of_birth || null);
                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {appointment.patient?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {appointment.patient?.full_name || 'Unknown Patient'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {age !== null ? `${age} years • ` : ''}{appointment.reason || 'Consultation'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {formatTime(appointment.appointment_time)}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === "confirmed" 
                        ? "bg-healthcare-green-light text-healthcare-green" 
                        : appointment.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : appointment.status === "cancelled"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-healthcare-orange-light text-accent"
                    }`}>
                      {appointment.status}
                    </span>
                    <Button variant="healthcare" size="sm">
                      Start
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Chamber Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="healthcare-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Chamber Info
              </h2>
              {chambers.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  +{chambers.length - 1} more
                </span>
              )}
            </div>
            
            {primaryChamber ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{primaryChamber.name}</p>
                    <p className="text-sm text-muted-foreground">{primaryChamber.address}</p>
                  </div>
                </div>
                {primaryChamber.timing && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Timing</p>
                      <p className="text-sm text-muted-foreground">{primaryChamber.timing}</p>
                    </div>
                  </div>
                )}
                {primaryChamber.days && primaryChamber.days.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {primaryChamber.days.map((day) => (
                      <span
                        key={day}
                        className="text-xs bg-muted px-2 py-0.5 rounded"
                      >
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chambers added yet</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={onManageChambers}
            >
              <Edit className="w-4 h-4 mr-2" />
              {primaryChamber ? "Manage Chambers" : "Add Chamber"}
            </Button>
          </motion.div>

          {/* Recent Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="healthcare-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recent Reviews
              </h2>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="font-semibold text-foreground">{stats.avgRating.toFixed(1)}</span>
              </div>
            </div>

            {recentReviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">{review.patient}</p>
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-accent fill-accent" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Write Article CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-primary to-secondary"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display text-xl font-semibold text-primary-foreground mb-1">
              Share Your Knowledge
            </h3>
            <p className="text-primary-foreground/80">
              Share health tips with the community and help patients stay informed.
            </p>
          </div>
          <Button variant="hero" size="lg" asChild>
            <Link to="/health-feed">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Link>
          </Button>
        </div>
      </motion.div>
    </>
  );
}
