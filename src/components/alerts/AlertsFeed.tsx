import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  CloudRain, 
  Bug, 
  TrendingDown, 
  Megaphone,
  CheckCircle2,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  created_at: string;
  expires_at: string | null;
  acknowledgement_required: boolean;
  action_items: any[];
  affected_users_count: number;
  acknowledged: boolean;
}

export const AlertsFeed = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "info" | "warning" | "critical" | "emergency">("all");

  useEffect(() => {
    loadAlerts();
    setupRealtimeSubscription();
  }, [filter]);

  const loadAlerts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("emergency_alerts")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("severity", filter);
    }

    const { data: alertsData } = await query;

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

    setAlerts(enrichedAlerts);
    setLoading(false);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("alerts-feed")
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

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "emergency":
        return "destructive";
      case "critical":
        return "default";
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={filter === "emergency" ? "destructive" : "outline"}
          onClick={() => setFilter("emergency")}
          size="sm"
        >
          Emergency
        </Button>
        <Button
          variant={filter === "critical" ? "default" : "outline"}
          onClick={() => setFilter("critical")}
          size="sm"
        >
          Critical
        </Button>
        <Button
          variant={filter === "warning" ? "secondary" : "outline"}
          onClick={() => setFilter("warning")}
          size="sm"
        >
          Warning
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No active alerts</p>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.alert_type)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge variant={getSeverityVariant(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline" className="text-primary">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {alert.action_items && alert.action_items.length > 0 && (
                    <div className="bg-muted/50 rounded p-3">
                      <p className="text-xs font-semibold mb-2">Required Actions:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        {alert.action_items.map((action: any, idx: number) => (
                          <li key={idx}>{action.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                      <span>{alert.affected_users_count} acknowledgements</span>
                    </div>
                    {alert.acknowledgement_required && !alert.acknowledged && (
                      <Button
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                  </div>

                  {alert.expires_at && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Expires {formatDistanceToNow(new Date(alert.expires_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};