import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  TrendingUp, 
  Target,
  Loader2,
  CheckCircle2,
  AlertTriangle 
} from "lucide-react";

export function PriceAnalysisTool() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [formData, setFormData] = useState({
    cropType: '',
    region: '',
    qualityGrade: 'standard',
    volume: ''
  });

  const handleAnalyze = async () => {
    if (!formData.cropType) {
      toast({
        title: "Missing Information",
        description: "Please select a crop type",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-market-pricing', {
        body: {
          cropType: formData.cropType,
          region: formData.region,
          qualityGrade: formData.qualityGrade,
          volume: formData.volume ? parseFloat(formData.volume) : null
        }
      });

      if (error) throw error;
      setAnalysis(data.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "Dynamic pricing insights generated"
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze pricing",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getOutlookColor = (outlook: string) => {
    switch (outlook) {
      case 'bullish': return 'text-green-500 border-green-500';
      case 'bearish': return 'text-red-500 border-red-500';
      default: return 'text-yellow-500 border-yellow-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Dynamic Pricing Analysis
          </CardTitle>
          <CardDescription>
            AI-powered pricing recommendations based on real-time market data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cropType">Crop Type *</Label>
              <Select 
                value={formData.cropType}
                onValueChange={(value) => setFormData({ ...formData, cropType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maize">Maize</SelectItem>
                  <SelectItem value="cassava">Cassava</SelectItem>
                  <SelectItem value="rice">Rice</SelectItem>
                  <SelectItem value="tomatoes">Tomatoes</SelectItem>
                  <SelectItem value="onions">Onions</SelectItem>
                  <SelectItem value="beans">Beans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region (Optional)</Label>
              <Input
                id="region"
                placeholder="e.g., Eastern Province"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualityGrade">Quality Grade</Label>
              <Select 
                value={formData.qualityGrade}
                onValueChange={(value) => setFormData({ ...formData, qualityGrade: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="economy">Economy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume">Volume (kg)</Label>
              <Input
                id="volume"
                type="number"
                placeholder="e.g., 1000"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
              />
            </div>
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Market Data...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Analyze Pricing
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          {/* Recommended Price */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-2xl">
                Recommended Price: ${analysis.recommended_price_per_kg.toFixed(2)}/kg
              </CardTitle>
              <CardDescription>
                Based on current market conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Price Range</span>
                  <span className="text-sm font-medium">
                    ${analysis.price_range.min.toFixed(2)} - ${analysis.price_range.max.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={((analysis.recommended_price_per_kg - analysis.price_range.min) / (analysis.price_range.max - analysis.price_range.min)) * 100} 
                  className="h-2"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Market Outlook</p>
                  <Badge variant="outline" className={getOutlookColor(analysis.market_outlook)}>
                    {analysis.market_outlook.toUpperCase()}
                  </Badge>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Price Trend</p>
                  <Badge variant="outline">
                    {analysis.price_trend === 'increasing' ? '↗' : 
                     analysis.price_trend === 'decreasing' ? '↘' : '→'} {analysis.price_trend}
                  </Badge>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold">
                    {(analysis.confidence_score * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Time to Sell */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Best Time to Sell
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg border ${
                analysis.best_time_to_sell.recommendation === 'immediate' 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-yellow-500/10 border-yellow-500/20'
              }`}>
                <p className="font-medium capitalize mb-2">
                  {analysis.best_time_to_sell.recommendation.replace('_', ' ')}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  {analysis.best_time_to_sell.expected_price_change_percentage > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                  )}
                  <span>
                    Expected price change: {analysis.best_time_to_sell.expected_price_change_percentage > 0 ? '+' : ''}
                    {analysis.best_time_to_sell.expected_price_change_percentage}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Factors */}
          {analysis.market_factors && (
            <Card>
              <CardHeader>
                <CardTitle>Market Factors</CardTitle>
                <CardDescription>Key influences on current pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.market_factors.map((factor: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      {factor.impact === 'positive' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : factor.impact === 'negative' ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-yellow-500" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{factor.factor}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Weight: {(factor.weight * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{analysis.detailed_reasoning}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
