import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  FileCheck, 
  Truck, 
  CheckCircle,
  AlertTriangle,
  Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckpointTracker } from "./CheckpointTracker";
import { QualityVerification } from "./QualityVerification";
import { DocumentUpload } from "./DocumentUpload";
import { LogisticsDashboard } from "./LogisticsDashboard";

interface BatchDetailsProps {
  batchId: string;
  onBack: () => void;
}

export const BatchDetails = ({ batchId, onBack }: BatchDetailsProps) => {
  const [batch, setBatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBatchDetails();

    const channel = supabase
      .channel(`batch-${batchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supply_chain_batches',
          filter: `id=eq.${batchId}`
        },
        () => loadBatchDetails()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [batchId]);

  const loadBatchDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('supply_chain_batches')
        .select(`
          *,
          crops(*),
          farmer_profiles(*),
          buyer_profiles(*)
        `)
        .eq('id', batchId)
        .single();

      if (error) throw error;
      setBatch(data);
    } catch (error: any) {
      console.error('Error loading batch:', error);
      toast.error('Failed to load batch details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading batch details...</div>;
  }

  if (!batch) {
    return <div className="text-center py-8">Batch not found</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      harvested: 'bg-blue-500',
      in_transit: 'bg-yellow-500',
      quality_check: 'bg-purple-500',
      delivered: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold mb-2">{batch.batch_number}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getStatusColor(batch.current_status)}>
                  {batch.current_status.replace('_', ' ')}
                </Badge>
                {batch.blockchain_topic_id && (
                  <Badge variant="outline">🔗 Blockchain Verified</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Crop</p>
                  <p className="font-medium">{batch.crops?.crop_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium">{batch.quantity_kg}kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quality Grade</p>
                  <p className="font-medium">{batch.initial_quality_grade}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Harvest Date</p>
                  <p className="font-medium">
                    {new Date(batch.harvest_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {batch.spoilage_risk_score !== null && (
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                {batch.spoilage_risk_score < 30 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-sm font-medium">Spoilage Risk</span>
              </div>
              <div className="text-2xl font-bold">{batch.spoilage_risk_score}%</div>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="checkpoints" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
          <TabsTrigger value="checkpoints">
            <MapPin className="mr-2 h-4 w-4" />
            Checkpoints
          </TabsTrigger>
          <TabsTrigger value="quality">
            <CheckCircle className="mr-2 h-4 w-4" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileCheck className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="logistics">
            <Truck className="mr-2 h-4 w-4" />
            Logistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkpoints">
          <CheckpointTracker batchId={batchId} />
        </TabsContent>

        <TabsContent value="quality">
          <QualityVerification batchId={batchId} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentUpload batchId={batchId} />
        </TabsContent>

        <TabsContent value="logistics">
          <LogisticsDashboard batchId={batchId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
