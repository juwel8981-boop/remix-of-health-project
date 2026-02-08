import { motion } from "framer-motion";
import { 
  Calendar, Clock, Users, Star, ChevronRight, MapPin, 
  FileText, Plus, Edit, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
}

const todayAppointments = [
  {
    id: 1,
    patient: "Rahim Uddin",
    age: 45,
    time: "09:00 AM",
    type: "Follow-up",
    status: "confirmed",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    patient: "Fatima Begum",
    age: 32,
    time: "10:30 AM",
    type: "New Patient",
    status: "confirmed",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    patient: "Kamal Ahmed",
    age: 58,
    time: "02:00 PM",
    type: "Consultation",
    status: "pending",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
];

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

export function DoctorOverview({ doctorProfile, stats }: DoctorOverviewProps) {
  const firstName = doctorProfile?.full_name?.split(' ')[0] || "Doctor";
  const isApproved = doctorProfile?.verification_status === "approved";

  const statsData = [
    { label: "Today's Appointments", value: stats.todayAppointments.toString(), change: "+2", trend: "up" },
    { label: "Total Patients", value: stats.totalPatients.toLocaleString(), change: "+15", trend: "up" },
    { label: "Avg. Rating", value: stats.avgRating.toFixed(1), change: "0", trend: "stable" },
    { label: "Reviews", value: stats.reviewCount.toString(), change: "+8", trend: "up" },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            {isApproved 
              ? `You have ${stats.todayAppointments} appointments scheduled for today.`
              : "Complete your profile while waiting for verification."}
          </p>
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
                {stat.label.includes("Appointment") && <Calendar className="w-5 h-5 text-primary" />}
                {stat.label.includes("Patient") && <Users className="w-5 h-5 text-primary" />}
                {stat.label.includes("Rating") && <Star className="w-5 h-5 text-primary" />}
                {stat.label.includes("Review") && <TrendingUp className="w-5 h-5 text-primary" />}
              </div>
              {stat.trend !== "stable" && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === "up" 
                    ? "bg-healthcare-green-light text-healthcare-green" 
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
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
            <h2 className="font-display text-lg font-semibold text-foreground">
              Today's Appointments
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/appointments">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted"
                >
                  <img
                    src={appointment.image}
                    alt={appointment.patient}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{appointment.patient}</h3>
                    <p className="text-sm text-muted-foreground">
                      {appointment.age} years • {appointment.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{appointment.time}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === "confirmed" 
                      ? "bg-healthcare-green-light text-healthcare-green" 
                      : "bg-healthcare-orange-light text-accent"
                  }`}>
                    {appointment.status}
                  </span>
                  <Button variant="healthcare" size="sm">
                    Start
                  </Button>
                </div>
              ))}
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
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              Chamber Info
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Dhaka Medical College</p>
                  <p className="text-sm text-muted-foreground">Secretariat Road, Dhaka</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Availability</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri, 9 AM - 5 PM</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              <Edit className="w-4 h-4 mr-2" />
              Update Schedule
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
