import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "patient" | "doctor" | "admin" | null;

interface AuthUser {
  user: SupabaseUser | null;
  avatarUrl: string | null;
  userName: string | null;
  userRole: UserRole;
  isLoading: boolean;
}

export function useAuthUser(): AuthUser {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("id", userId)
      .maybeSingle();
    
    if (profile) {
      setAvatarUrl(profile.avatar_url);
      setUserName(profile.full_name);
    }
  }, []);

  const fetchUserRole = useCallback(async (userId: string) => {
    // Fetch all role checks in parallel for speed
    const [adminResult, doctorResult, patientResult] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
      supabase.from("doctors").select("id").eq("user_id", userId).maybeSingle(),
      supabase.from("patients").select("id").eq("user_id", userId).maybeSingle(),
    ]);

    if (adminResult.data) { setUserRole("admin"); }
    else if (doctorResult.data) { setUserRole("doctor"); }
    else if (patientResult.data) { setUserRole("patient"); }
    else { setUserRole(null); }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Defer to avoid Supabase auth deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setAvatarUrl(null);
          setUserName(null);
          setUserRole(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserRole(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, fetchUserRole]);

  return { user, avatarUrl, userName, userRole, isLoading };
}
