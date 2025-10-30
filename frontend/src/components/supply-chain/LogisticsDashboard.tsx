import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, RefreshCw, Loader2, MapPin, Clock, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LogisticsDashboardProps {
  batchId: string;
}

export const LogisticsDashboard = ({ batchId }: LogisticsDashboardProps) => {
  const [logistics, setLogistics] = useState<any>(null);
  const [batch, setBatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    loadData();
  }, [batchId]);

  const loadData = async () => {
    try {
      const [logisticsResult, batchResult] = await Promise.all([
        supabase
          .from('supply_chain_logistics')
          .select('*')
          .eq('batch_id', batchId)
          .maybeSingle(),
        supabase
          .from('supply_chain_batches')
          .select('*')
          .eq('id', batchId)
          .single()
      ]);

      if (logisticsResult.error && logisticsResult.error.code !== 'PGRST116') {
        throw logisticsResult.error;
      }
      if (batchResult.error) throw batchResult.error;

      setLogistics(logisticsResult.data);
      setBatch(batchResult.data);
    } catch (error: any) {
      console.error('Error loading logistics:', error);
      toast.error('Failed to load logistics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);

    try {
      const { data, error } = await supabase.functions.invoke('optimize-logistics', {
        body: {
          batchId,
          priority: batch.delivery_priority || 'normal'
        }
      });

      if (error) throw error;

      toast.success('Route optimized successfully!');
      loadData();
    } catch (error: any) {
      console.error('Error optimizing logistics:', error);
      toast.error('Failed to optimize route');
    } finally {
      setIsOptimizing(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading logistics data...</div>;
  }

  if (!logistics) {
    return (
      <Card className="p-8 text-center">
        <Truck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Route Planned Yet</h3>
        <p className="text-muted-foreground mb-4">
          Optimize your delivery route using AI-powered logistics
        </p>
        <Button onClick={handleOptimize} disabled={isOptimizing}>
          {isOptimizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Truck className="mr-2 h-4 w-4" />
          Optimize Route
        </Button>
      </Card>
    );
  }

  const route = logistics.optimized_route;
  const spoilageRisk = logistics.spoilage_risk_factors;

  return (
    <div className="space-y-6">
      {/* Optimization Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Route Optimization</h3>
            <p className="text-sm text-muted-foreground">AI-powered logistics planning</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {logistics.optimization_score || 0}
            </div>
            <p className="text-sm text-muted-foreground">Score</p>
          </div>
        </div>

        <Button
          onClick={handleOptimize}
          disabled={isOptimizing}
          variant="outline"
          className="w-full mt-4"
        >
          {isOptimizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <RefreshCw className="mr-2 h-4 w-4" />
          Re-optimize Route
        </Button>
      </Card>

      {/* Route Overview */}
      {route && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Route Overview</h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{route.totalDistanceKm}</p>
              <p className="text-sm text-muted-foreground">km</p>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{route.estimatedDurationHours}</p>
              <p className="text-sm text-muted-foreground">hours</p>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">
                ${logistics.estimated_cost?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-muted-foreground">cost</p>
            </div>
          </div>

          {/* Waypoints */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Route Waypoints</h4>
            {route.waypoints?.map((waypoint: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{waypoint.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ETA: {waypoint.estimatedTime}
                  </p>
                </div>
                {index === route.waypoints.length - 1 && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Spoilage Risk */}
      {spoilageRisk && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Spoilage Risk Assessment</h3>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getRiskColor(spoilageRisk.riskScore)}`}>
                {spoilageRisk.riskScore}%
              </div>
              <Badge variant={spoilageRisk.riskLevel === 'low' ? 'default' : 'destructive'}>
                {spoilageRisk.riskLevel}
              </Badge>
            </div>
          </div>

          {spoilageRisk.factors && spoilageRisk.factors.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="font-semibold text-sm">Risk Factors:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {spoilageRisk.factors.map((factor: string, i: number) => (
                  <li key={i}>{factor}</li>
                ))}
              </ul>
            </div>
          )}

          {spoilageRisk.mitigationSteps && spoilageRisk.mitigationSteps.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <h4 className="font-semibold text-sm mb-2">Mitigation Steps:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {spoilageRisk.mitigationSteps.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Handling Requirements */}
      {logistics.handling_requirements && logistics.handling_requirements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Handling Requirements</h3>

          {logistics.temperature_requirements && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <p className="font-medium text-sm mb-1">Temperature Range</p>
              <p className="text-sm">
                {logistics.temperature_requirements.min}°C - {logistics.temperature_requirements.max}°C
              </p>
            </div>
          )}

          <ul className="space-y-2 text-sm">
            {logistics.handling_requirements.map((req: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Delivery Estimate */}
      {batch.estimated_delivery_date && (
        <Card className="p-6 bg-primary/5">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="text-lg font-semibold">
                {new Date(batch.estimated_delivery_date).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
