import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CloudRain, 
  Bug, 
  TrendingDown, 
  Megaphone,
  X,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface EmergencyAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  translations: any;
  created_at: string;
  expires_at: string | null;
  acknowledgement_required: boolean;
  action_items: any[];
  acknowledged: boolean;
}

export const EmergencyAlertBanner = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadAlerts();
    setupRealtimeSubscription();
  }, []);

  const loadAlerts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get active alerts
    const { data: alertsData } = await supabase
      .from("emergency_alerts")
      .select("*")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order("created_at", { ascending: false });

    if (!alertsData) return;

    // Check acknowledgements
    const { data: acknowledgements } = await supabase
      .from("alert_acknowledgements")
      .select("alert_id")
      .eq("user_id", user.id);

    const acknowledgedIds = new Set(acknowledgements?.map(a => a.alert_id) || []);

    const enrichedAlerts = alertsData.map(alert => ({
      ...alert,
      action_items: Array.isArray(alert.action_items) ? alert.action_items : [],
      acknowledged: acknowledgedIds.has(alert.id)
    }));

    // Filter out acknowledged non-required alerts
    const activeAlerts = enrichedAlerts.filter(
      alert => !alert.acknowledged || alert.acknowledgement_required
    );

    setAlerts(activeAlerts);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("emergency-alerts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergency_alerts",
        },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const acknowledgeAlert = async (alertId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("alert_acknowledgements")
      .insert({
        alert_id: alertId,
        user_id: user.id,
      });

    if (error) {
      toast.error("Failed to acknowledge alert");
    } else {
      toast.success("Alert acknowledged");
      loadAlerts();
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "weather":
        return <CloudRain className="w-5 h-5" />;
      case "pest_disease":
        return <Bug className="w-5 h-5" />;
      case "market_price":
        return <TrendingDown className="w-5 h-5" />;
      case "government_program":
        return <Megaphone className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "emergency":
        return "bg-red-500/10 border-red-500 text-red-900 dark:text-red-100";
      case "critical":
        return "bg-orange-500/10 border-orange-500 text-orange-900 dark:text-orange-100";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500 text-yellow-900 dark:text-yellow-100";
      default:
        return "bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-100";
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-2 p-4 bg-background/95 backdrop-blur-sm border-b">
      {visibleAlerts.map((alert) => (
        <Alert
          key={alert.id}
          className={`${getSeverityColor(alert.severity)} relative animate-in slide-in-from-top`}
        >
          <div className="flex items-start gap-3">
            {getAlertIcon(alert.alert_type)}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTitle className="font-bold">
                  {alert.title}
                </AlertTitle>
                <Badge variant={alert.severity === "emergency" ? "destructive" : "secondary"}>
                  {alert.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {alert.alert_type.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
              <AlertDescription className="text-sm">
                {alert.message}
              </AlertDescription>
              
              {alert.action_items && alert.action_items.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold">Required Actions:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    {alert.action_items.map((action: any, idx: number) => (
                      <li key={idx}>{action.description}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2 mt-3">
                {alert.acknowledgement_required && !alert.acknowledged && (
                  <Button
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Acknowledge
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/community?tab=alerts")}
                >
                  View Details
                </Button>
                {!alert.acknowledgement_required && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
};