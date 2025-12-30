import { useState } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, Building2, Stethoscope, Users, FileText,
  Settings, Plus, Search, Edit, Trash2, Eye, TrendingUp,
  CheckCircle2, XCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const sidebarLinks = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { name: "Hospitals", icon: Building2, href: "/admin/hospitals" },
  { name: "Doctors", icon: Stethoscope, href: "/admin/doctors" },
  { name: "Diagnostics", icon: Users, href: "/admin/diagnostics" },
  { name: "Content", icon: FileText, href: "/admin/content" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
];

const stats = [
  { label: "Total Hospitals", value: "534", change: "+12", icon: Building2 },
  { label: "Registered Doctors", value: "10,234", change: "+156", icon: Stethoscope },
  { label: "Diagnostic Centers", value: "892", change: "+28", icon: Users },
  { label: "Active Users", value: "1.2M", change: "+15K", icon: TrendingUp },
];

const recentDoctors = [
  {
    id: 1,
    name: "Dr. Aminul Islam",
    specialty: "Dermatologist",
    hospital: "Labaid Hospital",
    status: "pending",
    date: "Jan 18, 2024",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Dr. Rubina Akter",
    specialty: "Gynecologist",
    hospital: "United Hospital",
    status: "approved",
    date: "Jan 17, 2024",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Dr. Kamal Hossain",
    specialty: "Orthopedic",
    hospital: "Ibn Sina Hospital",
    status: "approved",
    date: "Jan 16, 2024",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face",
  },
];

const recentHospitals = [
  {
    id: 1,
    name: "City General Hospital",
    location: "Rajshahi",
    type: "Private",
    status: "pending",
    beds: 250,
  },
  {
    id: 2,
    name: "Central Medical Center",
    location: "Chittagong",
    type: "Private",
    status: "approved",
    beds: 180,
  },
];

const pendingContent = [
  {
    id: 1,
    title: "Managing Stress in Modern Life",
    author: "Dr. Nasreen Akter",
    type: "Article",
    date: "Jan 18, 2024",
  },
  {
    id: 2,
    title: "Healthy Eating Habits for Diabetics",
    author: "Dr. Mohammad Rahman",
    type: "Article",
    date: "Jan 17, 2024",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-muted">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-foreground min-h-screen sticky top-16 md:top-20">
          <div className="p-6 border-b border-background/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-background">Admin Panel</p>
                <p className="text-sm text-background/70">System Manager</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-background/70 hover:text-background hover:bg-background/10 transition-colors"
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
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage hospitals, doctors, and platform content.
              </p>
            </motion.div>

            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-foreground placeholder:text-muted-foreground w-40"
                />
              </div>
              <Button variant="healthcare">
                <Plus className="w-4 h-4 mr-2" />
                Add New
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
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-healthcare-green">
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Doctors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="healthcare-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Recent Doctor Registrations
                </h2>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {recentDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted"
                  >
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {doctor.specialty} • {doctor.hospital}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doctor.status === "approved" 
                        ? "bg-healthcare-green-light text-healthcare-green" 
                        : "bg-healthcare-orange-light text-accent"
                    }`}>
                      {doctor.status}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Hospitals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="healthcare-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Recent Hospital Entries
                </h2>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {recentHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{hospital.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {hospital.location} • {hospital.beds} beds
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hospital.status === "approved" 
                        ? "bg-healthcare-green-light text-healthcare-green" 
                        : "bg-healthcare-orange-light text-accent"
                    }`}>
                      {hospital.status}
                    </span>
                    <div className="flex gap-1">
                      {hospital.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-healthcare-green">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-healthcare-red">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="healthcare-outline" className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Hospital
              </Button>
            </motion.div>
          </div>

          {/* Pending Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="healthcare-card mt-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Pending Content Moderation
              </h2>
              <span className="healthcare-badge-accent">
                <Clock className="w-3 h-3 mr-1" />
                {pendingContent.length} pending
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Author</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingContent.map((content) => (
                    <tr key={content.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-4">
                        <span className="font-medium text-foreground">{content.title}</span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{content.author}</td>
                      <td className="py-4 px-4">
                        <span className="healthcare-badge text-xs">{content.type}</span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{content.date}</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button variant="ghost" size="sm" className="text-healthcare-green">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="ghost" size="sm" className="text-healthcare-red">
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
