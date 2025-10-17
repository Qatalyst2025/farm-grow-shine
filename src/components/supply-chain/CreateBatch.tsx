import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

interface CreateBatchProps {
  farmerId: string;
  onCancel: () => void;
  onSuccess: (batchId: string) => void;
}

export const CreateBatch = ({ farmerId, onCancel, onSuccess }: CreateBatchProps) => {
  const [crops, setCrops] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cropId: '',
    buyerId: '',
    quantityKg: '',
    harvestDate: new Date().toISOString().split('T')[0],
    initialQualityGrade: 'A'
  });

  useEffect(() => {
    loadData();
  }, [farmerId]);

  const loadData = async () => {
    try {
      const [cropsResult, buyersResult] = await Promise.all([
        supabase
          .from('crops')
          .select('*')
          .eq('farmer_id', farmerId)
          .eq('status', 'active'),
        supabase
          .from('buyer_profiles')
          .select('*')
      ]);

      if (cropsResult.error) throw cropsResult.error;
      if (buyersResult.error) throw buyersResult.error;

      setCrops(cropsResult.data || []);
      setBuyers(buyersResult.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate batch number
      const batchNumber = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Get buyer location for destination
      const buyer = buyers.find(b => b.id === formData.buyerId);

      const { data: batch, error } = await supabase
        .from('supply_chain_batches')
        .insert({
          farmer_id: farmerId,
          crop_id: formData.cropId,
          buyer_id: formData.buyerId || null,
          batch_number: batchNumber,
          quantity_kg: parseFloat(formData.quantityKg),
          harvest_date: formData.harvestDate,
          initial_quality_grade: formData.initialQualityGrade,
          current_status: 'harvested',
          destination_lat: buyer?.location_lat || null,
          destination_lng: buyer?.location_lng || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Batch created successfully!');
      onSuccess(batch.id);
    } catch (error: any) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Create New Batch</h2>
          <p className="text-muted-foreground">
            Start tracking your produce through the supply chain
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="crop">Select Crop *</Label>
          <Select
            value={formData.cropId}
            onValueChange={(value) => setFormData({ ...formData, cropId: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a crop" />
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (
                <SelectItem key={crop.id} value={crop.id}>
                  {crop.crop_name} - {crop.crop_type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyer">Buyer (Optional)</Label>
          <Select
            value={formData.buyerId}
            onValueChange={(value) => setFormData({ ...formData, buyerId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a buyer" />
            </SelectTrigger>
            <SelectContent>
              {buyers.map((buyer) => (
                <SelectItem key={buyer.id} value={buyer.id}>
                  {buyer.company_name} - {buyer.buyer_type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity (kg) *</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.quantityKg}
            onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="harvestDate">Harvest Date *</Label>
          <Input
            id="harvestDate"
            type="date"
            value={formData.harvestDate}
            onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quality">Initial Quality Grade *</Label>
          <Select
            value={formData.initialQualityGrade}
            onValueChange={(value) => setFormData({ ...formData, initialQualityGrade: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Grade A - Premium</SelectItem>
              <SelectItem value="B">Grade B - Good</SelectItem>
              <SelectItem value="C">Grade C - Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Batch
          </Button>
        </div>
      </form>
    </Card>
  );
};
