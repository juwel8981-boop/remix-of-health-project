import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Calendar, FileText, Settings, Users,
  TrendingUp, CheckCircle2, Newspaper, Loader2, MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DoctorVerificationBanner } from "@/components/doctor/DoctorVerificationBanner";
import { DoctorOverview } from "@/components/doctor/DoctorOverview";
import { DoctorMyPatients } from "@/components/doctor/DoctorMyPatients";
import { DoctorMyArticles } from "@/components/doctor/DoctorMyArticles";
import { DoctorChamberManager } from "@/components/doctor/DoctorChamberManager";
import { useDoctorRealtime } from "@/hooks/use-doctor-realtime";

type TabType = "overview" | "my-patients" | "my-articles" | "my-chambers";

const sidebarLinks: { name: string; icon: typeof TrendingUp; tab: TabType | null; href?: string }[] = [
  { name: "Overview", icon: TrendingUp, tab: "overview" },
  { name: "My Profile", icon: User, tab: null, href: "/doctor/profile" },
  { name: "Appointments", icon: Calendar, tab: null, href: "/doctor/appointments" },
  { name: "My Patients", icon: Users, tab: "my-patients" },
  { name: "My Chambers", icon: MapPin, tab: "my-chambers" },
  { name: "My Articles", icon: Newspaper, tab: "my-articles" },
  { name: "Medical Community", icon: FileText, tab: null, href: "/health-feed" },
  { name: "Settings", icon: Settings, tab: null, href: "/settings" },
];

interface DoctorProfile {
  id: string;
  full_name: string;
  specialization: string;
  verification_status: string;
  rejection_reason: string | null;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Use realtime hook for live data
  const { 
    stats, 
    todayAppointments, 
    chambers,
    isLoading: realtimeLoading, 
    lastUpdated, 
    refresh 
  } = useDoctorRealtime({ 
    doctorId: doctorProfile?.id || null 
  });

  const handleManageChambers = () => {
    setActiveTab("my-chambers");
  };

  useEffect(() => {
    const fetchDoctorData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch doctor profile
      const { data: doctorData } = await supabase
        .from("doctors")
        .select("id, full_name, specialization, verification_status, rejection_reason")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (doctorData) {
        setDoctorProfile(doctorData);
      }

      // Fetch avatar
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      
      if (profile?.avatar_url) {
        const url = profile.avatar_url.includes('?') 
          ? profile.avatar_url 
          : `${profile.avatar_url}?t=${Date.now()}`;
        setAvatarUrl(url);
      }

      setLoading(false);
    };

    fetchDoctorData();
  }, []);

  const handleSidebarClick = (link: typeof sidebarLinks[0]) => {
    if (link.href) {
      navigate(link.href);
    } else if (link.tab) {
      setActiveTab(link.tab);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "my-patients":
        return <DoctorMyPatients />;
      case "my-articles":
        return <DoctorMyArticles />;
      case "my-chambers":
        return <DoctorChamberManager />;
      default:
        return (
          <DoctorOverview 
            doctorProfile={doctorProfile} 
            stats={stats}
            appointments={todayAppointments}
            chambers={chambers}
            isLoading={realtimeLoading}
            lastUpdated={lastUpdated}
            onRefresh={refresh}
            onManageChambers={handleManageChambers}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border min-h-screen sticky top-16 md:top-20">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={avatarUrl || undefined} alt="Doctor" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {doctorProfile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'D'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-foreground">
                    {doctorProfile?.full_name || "Doctor"}
                  </p>
                  {doctorProfile?.verification_status === "approved" && (
                    <CheckCircle2 className="w-4 h-4 text-healthcare-green" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {doctorProfile?.specialization || "Specialist"}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleSidebarClick(link)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      link.tab && activeTab === link.tab
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
          {/* Verification Status Banner */}
          {doctorProfile && (
            <DoctorVerificationBanner
              verificationStatus={doctorProfile.verification_status}
              rejectionReason={doctorProfile.rejection_reason}
            />
          )}

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
