import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, ChevronDown, User, Stethoscope, Shield, LogOut, Settings, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const navLinks = [
  { name: "Find Doctors", href: "/doctors" },
  { name: "Healthcare Facilities", href: "/hospitals" },
  { name: "Verify Personnel", href: "/verify-doctor" },
  { name: "Medical Community", href: "/health-feed" },
];

type UserRole = "patient" | "doctor" | "admin" | null;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
          fetchUserRole(session.user.id);
        } else {
          setAvatarUrl(null);
          setUserName(null);
          setUserRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("id", userId)
      .maybeSingle();
    
    if (profile) {
      setAvatarUrl(profile.avatar_url);
      setUserName(profile.full_name);
    }
  };

  const fetchUserRole = async (userId: string) => {
    // Check if user is admin
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    if (adminRole) {
      setUserRole("admin");
      return;
    }

    // Check if user is a doctor
    const { data: doctorData } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (doctorData) {
      setUserRole("doctor");
      return;
    }

    // Check if user is a patient
    const { data: patientData } = await supabase
      .from("patients")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (patientData) {
      setUserRole("patient");
      return;
    }

    setUserRole(null);
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case "admin":
        return { name: "Admin Panel", href: "/admin", icon: Shield };
      case "doctor":
        return { name: "Doctor Dashboard", href: "/doctor", icon: Stethoscope };
      case "patient":
        return { name: "Patient Dashboard", href: "/patient", icon: User };
      default:
        return null;
    }
  };

  const getInitials = () => {
    if (userName) {
      return userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out");
    } else {
      toast.success("Logged out successfully");
      setShowUserMenu(false);
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="healthcare-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-healthcare group-hover:shadow-healthcare-lg transition-shadow">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Medi<span className="text-primary">Care</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.name}
              </Link>
            ))}

            {/* Dashboard Link - Only show when logged in and has role */}
            {user && userRole && getDashboardLink() && (
              <Link
                to={getDashboardLink()!.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(getDashboardLink()!.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {(() => {
                  const link = getDashboardLink()!;
                  return <link.icon className="w-4 h-4" />;
                })()}
                {getDashboardLink()!.name}
              </Link>
            )}
          </div>

          {/* CTA Buttons - Always visible on desktop */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate">{userName || user.email?.split('@')[0]}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showUserMenu && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-card rounded-xl border border-border shadow-healthcare-lg overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="accent" size="sm" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Dashboard Link - Only show when logged in and has role */}
                {user && userRole && getDashboardLink() && (
                  <div className="pt-2 border-t border-border">
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Dashboard
                    </p>
                    {(() => {
                      const link = getDashboardLink()!;
                      return (
                        <Link
                          to={link.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <link.icon className="w-4 h-4" />
                          {link.name}
                        </Link>
                      );
                    })()}
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </Button>
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {userName && <p className="text-sm font-medium text-foreground truncate">{userName}</p>}
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/settings" onClick={() => setIsOpen(false)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Profile Settings
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-destructive border-destructive/30 hover:bg-destructive/10" 
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/login">Sign In</Link>
                      </Button>
                      <Button variant="accent" className="w-full" asChild>
                        <Link to="/signup">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
