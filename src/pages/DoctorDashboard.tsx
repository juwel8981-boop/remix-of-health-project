import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, Calendar, FileText, Settings, Clock, Users,
  Star, MapPin, CheckCircle2, Edit, Plus, ChevronRight,
  TrendingUp, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const sidebarLinks = [
  { name: "Overview", icon: TrendingUp, href: "/doctor" },
  { name: "My Profile", icon: User, href: "/doctor/profile" },
  { name: "Appointments", icon: Calendar, href: "/doctor/appointments" },
  { name: "My Patients", icon: Users, href: "/doctor/patients" },
  { name: "Articles", icon: FileText, href: "/doctor/articles" },
  { name: "Settings", icon: Settings, href: "/doctor/settings" },
];

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

const stats = [
  { label: "Today's Appointments", value: "8", change: "+2", trend: "up" },
  { label: "Total Patients", value: "1,234", change: "+15", trend: "up" },
  { label: "Avg. Rating", value: "4.9", change: "0", trend: "stable" },
  { label: "Reviews", value: "324", change: "+8", trend: "up" },
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

export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-muted">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border min-h-screen sticky top-16 md:top-20">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
                alt="Doctor"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-foreground">Dr. Sarah Ahmed</p>
                  <CheckCircle2 className="w-4 h-4 text-healthcare-green" />
                </div>
                <p className="text-sm text-muted-foreground">Cardiologist</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                Good Morning, Dr. Ahmed!
              </h1>
              <p className="text-muted-foreground">
                You have 8 appointments scheduled for today.
              </p>
            </motion.div>

            <div className="flex gap-3">
              <Button variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="healthcare">
                <Edit className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="healthcare-card"
              >
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  {stat.trend !== "stable" && (
                    <span className={`text-xs font-medium ${
                      stat.trend === "up" ? "text-healthcare-green" : "text-healthcare-red"
                    }`}>
                      {stat.change}
                    </span>
                  )}
                </div>
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
            </motion.div>

            {/* Quick Actions & Reviews */}
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
                    <span className="font-semibold text-foreground">4.9</span>
                  </div>
                </div>

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
                  Write health articles and help patients stay informed about their health.
                </p>
              </div>
              <Button variant="hero" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Write Article
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
