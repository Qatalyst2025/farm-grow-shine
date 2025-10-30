import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Bug, 
  Droplet, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Activity
} from "lucide-react";

interface CropHealthData {
  id: string;
  crop_id: string;
  growth_stage: string;
  health_score: number;
  pest_detected: boolean;
  pest_type: string | null;
  pest_severity: string | null;
  disease_detected: boolean;
  disease_type: string | null;
  disease_severity: string | null;
  water_stress_level: string;
  nutrient_deficiency: string[] | null;
  vegetation_index: number;
  recommendations: string[] | null;
  created_at: string;
}

interface CropHealthDashboardProps {
  healthData: CropHealthData;
  cropName: string;
}

const CropHealthDashboard = ({ healthData, cropName }: CropHealthDashboardProps) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-success/10 border-success/20';
    if (score >= 60) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  const getSeverityBadge = (severity: string | null) => {
    if (!severity) return null;
    
    const colors = {
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      high: 'bg-destructive/10 text-destructive border-destructive/20',
      critical: 'bg-red-600/10 text-red-600 border-red-600/20'
    };

    return (
      <Badge className={`${colors[severity as keyof typeof colors] || ''} border`}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStageColor = (stage: string) => {
    const stages = {
      germination: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      vegetative: 'bg-green-500/10 text-green-600 border-green-500/20',
      flowering: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      fruiting: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      maturity: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    };

    return stages[stage as keyof typeof stages] || 'bg-muted';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">{cropName} Health Dashboard</h2>
          <p className="text-muted-foreground">
            Last updated: {new Date(healthData.created_at).toLocaleString()}
          </p>
        </div>
        <Badge className={`${getStageColor(healthData.growth_stage)} border text-lg px-4 py-2`}>
          {healthData.growth_stage}
        </Badge>
      </div>

      {/* Overall Health Score */}
      <Card className={`p-6 ${getHealthBg(healthData.health_score)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Overall Health Score</h3>
            <div className={`text-5xl font-bold ${getHealthColor(healthData.health_score)}`}>
              {healthData.health_score}
              <span className="text-2xl">/100</span>
            </div>
          </div>
          <Activity className={`h-16 w-16 ${getHealthColor(healthData.health_score)}`} />
        </div>
        <Progress value={healthData.health_score} className="h-3" />
      </Card>

      {/* Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pest Status */}
        <Card className={`p-4 ${healthData.pest_detected ? 'bg-destructive/10 border-destructive/20' : 'bg-success/10 border-success/20'} border`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Bug className={`h-5 w-5 ${healthData.pest_detected ? 'text-destructive' : 'text-success'}`} />
                <h4 className="font-semibold">Pest Status</h4>
              </div>
              {healthData.pest_detected ? (
                <div>
                  <p className="text-sm mb-2">{healthData.pest_type}</p>
                  {getSeverityBadge(healthData.pest_severity)}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">No pests detected</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Disease Status */}
        <Card className={`p-4 ${healthData.disease_detected ? 'bg-destructive/10 border-destructive/20' : 'bg-success/10 border-success/20'} border`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`h-5 w-5 ${healthData.disease_detected ? 'text-destructive' : 'text-success'}`} />
                <h4 className="font-semibold">Disease Status</h4>
              </div>
              {healthData.disease_detected ? (
                <div>
                  <p className="text-sm mb-2">{healthData.disease_type}</p>
                  {getSeverityBadge(healthData.disease_severity)}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">No diseases detected</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Water Stress */}
        <Card className={`p-4 ${
          healthData.water_stress_level === 'high' ? 'bg-destructive/10 border-destructive/20' :
          healthData.water_stress_level === 'moderate' ? 'bg-warning/10 border-warning/20' :
          'bg-success/10 border-success/20'
        } border`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className={`h-5 w-5 ${
                  healthData.water_stress_level === 'high' ? 'text-destructive' :
                  healthData.water_stress_level === 'moderate' ? 'text-warning' :
                  'text-success'
                }`} />
                <h4 className="font-semibold">Water Stress</h4>
              </div>
              <Badge className={`${
                healthData.water_stress_level === 'high' ? 'bg-destructive/20 text-destructive' :
                healthData.water_stress_level === 'moderate' ? 'bg-warning/20 text-warning' :
                'bg-success/20 text-success'
              }`}>
                {healthData.water_stress_level.toUpperCase()}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vegetation Index */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Leaf className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Vegetation Index (NDVI)</h4>
          </div>
          <div className="text-3xl font-bold text-primary mb-2">
            {healthData.vegetation_index.toFixed(3)}
          </div>
          <Progress value={healthData.vegetation_index * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Higher values indicate healthier vegetation
          </p>
        </Card>

        {/* Nutrient Deficiency */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Nutrient Status</h4>
          </div>
          {healthData.nutrient_deficiency && healthData.nutrient_deficiency.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">Deficiencies detected:</p>
              <div className="flex flex-wrap gap-2">
                {healthData.nutrient_deficiency.map((nutrient, idx) => (
                  <Badge key={idx} variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    {nutrient}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span>All nutrients adequate</span>
            </div>
          )}
        </Card>
      </div>

      {/* Recommendations */}
      {healthData.recommendations && healthData.recommendations.length > 0 && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            AI Recommendations
          </h3>
          <ul className="space-y-3">
            {healthData.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{idx + 1}</span>
                </div>
                <p className="text-sm flex-1">{rec}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default CropHealthDashboard;