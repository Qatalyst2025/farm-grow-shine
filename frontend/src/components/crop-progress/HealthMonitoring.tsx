import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, TrendingUp, Droplet, Bug, Sprout, Activity } from "lucide-react";

interface Crop {
  name: string;
  health: string;
}

interface HealthMonitoringProps {
  crop: Crop;
}

export const HealthMonitoring = ({ crop }: HealthMonitoringProps) => {
  // Mock health data - in real app, integrate with sensors/AI analysis
  const healthMetrics = {
    overall: 92,
    soil: {
      ph: 6.5,
      moisture: 75,
      nutrients: 85,
      quality: "excellent"
    },
    threats: [
      { 
        id: 1, 
        type: "pest", 
        name: "Fall Armyworm", 
        severity: "low", 
        detected: "2025-10-10",
        status: "monitored"
      }
    ],
    predictions: {
      yield: 3200,
      quality: "A-grade",
      confidence: 87
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityBadgeVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch(severity) {
      case "low": return "outline";
      case "medium": return "secondary";
      case "high": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Health Dashboard */}
      <div className="lg:col-span-2 space-y-6">
        {/* Overall Health Score */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-card-foreground">Crop Health Overview</h3>
              <p className="text-sm text-muted-foreground">Real-time monitoring and analysis</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success mb-1">{healthMetrics.overall}%</div>
              <Badge variant="outline" className="border-success text-success">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Droplet className="h-5 w-5 text-info" />
                <span className="font-medium">Soil Moisture</span>
              </div>
              <Progress value={healthMetrics.soil.moisture} className="mb-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{healthMetrics.soil.moisture}%</span>
                <span className="text-success">Optimal</span>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sprout className="h-5 w-5 text-primary" />
                <span className="font-medium">Soil Nutrients</span>
              </div>
              <Progress value={healthMetrics.soil.nutrients} className="mb-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{healthMetrics.soil.nutrients}%</span>
                <span className="text-success">Good</span>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-secondary" />
                <span className="font-medium">Soil pH</span>
              </div>
              <div className="text-2xl font-bold text-card-foreground mb-1">{healthMetrics.soil.ph}</div>
              <span className="text-sm text-success">Ideal Range (6.0-7.0)</span>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="font-medium">Growth Rate</span>
              </div>
              <div className="text-2xl font-bold text-card-foreground mb-1">+12%</div>
              <span className="text-sm text-success">Above Average</span>
            </div>
          </div>
        </Card>

        {/* Threat Detection */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-card-foreground">Pest & Disease Monitoring</h3>
            <Badge variant="outline" className="border-success text-success">
              {healthMetrics.threats.length} Active Alerts
            </Badge>
          </div>

          {healthMetrics.threats.length > 0 ? (
            <div className="space-y-4">
              {healthMetrics.threats.map((threat) => (
                <div key={threat.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        threat.severity === 'low' ? 'bg-success/10' :
                        threat.severity === 'medium' ? 'bg-warning/10' :
                        'bg-destructive/10'
                      }`}>
                        <Bug className={`h-5 w-5 ${getSeverityColor(threat.severity)}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-card-foreground">{threat.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Detected on {new Date(threat.detected).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getSeverityBadgeVariant(threat.severity)}>
                      {threat.severity} Risk
                    </Badge>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>Recommended Action:</strong> Monitor closely and apply organic pest control if population increases. Early intervention prevents significant damage.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Under Control
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
              <p className="text-muted-foreground">No active threats detected</p>
            </div>
          )}
        </Card>

        {/* Yield Prediction */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-success/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-card-foreground">Yield Prediction</h3>
              <p className="text-sm text-muted-foreground">AI-powered forecast based on current data</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-2xl font-bold text-primary">{healthMetrics.predictions.yield} kg</p>
              <p className="text-sm text-muted-foreground">Predicted Yield</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-2xl font-bold text-success">{healthMetrics.predictions.quality}</p>
              <p className="text-sm text-muted-foreground">Quality Grade</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-2xl font-bold text-secondary">{healthMetrics.predictions.confidence}%</p>
              <p className="text-sm text-muted-foreground">Confidence</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-background rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 Based on current health metrics, you're on track to exceed the regional average by 15%. Continue your excellent care routine!
            </p>
          </div>
        </Card>
      </div>

      {/* Sidebar - Recommendations & History */}
      <div className="space-y-6">
        {/* Action Recommendations */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-card-foreground">Recommended Actions</h3>
          <div className="space-y-3">
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Soil health is excellent</p>
                  <p className="text-xs text-muted-foreground">Maintain current care routine</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Droplet className="h-4 w-4 text-info mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Monitor moisture levels</p>
                  <p className="text-xs text-muted-foreground">Rain expected next week, reduce watering</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Pest monitoring active</p>
                  <p className="text-xs text-muted-foreground">Check daily for population changes</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Health History */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-card-foreground">Health History</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">This Week</span>
              <span className="font-bold text-success">92%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Last Week</span>
              <span className="font-bold text-success">89%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">2 Weeks Ago</span>
              <span className="font-bold text-success">87%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              <span>+5% improvement over 3 weeks</span>
            </div>
          </div>
        </Card>

        {/* Integration Info */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h4 className="font-semibold mb-2 text-card-foreground">Early Warning System</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Our AI monitors your crop 24/7 and alerts you to potential issues before they become critical.
          </p>
          <Badge variant="outline" className="border-primary text-primary">
            <Activity className="h-3 w-3 mr-1" />
            Active Monitoring
          </Badge>
        </Card>
      </div>
    </div>
  );
};
