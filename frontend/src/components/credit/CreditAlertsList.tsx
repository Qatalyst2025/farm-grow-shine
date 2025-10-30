import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, X, Info 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreditAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface CreditAlertsListProps {
  farmerId: string;
}

export const CreditAlertsList = ({ farmerId }: CreditAlertsListProps) => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<CreditAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    
    // Subscribe to real-time alerts
    const channel = supabase
      .channel('credit-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'credit_score_alerts',
        filter: `farmer_id=eq.${farmerId}`
      }, (payload) => {
        const newAlert = payload.new as CreditAlert;
        setAlerts(prev => [newAlert, ...prev]);
        
        toast({
          title: newAlert.title,
          description: newAlert.message,
          variant: newAlert.severity === 'critical' ? 'destructive' : 'default'
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmerId]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_score_alerts')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('credit_score_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_read: true } : a
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'score_improvement': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'score_drop': return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'risk_increase': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'opportunity': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Credit Score Alerts
            </CardTitle>
            <CardDescription>
              Important notifications about your credit score
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No alerts yet</p>
            <p className="text-sm mt-2">You'll be notified of significant score changes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <Card 
                key={alert.id}
                className={`${!alert.is_read ? 'border-2 border-primary' : ''}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.alert_type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge variant={getSeverityVariant(alert.severity)} className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                        
                        {!alert.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(alert.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Dismiss
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};