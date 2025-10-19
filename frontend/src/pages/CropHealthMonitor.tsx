import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/ui/logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CropHealthDashboard from "@/components/crop-health/CropHealthDashboard";
import ImageUpload from "@/components/crop-health/ImageUpload";
import AlertsList from "@/components/crop-health/AlertsList";
import { Loader2, Plus, Camera, Bell, Activity, ArrowLeft } from "lucide-react";

const CropHealthMonitor = () => {
  const navigate = useNavigate();
  const { cropId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [crop, setCrop] = useState<any>(null);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (crop?.id) {
      // Subscribe to realtime health analysis updates
      const healthChannel = supabase
        .channel('health-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'crop_health_analysis',
            filter: `crop_id=eq.${crop.id}`
          },
          (payload) => {
            setHealthData(prev => [payload.new, ...prev]);
            toast.success("New health analysis received!");
          }
        )
        .subscribe();

      // Subscribe to alerts
      const alertsChannel = supabase
        .channel('alerts-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'crop_alerts',
            filter: `crop_id=eq.${crop.id}`
          },
          () => {
            loadAlerts(crop.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(healthChannel);
        supabase.removeChannel(alertsChannel);
      };
    }
  }, [crop?.id]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
    await loadData(session.user.id);
  };

  const loadData = async (userId: string) => {
    try {
      // Load farmer profile
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

      if (cropId) {
        await loadCropData(cropId, profile.id);
      } else {
        // Load or create default crop
        await loadOrCreateDefaultCrop(profile.id);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCropData = async (cropIdParam: string, farmerId: string) => {
    const { data: cropData, error: cropError } = await supabase
      .from('crops')
      .select('*')
      .eq('id', cropIdParam)
      .eq('farmer_id', farmerId)
      .single();

    if (cropError || !cropData) {
      toast.error('Crop not found');
      navigate('/farmer/risk-assessment');
      return;
    }

    setCrop(cropData);
    await loadHealthData(cropIdParam);
    await loadImages(cropIdParam);
    await loadAlerts(cropIdParam);
  };

  const loadOrCreateDefaultCrop = async (farmerId: string) => {
    let { data: existingCrops } = await supabase
      .from('crops')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingCrops && existingCrops.length > 0) {
      setCrop(existingCrops[0]);
      await loadHealthData(existingCrops[0].id);
      await loadImages(existingCrops[0].id);
      await loadAlerts(existingCrops[0].id);
    } else {
      // Create default crop
      const { data: newCrop, error } = await supabase
        .from('crops')
        .insert({
          farmer_id: farmerId,
          crop_name: 'My First Crop',
          crop_type: 'maize',
          planting_date: new Date().toISOString().split('T')[0],
          land_area_acres: 2.0,
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to create crop');
        return;
      }

      setCrop(newCrop);
      toast.success('Crop created! Upload images to start monitoring.');
    }
  };

  const loadHealthData = async (cropIdParam: string) => {
    const { data, error } = await supabase
      .from('crop_health_analysis')
      .select('*')
      .eq('crop_id', cropIdParam)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading health data:', error);
    } else {
      setHealthData(data || []);
    }
  };

  const loadImages = async (cropIdParam: string) => {
    const { data, error } = await supabase
      .from('crop_images')
      .select('*')
      .eq('crop_id', cropIdParam)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading images:', error);
    } else {
      setImages(data || []);
    }
  };

  const loadAlerts = async (cropIdParam: string) => {
    const { data, error } = await supabase
      .from('crop_alerts')
      .select('*')
      .eq('crop_id', cropIdParam)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading alerts:', error);
    } else {
      setAlerts(data || []);
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
              <div>
                <h1 className="text-3xl font-bold">Crop Health Monitor</h1>
                <p className="text-primary-foreground/80">
                  AI-powered computer vision analysis
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/farmer')}
              className="bg-white/10 backdrop-blur-sm border-white/30 text-primary-foreground hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {crop && (
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
              <TabsTrigger value="dashboard">
                <Activity className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Camera className="mr-2 h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <Bell className="mr-2 h-4 w-4" />
                Alerts
                {alerts.length > 0 && (
                  <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs">
                    {alerts.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {healthData.length > 0 ? (
                healthData.map((data) => (
                  <CropHealthDashboard 
                    key={data.id}
                    healthData={data}
                    cropName={crop.crop_name}
                  />
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Analysis Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Upload crop images to start AI-powered health monitoring
                  </p>
                  <Button onClick={() => document.querySelector<HTMLElement>('[data-state="inactive"][value="upload"]')?.click()}>
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upload">
              <div className="max-w-2xl mx-auto">
                <ImageUpload
                  cropId={crop.id}
                  farmerId={farmerProfile.id}
                  onUploadComplete={() => {
                    loadImages(crop.id);
                    loadHealthData(crop.id);
                  }}
                />

                {images.length > 0 && (
                  <Card className="p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.slice(0, 6).map((img) => (
                        <div key={img.id} className="relative group">
                          <img 
                            src={img.image_url} 
                            alt="Crop"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs">
                              {img.analysis_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="alerts">
              <div className="max-w-4xl mx-auto">
                <AlertsList
                  alerts={alerts}
                  onAlertUpdate={() => loadAlerts(crop.id)}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default CropHealthMonitor;