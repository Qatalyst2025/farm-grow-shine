import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, Calendar, TrendingUp, Droplets, Bug, Sprout, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FarmingPlan {
  id: string;
  crop_type: string;
  plan_data: any;
  success_probability: number;
  estimated_yield: number;
  estimated_revenue: number;
  created_at: string;
  status: string;
}

interface FarmingPlanViewerProps {
  farmerId: string;
}

export const FarmingPlanViewer = ({ farmerId }: FarmingPlanViewerProps) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<FarmingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<FarmingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFarmingPlans();
  }, [farmerId]);

  const fetchFarmingPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('farming_plans')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPlans(data || []);
      if (data && data.length > 0) {
        setSelectedPlan(data[0]);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load farming plans',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Sprout className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No farming plans yet</p>
          <Button className="mt-4">Create Your First Plan</Button>
        </CardContent>
      </Card>
    );
  }

  const renderPlanContent = (plan: FarmingPlan) => {
    const planData = plan.plan_data;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plan.success_probability}%</div>
              <Progress value={plan.success_probability} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Est. Yield</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plan.estimated_yield ? `${plan.estimated_yield} kg` : 'TBD'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Per acre</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plan.estimated_revenue ? `$${plan.estimated_revenue}` : 'TBD'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total expected</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="practices">Best Practices</TabsTrigger>
            <TabsTrigger value="risks">Risk Mitigation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5" />
                  Pre-Planting Preparation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {planData.prePlanting || planData.rawPlan || 'Detailed pre-planting instructions will be provided.'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Irrigation & Water Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {planData.irrigation || 'Water management guidelines will be customized based on your conditions.'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Pest & Disease Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {planData.pestManagement || 'Integrated pest management strategies will be provided.'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              {planData.timeline?.map((milestone: any, index: number) => (
                <div key={index} className="relative flex gap-4 pb-8">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold z-10">
                    {index + 1}
                  </div>
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-base">{milestone.phase || milestone}</CardTitle>
                      <CardDescription>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {milestone.timing || 'Timing TBD'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {milestone.tasks?.join(', ') || milestone.description || 'Details coming soon'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )) || (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Timeline will be customized based on your planting date
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="practices" className="space-y-4">
            {planData.bestPractices?.map((practice: string, index: number) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm">{practice}</p>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Best practices learned from successful farmers in your region
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            {planData.riskMitigation?.map((risk: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{risk.risk || risk}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {risk.mitigation || 'Mitigation strategies will be provided'}
                  </p>
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Risk mitigation strategies tailored to your farm conditions
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {plans.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {plans.map(plan => (
            <Button
              key={plan.id}
              variant={selectedPlan?.id === plan.id ? 'default' : 'outline'}
              onClick={() => setSelectedPlan(plan)}
            >
              {plan.crop_type}
              <Badge variant="secondary" className="ml-2">
                {plan.status}
              </Badge>
            </Button>
          ))}
        </div>
      )}

      {selectedPlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedPlan.crop_type} Farming Plan</CardTitle>
                <CardDescription>
                  Created {new Date(selectedPlan.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant={selectedPlan.status === 'active' ? 'default' : 'secondary'}>
                {selectedPlan.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderPlanContent(selectedPlan)}
          </CardContent>
        </Card>
      )}
    </div>
  );
};