import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, Network, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FarmVerificationForm } from "@/components/verification/FarmVerificationForm";
import { TrustNetworkDashboard } from "@/components/verification/TrustNetworkDashboard";
import { FraudAlertsDashboard } from "@/components/verification/FraudAlertsDashboard";
import { useBehavioralBiometrics } from "@/hooks/useBehavioralBiometrics";

const VerificationCenter = () => {
  const navigate = useNavigate();
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Enable behavioral biometrics tracking
  useBehavioralBiometrics();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    await loadFarmerProfile(session.user.id);
  };

  const loadFarmerProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        toast.error('Please create a farmer profile first');
        navigate('/farmer/risk-assessment');
        return;
      }

      setFarmerProfile(profile);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading verification center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">AI Verification Center</h1>
              <p className="text-primary-foreground/80">
                Blockchain-level trust through AI-powered verification
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="verify" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="verify">
              <Upload className="mr-2 h-4 w-4" />
              Verify
            </TabsTrigger>
            <TabsTrigger value="trust">
              <Network className="mr-2 h-4 w-4" />
              Trust Network
            </TabsTrigger>
            <TabsTrigger value="fraud">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verify" className="space-y-6">
            <div className="max-w-3xl mx-auto">
              {farmerProfile && (
                <FarmVerificationForm
                  farmerId={farmerProfile.id}
                  onVerificationComplete={() => toast.success('Verification submitted successfully')}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="trust" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <TrustNetworkDashboard />
            </div>
          </TabsContent>

          <TabsContent value="fraud" className="space-y-6">
            <div className="max-w-6xl mx-auto">
              <FraudAlertsDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VerificationCenter;