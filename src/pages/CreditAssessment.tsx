import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { CreditScoreDashboard } from '@/components/credit/CreditScoreDashboard';
import { ScoreRadarChart } from '@/components/credit/ScoreRadarChart';
import { ExplainableAIBreakdown } from '@/components/credit/ExplainableAIBreakdown';
import { ImprovementRecommendations } from '@/components/credit/ImprovementRecommendations';
import { ScoreTimeline } from '@/components/credit/ScoreTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, Target, History, Info, Shield 
} from 'lucide-react';

export default function CreditAssessment() {
  const navigate = useNavigate();
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (farmerId) {
      fetchCurrentScore();
    }
  }, [farmerId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data: profile } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (profile) {
      setFarmerId(profile.id);
    }
  };

  const fetchCurrentScore = async () => {
    const { data } = await supabase
      .from('credit_scores')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setCurrentScore(data);
  };

  if (!farmerId) {
    return null;
  }

  const scoreFactors = currentScore?.score_factors as any || {
    satellite: 0,
    weather: 0,
    financial: 0,
    social: 0,
    historical: 0
  };

  const weights = {
    satellite: currentScore?.satellite_weight || 0.20,
    weather: currentScore?.weather_weight || 0.15,
    financial: currentScore?.financial_weight || 0.25,
    social: currentScore?.social_weight || 0.20,
    historical: currentScore?.historical_weight || 0.20
  };

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8" />
              Credit Assessment
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered credit scoring for fair and inclusive lending
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            v1.0.0
          </Badge>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CreditScoreDashboard farmerId={farmerId} />
            
            {currentScore && (
              <ScoreRadarChart 
                scores={scoreFactors}
                peerAverage={currentScore.peer_comparison as any}
              />
            )}
          </div>

          <div className="space-y-6">
            {currentScore && (
              <ScoreTimeline farmerId={farmerId} />
            )}
          </div>
        </div>

        {/* Detailed Analysis Tabs */}
        {currentScore && (
          <Tabs defaultValue="explainer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="explainer">
                <Info className="h-4 w-4 mr-2" />
                Why This Score?
              </TabsTrigger>
              <TabsTrigger value="improve">
                <Target className="h-4 w-4 mr-2" />
                Improvement Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="explainer" className="mt-6">
              <ExplainableAIBreakdown 
                scores={scoreFactors}
                weights={weights}
                overallScore={currentScore.overall_score}
              />
            </TabsContent>

            <TabsContent value="improve" className="mt-6">
              <ImprovementRecommendations 
                farmerId={farmerId}
                recommendations={currentScore.improvement_recommendations as any}
                currentScores={scoreFactors}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MobileLayout>
  );
}