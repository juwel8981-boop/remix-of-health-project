import { useState } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, Building2, Stethoscope, Users, FileText,
  Settings, Plus, Search, Edit, Trash2, Eye, TrendingUp,
  CheckCircle2, XCircle, Clock, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoctorManager from "@/components/admin/DoctorManager";
import HospitalManager from "@/components/admin/HospitalManager";
import DiagnosticManager from "@/components/admin/DiagnosticManager";
import DoctorChamberManager from "@/components/admin/DoctorChamberManager";

const sidebarLinks = [
  { name: "Dashboard", icon: LayoutDashboard, tab: "overview" },
  { name: "Hospitals", icon: Building2, tab: "hospitals" },
  { name: "Doctors", icon: Stethoscope, tab: "doctors" },
  { name: "Chambers", icon: MapPin, tab: "chambers" },
  { name: "Diagnostics", icon: Users, tab: "diagnostics" },
  { name: "Content", icon: FileText, tab: "content" },
  { name: "Settings", icon: Settings, tab: "settings" },
];

const stats = [
  { label: "Total Hospitals", value: "534", change: "+12", icon: Building2 },
  { label: "Registered Doctors", value: "10,234", change: "+156", icon: Stethoscope },
  { label: "Diagnostic Centers", value: "892", change: "+28", icon: Users },
  { label: "Active Users", value: "1.2M", change: "+15K", icon: TrendingUp },
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
                  <button
                    onClick={() => setActiveTab(link.tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === link.tab
                        ? "bg-primary text-primary-foreground"
                        : "text-background/70 hover:text-background hover:bg-background/10"
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Mobile Tabs */}
          <div className="lg:hidden mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {sidebarLinks.map((link) => (
                <Button
                  key={link.tab}
                  variant={activeTab === link.tab ? "healthcare" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(link.tab)}
                >
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-8">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage hospitals, doctors, and platform content.
                </p>
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

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="healthcare" className="h-auto py-6 flex-col" onClick={() => setActiveTab("doctors")}>
                  <Stethoscope className="w-8 h-8 mb-2" />
                  <span>Manage Doctors</span>
                </Button>
                <Button variant="healthcare-outline" className="h-auto py-6 flex-col" onClick={() => setActiveTab("chambers")}>
                  <MapPin className="w-8 h-8 mb-2" />
                  <span>Manage Chambers</span>
                </Button>
                <Button variant="healthcare-outline" className="h-auto py-6 flex-col" onClick={() => setActiveTab("hospitals")}>
                  <Building2 className="w-8 h-8 mb-2" />
                  <span>Manage Hospitals</span>
                </Button>
                <Button variant="healthcare-outline" className="h-auto py-6 flex-col" onClick={() => setActiveTab("diagnostics")}>
                  <Users className="w-8 h-8 mb-2" />
                  <span>Manage Diagnostics</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Doctors Tab */}
          {activeTab === "doctors" && <DoctorManager />}

          {/* Chambers Tab */}
          {activeTab === "chambers" && <DoctorChamberManager />}

          {/* Hospitals Tab */}
          {activeTab === "hospitals" && <HospitalManager />}

          {/* Diagnostics Tab */}
          {activeTab === "diagnostics" && <DiagnosticManager />}

          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Content management coming soon.</p>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Settings coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
