import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, Building2, Stethoscope, Users, FileText,
  Settings, LogOut, MessageSquare, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DoctorManager from "@/components/admin/DoctorManager";
import HospitalManager from "@/components/admin/HospitalManager";
import DiagnosticManager from "@/components/admin/DiagnosticManager";

import ContentManager from "@/components/admin/ContentManager";
import CommentsManager from "@/components/admin/CommentsManager";
import FeaturedDoctorsManager from "@/components/admin/FeaturedDoctorsManager";
import SettingsManager from "@/components/admin/SettingsManager";
import ActivityFeed from "@/components/admin/ActivityFeed";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

const sidebarLinks = [
  { name: "Dashboard", icon: LayoutDashboard, tab: "overview" },
  { name: "Doctor Management", icon: Stethoscope, tab: "doctors" },
  { name: "Featured Doctors", icon: Star, tab: "featured" },
  { name: "Hospitals", icon: Building2, tab: "hospitals" },
  { name: "Diagnostics", icon: Users, tab: "diagnostics" },
  { name: "Content", icon: FileText, tab: "content" },
  { name: "Comments", icon: MessageSquare, tab: "comments" },
  { name: "Settings", icon: Settings, tab: "settings" },
];

interface DashboardStats {
  totalDoctors: number;
  approvedDoctors: number;
  pendingDoctors: number;
  totalPatients: number;
  totalPosts: number;
  approvedPosts: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    approvedDoctors: 0,
    pendingDoctors: 0,
    totalPatients: 0,
    totalPosts: 0,
    approvedPosts: 0,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch doctors count
        const { count: totalDoctors } = await supabase
          .from("doctors")
          .select("*", { count: "exact", head: true });

        const { count: approvedDoctors } = await supabase
          .from("doctors")
          .select("*", { count: "exact", head: true })
          .eq("verification_status", "approved");

        const { count: pendingDoctors } = await supabase
          .from("doctors")
          .select("*", { count: "exact", head: true })
          .eq("verification_status", "pending");

        // Fetch patients count
        const { count: totalPatients } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true });

        // Fetch posts count
        const { count: totalPosts } = await supabase
          .from("health_posts")
          .select("*", { count: "exact", head: true });

        const { count: approvedPosts } = await supabase
          .from("health_posts")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved");

        setStats({
          totalDoctors: totalDoctors || 0,
          approvedDoctors: approvedDoctors || 0,
          pendingDoctors: pendingDoctors || 0,
          totalPatients: totalPatients || 0,
          totalPosts: totalPosts || 0,
          approvedPosts: approvedPosts || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);


  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please sign in to access the admin dashboard</h2>
          <Button variant="healthcare" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

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
                <p className="text-sm text-background/70 truncate max-w-[140px]">{user.email}</p>
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

          <div className="p-4 border-t border-background/10">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-background/70 hover:text-background hover:bg-background/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
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

          {/* Quick Stats Summary Row - always visible */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button onClick={() => setActiveTab("doctors")} className="flex items-center gap-3 bg-background rounded-xl px-4 py-3 border border-border hover:border-primary/40 transition-colors cursor-pointer text-left">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground leading-none">{stats.totalDoctors}</p>
                <p className="text-xs text-muted-foreground">Doctors</p>
              </div>
            </button>
            <button onClick={() => setActiveTab("overview")} className="flex items-center gap-3 bg-background rounded-xl px-4 py-3 border border-border hover:border-secondary/40 transition-colors cursor-pointer text-left">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground leading-none">{stats.totalPatients}</p>
                <p className="text-xs text-muted-foreground">Patients</p>
              </div>
            </button>
            <button onClick={() => setActiveTab("doctors")} className="flex items-center gap-3 bg-background rounded-xl px-4 py-3 border border-amber-300/50 hover:border-amber-400 transition-colors cursor-pointer text-left">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground leading-none">{stats.pendingDoctors}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </button>
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
                  Welcome back! Manage hospitals, doctors, and platform content.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="healthcare-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-healthcare-green">
                      {stats.approvedDoctors} approved
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalDoctors}</p>
                  <p className="text-sm text-muted-foreground">Total Doctors</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="healthcare-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="text-xs font-medium text-amber-500">
                      needs review
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingDoctors}</p>
                  <p className="text-sm text-muted-foreground">Pending Doctors</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="healthcare-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-xs font-medium text-healthcare-green">
                      active
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalPatients}</p>
                  <p className="text-sm text-muted-foreground">Registered Patients</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="healthcare-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-xs font-medium text-healthcare-green">
                      {stats.approvedPosts} published
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalPosts}</p>
                  <p className="text-sm text-muted-foreground">Health Posts</p>
                </motion.div>
              </div>

              {/* Activity Feed & Quick Actions */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Activity Feed */}
                <ActivityFeed />

                {/* Quick Actions */}
                <div className="healthcare-card">
                  <h3 className="font-display font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="healthcare" className="h-auto py-4 flex-col" onClick={() => setActiveTab("doctors")}>
                      <Stethoscope className="w-6 h-6 mb-2" />
                      <span className="text-sm">Doctor Management</span>
                    </Button>
                    <Button variant="healthcare-outline" className="h-auto py-4 flex-col" onClick={() => setActiveTab("hospitals")}>
                      <Building2 className="w-6 h-6 mb-2" />
                      <span className="text-sm">Manage Hospitals</span>
                    </Button>
                    <Button variant="healthcare-outline" className="h-auto py-4 flex-col" onClick={() => setActiveTab("featured")}>
                      <Star className="w-6 h-6 mb-2" />
                      <span className="text-sm">Featured Doctors</span>
                    </Button>
                    <Button variant="healthcare-outline" className="h-auto py-4 flex-col" onClick={() => setActiveTab("content")}>
                      <FileText className="w-6 h-6 mb-2" />
                      <span className="text-sm">Moderate Content</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Doctors Tab */}
          {activeTab === "doctors" && <DoctorManager />}

          {/* Hospitals Tab */}
          {activeTab === "hospitals" && <HospitalManager />}

          {/* Diagnostics Tab */}
          {activeTab === "diagnostics" && <DiagnosticManager />}

          {/* Content Tab */}
          {activeTab === "content" && <ContentManager />}

          {/* Comments Tab */}
          {activeTab === "comments" && <CommentsManager />}

          {/* Featured Doctors Tab */}
          {activeTab === "featured" && <FeaturedDoctorsManager />}

          {/* Settings Tab */}
          {activeTab === "settings" && <SettingsManager />}
        </main>
      </div>
    </div>
  );
}
