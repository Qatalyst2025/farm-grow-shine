import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Satellite, Cloud, Leaf, DollarSign, Users, BarChart3 } from "lucide-react";

interface DataSourceFormProps {
  farmerId: string;
  onDataAdded: () => void;
}

const DataSourceForm = ({ farmerId, onDataAdded }: DataSourceFormProps) => {
  const [dataType, setDataType] = useState<string>("");
  const [dataJson, setDataJson] = useState<string>("");
  const [confidence, setConfidence] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dataTypes = [
    { value: 'satellite', label: 'Satellite Imagery', icon: Satellite, placeholder: '{"vegetation_index": 0.75, "field_area": 2.5, "crop_health": "good"}' },
    { value: 'weather', label: 'Weather Patterns', icon: Cloud, placeholder: '{"rainfall_mm": 850, "temperature_avg": 28, "season": "wet"}' },
    { value: 'soil', label: 'Soil Quality', icon: Leaf, placeholder: '{"ph_level": 6.5, "nitrogen": "high", "moisture": "adequate"}' },
    { value: 'transaction', label: 'Transaction History', icon: DollarSign, placeholder: '{"total_transactions": 45, "avg_amount": 250, "on_time_payments": 42}' },
    { value: 'social', label: 'Social Verification', icon: Users, placeholder: '{"community_vouches": 12, "cooperative_member": true, "reputation_score": 85}' },
    { value: 'yield_prediction', label: 'Yield Prediction', icon: BarChart3, placeholder: '{"predicted_yield_kg": 1500, "confidence": 0.82, "model": "ML-v2"}' },
  ];

  const selectedType = dataTypes.find(t => t.value === dataType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataType || !dataJson) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Validate JSON
      const parsedData = JSON.parse(dataJson);
      
      setIsSubmitting(true);

      const { error } = await supabase
        .from('assessment_data_sources')
        .insert({
          farmer_id: farmerId,
          data_type: dataType,
          data_json: parsedData,
          confidence_score: confidence ? parseFloat(confidence) : null,
        });

      if (error) throw error;

      toast.success("Assessment data added successfully");
      setDataType("");
      setDataJson("");
      setConfidence("");
      onDataAdded();
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON format");
      } else {
        toast.error(error.message || "Failed to add assessment data");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Add Assessment Data</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="dataType">Data Source Type</Label>
          <Select value={dataType} onValueChange={setDataType}>
            <SelectTrigger>
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              {dataTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dataJson">Data (JSON Format)</Label>
          <Textarea
            id="dataJson"
            value={dataJson}
            onChange={(e) => setDataJson(e.target.value)}
            placeholder={selectedType?.placeholder || '{"key": "value"}'}
            className="font-mono text-sm"
            rows={6}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter data in JSON format
          </p>
        </div>

        <div>
          <Label htmlFor="confidence">Confidence Score (0-100)</Label>
          <Input
            id="confidence"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            placeholder="85.5"
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Adding..." : "Add Assessment Data"}
        </Button>
      </form>
    </Card>
  );
};

export default DataSourceForm;