import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Satellite,
  Cloud,
  Leaf,
  DollarSign,
  Users,
  BarChart3
} from "lucide-react";

interface TrustScoreData {
  overall_score: number;
  satellite_score?: number;
  weather_score?: number;
  soil_score?: number;
  transaction_score?: number;
  social_score?: number;
  yield_prediction_score?: number;
  risk_level: string;
  loan_recommendation: string;
  confidence_percentage: number;
  ai_analysis: string;
  created_at: string;
}

interface TrustScoreCardProps {
  trustScore: TrustScoreData;
}

const TrustScoreCard = ({ trustScore }: TrustScoreCardProps) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      case 'very_high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'approve':
        return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Approve</Badge>;
      case 'review':
        return <Badge variant="secondary"><AlertTriangle className="mr-1 h-3 w-3" />Review</Badge>;
      case 'reject':
        return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Reject</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const scoreCategories = [
    { label: 'Satellite Imagery', score: trustScore.satellite_score, icon: Satellite, color: 'text-blue-500' },
    { label: 'Weather Patterns', score: trustScore.weather_score, icon: Cloud, color: 'text-sky-500' },
    { label: 'Soil Quality', score: trustScore.soil_score, icon: Leaf, color: 'text-green-500' },
    { label: 'Transactions', score: trustScore.transaction_score, icon: DollarSign, color: 'text-yellow-500' },
    { label: 'Social Network', score: trustScore.social_score, icon: Users, color: 'text-purple-500' },
    { label: 'Yield Prediction', score: trustScore.yield_prediction_score, icon: BarChart3, color: 'text-orange-500' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">Farmer Trust Score</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered credit risk assessment • Updated {new Date(trustScore.created_at).toLocaleDateString()}
          </p>
        </div>
        {getRecommendationBadge(trustScore.loan_recommendation)}
      </div>

      {/* Overall Score */}
      <div className="mb-8">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-5xl font-bold text-primary">{trustScore.overall_score}</div>
            <div className="text-sm text-muted-foreground">out of 100</div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${getRiskColor(trustScore.risk_level)}`}>
              {trustScore.risk_level.replace('_', ' ').toUpperCase()} RISK
            </div>
            <div className="text-sm text-muted-foreground">
              {trustScore.confidence_percentage}% confidence
            </div>
          </div>
        </div>
        <Progress value={trustScore.overall_score} className="h-3" />
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {scoreCategories.map((category) => {
          const Icon = category.icon;
          return category.score !== null && category.score !== undefined ? (
            <div key={category.label} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${category.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{category.label}</span>
                  <span className="text-sm font-bold">{category.score}/100</span>
                </div>
                <Progress value={category.score} className="h-2" />
              </div>
            </div>
          ) : null;
        })}
      </div>

      {/* AI Analysis */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          AI Analysis
        </h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {trustScore.ai_analysis}
        </p>
      </div>
    </Card>
  );
};

export default TrustScoreCard;