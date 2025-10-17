import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TrustScoreCard from "@/components/risk-assessment/TrustScoreCard";
import DataSourceForm from "@/components/risk-assessment/DataSourceForm";
import { Brain, Loader2, Plus, User, BarChart3 } from "lucide-react";

const RiskAssessment = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [trustScores, setTrustScores] = useState<any[]>([]);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone_number: "",
    farm_location: "",
    farm_size_acres: "",
    years_farming: "",
    community_network_size: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
    await loadFarmerData(session.user.id);
  };

  const loadFarmerData = async (userId: string) => {
    try {
      // Load farmer profile
      const { data: profile, error: profileError } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setFarmerProfile(profile);

      if (profile) {
        // Load trust scores
        await loadTrustScores(profile.id);
        
        // Subscribe to realtime updates
        const channel = supabase
          .channel('trust-scores-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'farmer_trust_scores',
              filter: `farmer_id=eq.${profile.id}`
            },
            (payload) => {
              setTrustScores(prev => [payload.new, ...prev]);
              toast.success("New trust score received!");
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    } catch (error: any) {
      console.error('Error loading farmer data:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrustScores = async (farmerId: string) => {
    const { data, error } = await supabase
      .from('farmer_trust_scores')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading trust scores:', error);
    } else {
      setTrustScores(data || []);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('farmer_profiles')
        .insert({
          user_id: user.id,
          full_name: profileData.full_name,
          phone_number: profileData.phone_number,
          farm_location: profileData.farm_location,
          farm_size_acres: profileData.farm_size_acres ? parseFloat(profileData.farm_size_acres) : null,
          years_farming: profileData.years_farming ? parseInt(profileData.years_farming) : null,
          community_network_size: profileData.community_network_size ? parseInt(profileData.community_network_size) : 0,
        })
        .select()
        .single();

      if (error) throw error;

      setFarmerProfile(data);
      setShowProfileForm(false);
      toast.success("Farmer profile created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile");
    }
  };

  const handleRunAssessment = async () => {
    if (!farmerProfile) return;

    setIsAssessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('assess-farmer-risk', {
        body: { farmerId: farmerProfile.id }
      });

      if (error) throw error;

      toast.success("AI assessment completed successfully");
      await loadTrustScores(farmerProfile.id);
    } catch (error: any) {
      console.error('Assessment error:', error);
      toast.error(error.message || "Failed to run assessment");
    } finally {
      setIsAssessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="md" className="[&_span]:text-primary-foreground" />
              <h1 className="text-3xl font-bold">AI Risk Assessment</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/farmer')}
              className="bg-white/10 backdrop-blur-sm border-white/30 text-primary-foreground hover:bg-white/20"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {!farmerProfile ? (
          <Card className="max-w-2xl mx-auto p-6">
            <div className="text-center mb-6">
              <User className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Create Farmer Profile</h2>
              <p className="text-muted-foreground">
                Set up your profile to start using AI-powered risk assessment
              </p>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={profileData.phone_number}
                  onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="farm_location">Farm Location</Label>
                <Input
                  id="farm_location"
                  value={profileData.farm_location}
                  onChange={(e) => setProfileData({ ...profileData, farm_location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farm_size_acres">Farm Size (acres)</Label>
                  <Input
                    id="farm_size_acres"
                    type="number"
                    step="0.01"
                    value={profileData.farm_size_acres}
                    onChange={(e) => setProfileData({ ...profileData, farm_size_acres: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="years_farming">Years of Experience</Label>
                  <Input
                    id="years_farming"
                    type="number"
                    value={profileData.years_farming}
                    onChange={(e) => setProfileData({ ...profileData, years_farming: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Create Profile
              </Button>
            </form>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Actions & Data Input */}
            <div className="space-y-6">
              {/* Run Assessment Button */}
              <Card className="p-6">
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Run AI Assessment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Analyze all available data to generate a new trust score
                  </p>
                  <Button 
                    onClick={handleRunAssessment} 
                    disabled={isAssessing}
                    className="w-full"
                  >
                    {isAssessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Run Assessment
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Data Source Form */}
              <DataSourceForm 
                farmerId={farmerProfile.id} 
                onDataAdded={() => toast.success("Data added - ready for next assessment")}
              />
            </div>

            {/* Right Column - Trust Scores */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold">Trust Score History</h2>
              
              {trustScores.length === 0 ? (
                <Card className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Assessments Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add assessment data and run your first AI risk assessment
                  </p>
                </Card>
              ) : (
                trustScores.map((score) => (
                  <TrustScoreCard key={score.id} trustScore={score} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAssessment;