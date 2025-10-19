import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  Target,
  AlertCircle
} from "lucide-react";

interface MarketPulseProps {
  insights: any;
}

export function MarketPulseDashboard({ insights }: MarketPulseProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'bullish': return <TrendingUp className="h-5 w-5" />;
      case 'bearish': return <TrendingDown className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  if (!insights?.overall_market_pulse) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Pulse</CardTitle>
          <CardDescription>Loading market insights...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { overall_market_pulse, crop_insights, strategic_recommendations } = insights;

  return (
    <div className="space-y-6">
      {/* Overall Market Status */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Market Pulse
              </CardTitle>
              <CardDescription>Real-time market overview</CardDescription>
            </div>
            <div className={`flex items-center gap-2 ${getStatusColor(overall_market_pulse.status)}`}>
              {getStatusIcon(overall_market_pulse.status)}
              <span className="text-2xl font-bold capitalize">
                {overall_market_pulse.status}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Market Confidence</span>
                <span className="text-sm font-medium">
                  {(overall_market_pulse.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={overall_market_pulse.confidence * 100} className="h-2" />
            </div>
            <p className="text-sm">{overall_market_pulse.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Crop-Specific Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        {crop_insights?.slice(0, 4).map((crop: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{crop.crop_type}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className={
                  crop.current_price_trend === 'increasing' ? 'text-green-500 border-green-500' :
                  crop.current_price_trend === 'decreasing' ? 'text-red-500 border-red-500' :
                  'text-yellow-500 border-yellow-500'
                }>
                  {crop.current_price_trend === 'increasing' ? '↗' : 
                   crop.current_price_trend === 'decreasing' ? '↘' : '→'} Price
                </Badge>
                <Badge variant="outline" className={
                  crop.demand_outlook === 'high' ? 'text-green-500 border-green-500' :
                  crop.demand_outlook === 'low' ? 'text-red-500 border-red-500' :
                  'text-yellow-500 border-yellow-500'
                }>
                  {crop.demand_outlook} Demand
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {crop.best_selling_window && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Best Selling Window</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(crop.best_selling_window.start_date).toLocaleDateString()} - {new Date(crop.best_selling_window.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    ${crop.best_selling_window.expected_price_range.min} - ${crop.best_selling_window.expected_price_range.max}/kg
                  </p>
                </div>
              )}

              {crop.export_potential?.viable && (
                <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Export Opportunity
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{crop.export_potential.premium_percentage}% premium in {crop.export_potential.target_markets.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {crop.risk_factors && crop.risk_factors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Risk Factors:</p>
                  {crop.risk_factors.slice(0, 2).map((risk: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs">{risk}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategic Recommendations */}
      {strategic_recommendations && strategic_recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Strategic Recommendations</CardTitle>
            <CardDescription>AI-powered action items for maximum returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strategic_recommendations.map((rec: any, index: number) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    rec.priority === 'high' ? 'bg-red-500/5 border-red-500/20' :
                    rec.priority === 'medium' ? 'bg-yellow-500/5 border-yellow-500/20' :
                    'bg-blue-500/5 border-blue-500/20'
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {rec.priority.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{rec.timeline}</span>
                    </div>
                    <p className="font-medium mb-1">{rec.action}</p>
                    <p className="text-sm text-muted-foreground">{rec.expected_impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
