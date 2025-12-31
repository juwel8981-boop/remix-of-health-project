import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

type RoleType = "patient" | "doctor" | "admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: RoleType;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          setLoading(false);
          setHasAccess(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      if (!session?.user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      if (!requiredRole) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      try {
        if (requiredRole === "patient") {
          const { data } = await supabase
            .from("patients")
            .select("id")
            .eq("user_id", session.user.id)
            .maybeSingle();
          setHasAccess(!!data);
        } else if (requiredRole === "doctor") {
          const { data } = await supabase
            .from("doctors")
            .select("id, verification_status")
            .eq("user_id", session.user.id)
            .maybeSingle();
          // Allow access but the dashboard can show pending status
          setHasAccess(!!data);
        } else if (requiredRole === "admin") {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("role", "admin")
            .maybeSingle();
          setHasAccess(!!data);
        }
      } catch (error) {
        console.error("Error checking access:", error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      checkAccess();
    }
  }, [session, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <a href="/" className="text-primary hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
