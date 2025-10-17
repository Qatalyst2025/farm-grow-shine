import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Calendar, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BatchListProps {
  farmerId: string;
  onSelectBatch: (batchId: string) => void;
}

export const BatchList = ({ farmerId, onSelectBatch }: BatchListProps) => {
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBatches();

    const channel = supabase
      .channel('batches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supply_chain_batches',
          filter: `farmer_id=eq.${farmerId}`
        },
        () => loadBatches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmerId]);

  const loadBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('supply_chain_batches')
        .select(`
          *,
          crops(crop_name, crop_type),
          buyer_profiles(company_name)
        `)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error: any) {
      console.error('Error loading batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return <div className="text-center py-8">Loading batches...</div>;
  }

  if (batches.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Batches Yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first supply chain batch to start tracking
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {batches.map((batch) => (
        <Card
          key={batch.id}
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelectBatch(batch.id)}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{batch.batch_number}</h3>
              <p className="text-sm text-muted-foreground">
                {batch.crops?.crop_name || 'Unknown Crop'}
              </p>
            </div>
            <Badge className={getStatusColor(batch.current_status)}>
              {batch.current_status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>{batch.quantity_kg}kg</span>
            </div>

            {batch.buyer_profiles && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{batch.buyer_profiles.company_name}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Harvest: {new Date(batch.harvest_date).toLocaleDateString()}
              </span>
            </div>

            {batch.spoilage_risk_score !== null && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>Risk Score: {batch.spoilage_risk_score}</span>
              </div>
            )}
          </div>

          {batch.blockchain_topic_id && (
            <div className="mt-4 pt-4 border-t">
              <Badge variant="outline" className="text-xs">
                🔗 Blockchain Verified
              </Badge>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
