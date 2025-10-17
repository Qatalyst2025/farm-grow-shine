import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Droplet, 
  Leaf, 
  Bug, 
  Calendar,
  CheckCircle2,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  action_required: string | null;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
}

interface AlertsListProps {
  alerts: Alert[];
  onAlertUpdate: () => void;
}

const AlertsList = ({ alerts, onAlertUpdate }: AlertsListProps) => {
  const [processing, setProcessing] = useState<string | null>(null);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'irrigation': return Droplet;
      case 'fertilization': return Leaf;
      case 'pest_control': return Bug;
      case 'disease': return AlertTriangle;
      case 'harvest': return Calendar;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600/10 text-red-600 border-red-600/20';
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'info': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600/5 border-red-600/20';
      case 'urgent': return 'bg-destructive/5 border-destructive/20';
      case 'warning': return 'bg-warning/5 border-warning/20';
      case 'info': return 'bg-blue-500/5 border-blue-500/20';
      default: return 'bg-muted';
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    setProcessing(alertId);
    try {
      const { error } = await supabase
        .from('crop_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Alert marked as read');
      onAlertUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update alert');
    } finally {
      setProcessing(null);
    }
  };

  const handleResolve = async (alertId: string) => {
    setProcessing(alertId);
    try {
      const { error } = await supabase
        .from('crop_alerts')
        .update({ is_resolved: true, is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Alert resolved');
      onAlertUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve alert');
    } finally {
      setProcessing(null);
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-success" />
        <h3 className="text-xl font-semibold mb-2">All Clear!</h3>
        <p className="text-muted-foreground">
          No active alerts for your crops
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const Icon = getAlertIcon(alert.alert_type);
        
        return (
          <Card 
            key={alert.id}
            className={`p-4 ${getSeverityBg(alert.severity)} border ${alert.is_resolved ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${getSeverityColor(alert.severity)} border`}>
                <Icon className="h-6 w-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold mb-1">{alert.title}</h4>
                    <Badge className={`${getSeverityColor(alert.severity)} border`}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {alert.is_resolved && (
                    <Badge className="bg-success/10 text-success border-success/20">
                      Resolved
                    </Badge>
                  )}
                </div>

                <p className="text-sm mb-2">{alert.message}</p>

                {alert.action_required && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-primary mb-1">Action Required:</p>
                    <p className="text-sm">{alert.action_required}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3" />
                  {new Date(alert.created_at).toLocaleString()}
                </div>

                {!alert.is_resolved && (
                  <div className="flex gap-2">
                    {!alert.is_read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(alert.id)}
                        disabled={processing === alert.id}
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                      disabled={processing === alert.id}
                      className="bg-success hover:bg-success/90"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default AlertsList;