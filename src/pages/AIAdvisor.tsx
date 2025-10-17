import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { AIAdvisorChat } from '@/components/learning/AIAdvisorChat';
import { FarmingPlanViewer } from '@/components/learning/FarmingPlanViewer';
import { AlertsDashboard } from '@/components/learning/AlertsDashboard';
import { QuickTips } from '@/components/learning/QuickTips';
import { SuccessStories } from '@/components/learning/SuccessStories';
import { LearningPath } from '@/components/learning/LearningPath';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, FileText, Bell, Lightbulb, GraduationCap } from 'lucide-react';

export default function AIAdvisor() {
  const navigate = useNavigate();
  const [farmerId, setFarmerId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

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

  if (!farmerId) {
    return null;
  }

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Agricultural Advisor</h1>
          <p className="text-muted-foreground mt-2">
            Get personalized farming advice powered by AI
          </p>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="tips">
              <Lightbulb className="h-4 w-4 mr-2" />
              Tips
            </TabsTrigger>
            <TabsTrigger value="learn">
              <GraduationCap className="h-4 w-4 mr-2" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="plans">
              <FileText className="h-4 w-4 mr-2" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <AIAdvisorChat farmerId={farmerId} />
          </TabsContent>

          <TabsContent value="tips" className="mt-6 space-y-6">
            <QuickTips farmerId={farmerId} />
            <SuccessStories />
          </TabsContent>

          <TabsContent value="learn" className="mt-6">
            <LearningPath level="beginner" />
          </TabsContent>

          <TabsContent value="plans" className="mt-6">
            <FarmingPlanViewer farmerId={farmerId} />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <AlertsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}