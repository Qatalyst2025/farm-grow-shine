import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, FileCheck, Truck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BatchList } from "@/components/supply-chain/BatchList";
import { BatchDetails } from "@/components/supply-chain/BatchDetails";
import { CreateBatch } from "@/components/supply-chain/CreateBatch";

const SupplyChainTracker = () => {
  const navigate = useNavigate();
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          <Package className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading supply chain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Supply Chain Tracker</h1>
                <p className="text-primary-foreground/80">
                  AI-powered verification and transparency
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateBatch(true)}
              className="bg-white text-primary hover:bg-white/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Batch
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {showCreateBatch ? (
          <CreateBatch
            farmerId={farmerProfile.id}
            onCancel={() => setShowCreateBatch(false)}
            onSuccess={(batchId) => {
              setShowCreateBatch(false);
              setSelectedBatch(batchId);
              toast.success('Batch created successfully');
            }}
          />
        ) : selectedBatch ? (
          <BatchDetails
            batchId={selectedBatch}
            onBack={() => setSelectedBatch(null)}
          />
        ) : (
          <BatchList
            farmerId={farmerProfile.id}
            onSelectBatch={setSelectedBatch}
          />
        )}
      </div>
    </div>
  );
};

export default SupplyChainTracker;
