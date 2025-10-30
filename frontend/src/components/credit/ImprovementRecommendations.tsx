import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, CheckCircle, Clock, TrendingUp, 
  ArrowRight, Star, AlertCircle 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface Recommendation {
  dimension: string;
  title: string;
  description: string;
  impact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
  actionSteps: string[];
}

interface ImprovementGoal {
  id: string;
  dimension: string;
  current_value: number;
  target_value: number;
  deadline: string;
  status: string;
  progress_percentage: number;
  action_items: any[];
}

interface ImprovementRecommendationsProps {
  farmerId: string;
  recommendations?: any[];
  currentScores: {
    satellite: number;
    weather: number;
    financial: number;
    social: number;
    historical: number;
  };
}

export const ImprovementRecommendations = ({ 
  farmerId, 
  recommendations,
  currentScores 
}: ImprovementRecommendationsProps) => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<ImprovementGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, [farmerId]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('score_improvement_goals')
        .select('*')
        .eq('farmer_id', farmerId)
        .in('status', ['not_started', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data || []).map(g => ({
        ...g,
        action_items: Array.isArray(g.action_items) ? g.action_items : []
      })));
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async (recommendation: Recommendation) => {
    try {
      const targetValue = currentScores[recommendation.dimension as keyof typeof currentScores] + recommendation.impact;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + parseInt(recommendation.timeframe) * 30);

      const { error } = await supabase
        .from('score_improvement_goals')
        .insert({
          farmer_id: farmerId,
          dimension: recommendation.dimension,
          current_value: currentScores[recommendation.dimension as keyof typeof currentScores],
          target_value: Math.min(targetValue, 100),
          deadline: deadline.toISOString().split('T')[0],
          action_items: recommendation.actionSteps,
          status: 'in_progress'
        });

      if (error) throw error;

      toast({
        title: '✓ Goal Created',
        description: `You've set a goal to improve your ${recommendation.dimension} score`,
      });

      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create improvement goal',
        variant: 'destructive'
      });
    }
  };

  const defaultRecommendations: Recommendation[] = [
    {
      dimension: 'satellite',
      title: 'Improve Crop Health Monitoring',
      description: 'Regular monitoring and optimization of crop health will boost your satellite data score',
      impact: 15,
      difficulty: 'medium',
      timeframe: '3',
      actionSteps: [
        'Upload geotagged photos of your crops weekly',
        'Implement precision agriculture techniques',
        'Monitor and address crop stress indicators early'
      ]
    },
    {
      dimension: 'financial',
      title: 'Build Consistent Transaction History',
      description: 'Regular mobile money transactions show financial discipline and stability',
      impact: 20,
      difficulty: 'easy',
      timeframe: '2',
      actionSteps: [
        'Make regular savings deposits via mobile money',
        'Keep transaction records organized',
        'Maintain consistent payment patterns'
      ]
    },
    {
      dimension: 'social',
      title: 'Strengthen Community Network',
      description: 'Building trust within your farming community increases your social score',
      impact: 12,
      difficulty: 'easy',
      timeframe: '1',
      actionSteps: [
        'Get verified by 3-5 trusted community members',
        'Join local farmer cooperatives',
        'Participate in community farming initiatives'
      ]
    }
  ];

  const displayRecommendations = recommendations && recommendations.length > 0 
    ? recommendations 
    : defaultRecommendations;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Goals */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Improvement Goals
            </CardTitle>
            <CardDescription>
              Track your progress toward a higher credit score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map(goal => (
              <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold capitalize">{goal.dimension} Improvement</h4>
                    <p className="text-sm text-muted-foreground">
                      Target: {goal.target_value} (currently {goal.current_value})
                    </p>
                  </div>
                  <Badge variant={goal.status === 'in_progress' ? 'default' : 'secondary'}>
                    {goal.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{goal.progress_percentage}%</span>
                  </div>
                  <Progress value={goal.progress_percentage} />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>
            Personalized action steps to improve your credit score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayRecommendations.map((rec, index) => {
            const hasActiveGoal = goals.some(g => g.dimension === rec.dimension);

            return (
              <Card key={index} className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`${getDifficultyColor(rec.difficulty)} text-white`}
                        >
                          {rec.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {rec.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        <span>+{rec.impact}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>

                  {/* Action Steps */}
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    <h5 className="text-sm font-medium">Action Steps:</h5>
                    <ul className="space-y-1">
                      {rec.actionSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{rec.timeframe} months to complete</span>
                    </div>
                    
                    {!hasActiveGoal && (
                      <Button onClick={() => createGoal(rec)} size="sm">
                        Set as Goal
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    
                    {hasActiveGoal && (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Active Goal
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};