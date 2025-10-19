import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp, Calendar, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PlantingRecommendation {
  id: string;
  crop_type: string;
  recommended_planting_date: string;
  expected_harvest_date: string;
  predicted_market_price: number;
  predicted_demand_level: string;
  expected_profit_per_acre: number;
  confidence_score: number;
  reasoning: any;
  market_forecast: any;
  weather_factors: any;
  competition_level: string;
  status: string;
  created_at: string;
}

interface SmartRecommendationsProps {
  farmerId: string;
}

export const SmartRecommendations = ({ farmerId }: SmartRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<PlantingRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('planting_recommendations')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('status', 'active')
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-planting-recommendations', {
        body: { farmerId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message || "Recommendations generated successfully",
      });

      fetchRecommendations();
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'bg-green-500';
      case 'high': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    fetchRecommendations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('planting_recommendations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'planting_recommendations',
          filter: `farmer_id=eq.${farmerId}`
        },
        () => {
          fetchRecommendations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmerId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Smart Planting Recommendations
          </h2>
          <p className="text-muted-foreground">AI-powered insights for optimal crop planning</p>
        </div>
        <Button 
          onClick={generateRecommendations} 
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Recommendations
            </>
          )}
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate AI-powered planting recommendations based on market trends and forecasts
            </p>
            <Button onClick={generateRecommendations} disabled={isGenerating}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="capitalize">{rec.crop_type}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">Confidence:</span>
                        <Progress value={rec.confidence_score * 100} className="w-24 h-2" />
                        <span className="text-xs font-medium">{(rec.confidence_score * 100).toFixed(0)}%</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className={getDemandColor(rec.predicted_demand_level)}>
                    {rec.predicted_demand_level.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Plant:</span>
                    <span className="font-medium">{new Date(rec.recommended_planting_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Harvest:</span>
                    <span className="font-medium">{new Date(rec.expected_harvest_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Expected Price:</span>
                    <span className="font-medium">${rec.predicted_market_price.toFixed(2)}/kg</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Profit per Acre:</span>
                    <span className="font-bold text-green-600">
                      ${rec.expected_profit_per_acre.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Competition:</span>
                    <Badge variant="outline" className={getCompetitionColor(rec.competition_level)}>
                      {rec.competition_level}
                    </Badge>
                  </div>
                </div>

                {rec.reasoning && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      {rec.reasoning.marketTiming || rec.reasoning.priceTrend}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};