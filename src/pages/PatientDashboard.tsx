import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, FileText, Calendar, Bell, Activity, Pill, Upload, Clock,
  Heart, TrendingUp, Download, Plus, ChevronRight, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MedicalRecordsUpload } from "@/components/MedicalRecordsUpload";
const sidebarLinks = [
  { name: "Overview", icon: Activity, href: "/patient" },
  { name: "My Profile", icon: User, href: "/patient/profile" },
  { name: "Medical Records", icon: FileText, href: "/patient/records" },
  { name: "Appointments", icon: Calendar, href: "/patient/appointments" },
  { name: "Health Tracker", icon: Heart, href: "/patient/health" },
  { name: "Reminders", icon: Bell, href: "/patient/reminders" },
];

const upcomingAppointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Ahmed",
    specialty: "Cardiologist",
    date: "Jan 20, 2024",
    time: "10:00 AM",
    type: "In-Person",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    doctor: "Dr. Mohammad Rahman",
    specialty: "Neurologist",
    date: "Jan 25, 2024",
    time: "2:30 PM",
    type: "Online",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
  },
];

const recentRecords = [
  {
    id: 1,
    name: "Blood Test Report",
    date: "Jan 15, 2024",
    doctor: "Dr. Kamal Hossain",
    type: "Lab Report",
  },
  {
    id: 2,
    name: "ECG Report",
    date: "Jan 10, 2024",
    doctor: "Dr. Sarah Ahmed",
    type: "Diagnostic",
  },
  {
    id: 3,
    name: "Prescription",
    date: "Jan 08, 2024",
    doctor: "Dr. Fatima Khan",
    type: "Prescription",
  },
];

const medications = [
  { name: "Metformin", dosage: "500mg", frequency: "Twice daily", remaining: 15 },
  { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", remaining: 8 },
  { name: "Vitamin D", dosage: "1000IU", frequency: "Once daily", remaining: 25 },
];

const healthStats = [
  { label: "Blood Pressure", value: "120/80", unit: "mmHg", status: "normal", icon: Activity },
  { label: "Heart Rate", value: "72", unit: "bpm", status: "normal", icon: Heart },
  { label: "Blood Sugar", value: "95", unit: "mg/dL", status: "normal", icon: TrendingUp },
  { label: "Weight", value: "68", unit: "kg", status: "stable", icon: User },
];

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="min-h-screen bg-muted">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border min-h-screen sticky top-16 md:top-20">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                alt="Patient"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-foreground">Rahim Uddin</p>
                <p className="text-sm text-muted-foreground">Patient</p>
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
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Welcome back, Rahim!
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your health and upcoming activities.
              </p>
            </motion.div>
          </div>

          {/* Health Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {healthStats.map((stat, index) => (
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
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.status === "normal" 
                      ? "bg-healthcare-green-light text-healthcare-green" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {stat.status}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                  <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 healthcare-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Upcoming Appointments
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/patient/appointments">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted"
                  >
                    <img
                      src={appointment.image}
                      alt={appointment.doctor}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{appointment.doctor}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{appointment.date}</p>
                      <p className="text-sm text-muted-foreground">{appointment.time}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.type === "Online" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-accent/10 text-accent"
                    }`}>
                      {appointment.type}
                    </span>
                  </div>
                ))}
              </div>

              <Button variant="healthcare-outline" className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            </motion.div>

            {/* Medications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="healthcare-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  My Medications
                </h2>
                <Pill className="w-5 h-5 text-primary" />
              </div>

              <div className="space-y-4">
                {medications.map((med) => (
                  <div key={med.name} className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground">{med.name}</h4>
                      <span className="text-sm text-muted-foreground">{med.dosage}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{med.frequency}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(med.remaining / 30) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {med.remaining} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="ghost" size="sm" className="w-full mt-4">
                <Bell className="w-4 h-4 mr-2" />
                Set Reminder
              </Button>
            </motion.div>
          </div>

          {/* Medical Records */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="healthcare-card mt-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recent Medical Records
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowUploadModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/patient/records">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Document</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Doctor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map((record) => (
                    <tr key={record.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{record.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="healthcare-badge text-xs">{record.type}</span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{record.doctor}</td>
                      <td className="py-4 px-4 text-muted-foreground">{record.date}</td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* AI Doctor Finder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-primary to-secondary"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display text-xl font-semibold text-primary-foreground mb-1">
                  AI Doctor Finder
                </h3>
                <p className="text-primary-foreground/80">
                  Describe your symptoms and get intelligent recommendations for the right specialist.
                </p>
              </div>
              <Button variant="hero" size="lg" asChild>
                <Link to="/ai-doctor-finder">Try Now</Link>
              </Button>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Upload Modal */}
      <MedicalRecordsUpload isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
    </div>
  );
}
