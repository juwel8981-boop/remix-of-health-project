import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { 
  UserPlus, CheckCircle2, XCircle, Building2, Stethoscope, 
  FileText, Settings, Clock, AlertCircle 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  description: string;
  user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const getActionIcon = (actionType: string, entityType: string) => {
  if (actionType === "registration") return UserPlus;
  if (actionType === "approved") return CheckCircle2;
  if (actionType === "rejected") return XCircle;
  if (entityType === "hospital") return Building2;
  if (entityType === "doctor") return Stethoscope;
  if (entityType === "post") return FileText;
  if (entityType === "settings") return Settings;
  return AlertCircle;
};

const getActionColor = (actionType: string) => {
  switch (actionType) {
    case "approved":
      return "text-healthcare-green bg-healthcare-green/10";
    case "rejected":
      return "text-destructive bg-destructive/10";
    case "registration":
      return "text-primary bg-primary/10";
    case "update":
      return "text-accent bg-accent/10";
    default:
      return "text-muted-foreground bg-muted";
  }
};

// Mock data for demo purposes
const mockActivities: ActivityLog[] = [
  {
    id: "1",
    action_type: "registration",
    entity_type: "doctor",
    entity_id: "dr-1",
    entity_name: "Dr. Rahman Ahmed",
    description: "New doctor registration pending approval",
    user_id: null,
    metadata: {},
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    action_type: "approved",
    entity_type: "hospital",
    entity_id: "hosp-1",
    entity_name: "Dhaka Medical College",
    description: "Hospital verified and approved",
    user_id: null,
    metadata: {},
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    action_type: "registration",
    entity_type: "user",
    entity_id: "user-1",
    entity_name: "Fatima Khan",
    description: "New patient registered",
    user_id: null,
    metadata: {},
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    action_type: "rejected",
    entity_type: "post",
    entity_id: "post-1",
    entity_name: "Health Tips Article",
    description: "Post rejected due to policy violation",
    user_id: null,
    metadata: {},
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    action_type: "approved",
    entity_type: "doctor",
    entity_id: "dr-2",
    entity_name: "Dr. Nasreen Begum",
    description: "Doctor credentials verified",
    user_id: null,
    metadata: {},
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "6",
    action_type: "update",
    entity_type: "settings",
    entity_id: "settings-1",
    entity_name: "Site Settings",
    description: "Email notifications enabled",
    user_id: null,
    metadata: {},
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>(mockActivities);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel('activity-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        (payload) => {
          const newActivity = payload.new as ActivityLog;
          setActivities(prev => [newActivity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="healthcare-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground">Recent Activity</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          Real-time updates
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = getActionIcon(activity.action_type, activity.entity_type);
          const colorClass = getActionColor(activity.action_type);
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.entity_name || activity.entity_type}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
