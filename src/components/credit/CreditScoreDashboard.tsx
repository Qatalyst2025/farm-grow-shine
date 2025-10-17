import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Minus, RefreshCw, 
  Shield, AlertCircle, CheckCircle, Info 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreditScore {
  id: string;
  overall_score: number;
  risk_category: string;
  confidence_score: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  score_factors: {
    satellite: number;
    weather: number;
    financial: number;
    social: number;
    historical: number;
  };
  score_trend: string;
  score_change: number;
  max_loan_amount: number;
  recommended_interest_rate: number;
  model_confidence: string;
  created_at: string;
}

interface CreditScoreDashboardProps {
  farmerId: string;
}

export const CreditScoreDashboard = ({ farmerId }: CreditScoreDashboardProps) => {
  const { toast } = useToast();
  const [score, setScore] = useState<CreditScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    fetchCreditScore();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('credit-scores')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'credit_scores',
        filter: `farmer_id=eq.${farmerId}`
      }, (payload) => {
        const newScore = payload.new as any;
        setScore({
          ...newScore,
          score_factors: newScore.score_factors as CreditScore['score_factors']
        });
        toast({
          title: '✨ Credit Score Updated',
          description: 'Your credit assessment has been refreshed',
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmerId]);

  const fetchCreditScore = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_scores')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setScore({
          ...data,
          score_factors: data.score_factors as CreditScore['score_factors']
        });
      }
    } catch (error) {
      console.error('Error fetching credit score:', error);
      toast({
        title: 'Error',
        description: 'Failed to load credit score',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateScore = async () => {
    setIsCalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-credit-score', {
        body: { farmerId }
      });

      if (error) throw error;
      
      toast({
        title: '✓ Score Calculated',
        description: 'Your credit score has been updated',
      });
      
      await fetchCreditScore();
    } catch (error) {
      console.error('Error calculating score:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate credit score',
        variant: 'destructive'
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'minimal': return 'bg-green-500';
      case 'low': return 'bg-blue-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'very_high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadgeVariant = (category: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (category) {
      case 'minimal':
      case 'low': return 'default';
      case 'moderate': return 'secondary';
      case 'high':
      case 'very_high': return 'destructive';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Credit Score Yet</h3>
          <p className="text-muted-foreground mb-4">
            Calculate your AI-powered credit score to unlock loan opportunities
          </p>
          <Button onClick={calculateScore} disabled={isCalculating}>
            {isCalculating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              'Calculate My Score'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const scorePercentage = (score.overall_score / 100) * 100;

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-2 ${getRiskColor(score.risk_category)}`} />
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Your Credit Score</CardTitle>
              <CardDescription>
                Last updated {new Date(score.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={calculateScore}
              disabled={isCalculating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-bold">{score.overall_score}</span>
                <span className="text-2xl text-muted-foreground">/100</span>
                {getTrendIcon(score.score_trend)}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={getRiskBadgeVariant(score.risk_category)}>
                  {score.risk_category.replace('_', ' ').toUpperCase()}
                </Badge>
                {score.score_change !== 0 && (
                  <span className={`text-sm font-medium ${score.score_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {score.score_change > 0 ? '+' : ''}{score.score_change} points
                  </span>
                )}
              </div>

              <Progress value={scorePercentage} className="h-3" />
              
              {/* Confidence Interval */}
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>
                  Confidence range: {score.confidence_interval_lower.toFixed(0)} - {score.confidence_interval_upper.toFixed(0)}
                  {' '}({score.confidence_score}% confident)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Max Loan Amount</p>
              <p className="text-2xl font-bold">${score.max_loan_amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
              <p className="text-2xl font-bold">{score.recommended_interest_rate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Model Confidence</p>
              <div className="flex items-center gap-2">
                {score.model_confidence === 'high' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : score.model_confidence === 'medium' ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <span className="text-lg font-semibold capitalize">{score.model_confidence}</span>
              </div>
            </div>
          </div>

          {/* Dimension Scores */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold">Score Breakdown</h4>
            {Object.entries(score.score_factors).map(([dimension, value]) => (
              <div key={dimension} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{dimension}</span>
                  <span className="font-medium">{value.toFixed(1)}/100</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};