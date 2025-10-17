import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Satellite, CloudRain, Wallet, Users, History, 
  TrendingUp, Info, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface ScoreFactor {
  dimension: string;
  score: number;
  weight: number;
  contribution: number;
  description: string;
  icon: React.ElementType;
  details: string[];
}

interface ExplainableAIBreakdownProps {
  scores: {
    satellite: number;
    weather: number;
    financial: number;
    social: number;
    historical: number;
  };
  weights: {
    satellite: number;
    weather: number;
    financial: number;
    social: number;
    historical: number;
  };
  overallScore: number;
}

export const ExplainableAIBreakdown = ({ scores, weights, overallScore }: ExplainableAIBreakdownProps) => {
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  const factors: ScoreFactor[] = [
    {
      dimension: 'Satellite & Farm Data',
      score: scores.satellite,
      weight: weights.satellite,
      contribution: scores.satellite * weights.satellite,
      description: 'Farm size verification and crop health from satellite imagery',
      icon: Satellite,
      details: [
        'Crop health index from multispectral analysis',
        'Land use efficiency and farm boundary verification',
        'Vegetation cover and growth patterns',
        'Field condition assessment'
      ]
    },
    {
      dimension: 'Weather & Climate Risk',
      score: scores.weather,
      weight: weights.weather,
      contribution: scores.weather * weights.weather,
      description: 'Climate resilience and weather-related risks',
      icon: CloudRain,
      details: [
        'Historical drought exposure analysis',
        'Flood risk assessment based on topography',
        'Climate adaptation capacity',
        'Seasonal weather pattern impact'
      ]
    },
    {
      dimension: 'Financial Behavior',
      score: scores.financial,
      weight: weights.financial,
      contribution: scores.financial * weights.financial,
      description: 'Mobile money transactions and financial patterns',
      icon: Wallet,
      details: [
        'Transaction consistency and regularity',
        'Savings pattern analysis',
        'Income stability indicators',
        'Financial discipline score'
      ]
    },
    {
      dimension: 'Social Trust Network',
      score: scores.social,
      weight: weights.social,
      contribution: scores.social * weights.social,
      description: 'Community verification and peer endorsements',
      icon: Users,
      details: [
        'Community member verifications',
        'Peer endorsement count and quality',
        'Network strength and reach',
        'Reputation score from trust network'
      ]
    },
    {
      dimension: 'Historical Performance',
      score: scores.historical,
      weight: weights.historical,
      contribution: scores.historical * weights.historical,
      description: 'Past yields, repayments, and business longevity',
      icon: History,
      details: [
        'Historical crop yield data',
        'Loan repayment history',
        'Years in business',
        'Track record consistency'
      ]
    }
  ];

  // Sort by contribution (highest first)
  const sortedFactors = [...factors].sort((a, b) => b.contribution - a.contribution);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Why This Score? </CardTitle>
            <CardDescription>
              Transparent breakdown of your {overallScore} credit score
            </CardDescription>
          </div>
          <Badge variant="secondary">
            <Info className="h-3 w-3 mr-1" />
            AI Explainability
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* How Score is Calculated */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            How Your Score is Calculated
          </h4>
          <p className="text-sm text-muted-foreground">
            Your overall score of <span className="font-bold text-foreground">{overallScore}</span> is calculated 
            by combining five key dimensions, each weighted based on its importance in predicting creditworthiness. 
            The AI model analyzes multiple data sources to provide a fair, comprehensive assessment.
          </p>
        </div>

        {/* Factor Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold">Score Components</h4>
          {sortedFactors.map((factor) => {
            const Icon = factor.icon;
            const isExpanded = expandedFactor === factor.dimension;
            
            return (
              <Collapsible
                key={factor.dimension}
                open={isExpanded}
                onOpenChange={() => setExpandedFactor(isExpanded ? null : factor.dimension)}
              >
                <Card className="border-2">
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full p-4 h-auto hover:bg-muted/50"
                    >
                      <div className="w-full space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">{factor.dimension}</div>
                              <div className="text-xs text-muted-foreground">
                                {factor.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-2xl font-bold">{factor.score.toFixed(0)}</div>
                              <div className="text-xs text-muted-foreground">
                                {(factor.weight * 100).toFixed(0)}% weight
                              </div>
                            </div>
                            <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Contribution to overall score</span>
                            <span className="font-medium">+{factor.contribution.toFixed(1)} points</span>
                          </div>
                          <Progress value={(factor.contribution / overallScore) * 100} className="h-2" />
                        </div>
                      </div>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-2 border-t">
                      <h5 className="font-medium text-sm mb-2">Data Sources</h5>
                      <ul className="space-y-2">
                        {factor.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>

        {/* Fair Scoring Note */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Fair & Inclusive:</strong> Our AI model is designed to be inclusive, considering alternative 
            data sources like mobile money and community trust, which traditional banks often ignore. This helps 
            farmers without formal credit history access loans.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};