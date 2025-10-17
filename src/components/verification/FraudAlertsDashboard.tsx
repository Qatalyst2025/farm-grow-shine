import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Shield, Activity, Eye, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const FraudAlertsDashboard = () => {
  const [fraudLogs, setFraudLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFraudLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('fraud-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fraud_detection_logs'
        },
        () => {
          fetchFraudLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFraudLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('fraud_detection_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setFraudLogs(data || []);
    } catch (error) {
      console.error('Error fetching fraud logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'false_positive': return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'investigating': return <Activity className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  if (isLoading) {
    return <div>Loading fraud alerts...</div>;
  }

  const criticalAlerts = fraudLogs.filter(log => log.risk_level === 'critical' && log.status === 'flagged');
  const activeAlerts = fraudLogs.filter(log => log.status === 'flagged' || log.status === 'investigating');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-yellow-600" />
              Active Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Under investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Total Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fraudLogs.length}</div>
            <p className="text-xs text-muted-foreground">Security checks performed</p>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Logs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>Recent Fraud Detection Activity</CardTitle>
          </div>
          <CardDescription>
            AI-powered security monitoring and threat detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fraudLogs.length > 0 ? (
            <div className="space-y-3">
              {fraudLogs.map((log) => (
                <Alert key={log.id} className={log.risk_level === 'critical' ? 'border-red-500' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusIcon(log.status)}
                        <span className="font-semibold capitalize">
                          {log.entity_type.replace('_', ' ')} - {log.detection_method.replace('_', ' ')}
                        </span>
                        <Badge className={getRiskColor(log.risk_level)}>
                          {log.risk_level}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {log.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Fraud Score:</span>
                            <span className="text-red-600 font-bold">{log.fraud_score}/100</span>
                            <span className="text-muted-foreground">
                              (Confidence: {(log.ai_confidence * 100).toFixed(0)}%)
                            </span>
                          </div>

                          {log.fraud_indicators && log.fraud_indicators.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <span className="text-xs font-medium">Indicators:</span>
                              {log.fraud_indicators.slice(0, 3).map((indicator: any, idx: number) => (
                                <div key={idx} className="text-xs bg-muted p-2 rounded">
                                  <strong>{indicator.type}:</strong> {indicator.description}
                                  <span className="ml-2 text-muted-foreground">
                                    ({indicator.severity})
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No fraud detection activity</p>
              <p className="text-sm mt-2">
                The system is monitoring all activities for suspicious patterns
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};