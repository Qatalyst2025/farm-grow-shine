import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Camera, X, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CameraCapture } from "@/components/mobile/CameraCapture";

interface QualityVerificationProps {
  batchId: string;
}

export const QualityVerification = ({ batchId }: QualityVerificationProps) => {
  const [qualityChecks, setQualityChecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    checkType: '',
    storageTemp: '',
    storageHumidity: '',
    notes: ''
  });

  useEffect(() => {
    loadQualityChecks();

    const channel = supabase
      .channel(`quality-${batchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supply_chain_quality_checks',
          filter: `batch_id=eq.${batchId}`
        },
        () => loadQualityChecks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [batchId]);

  const loadQualityChecks = async () => {
    try {
      const { data, error } = await supabase
        .from('supply_chain_quality_checks')
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQualityChecks(data || []);
    } catch (error: any) {
      console.error('Error loading quality checks:', error);
      toast.error('Failed to load quality checks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCapture = (imageUrl: string) => {
    setCapturedImages([...capturedImages, imageUrl]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const storageConditions = {
        temperature: formData.storageTemp ? parseFloat(formData.storageTemp) : null,
        humidity: formData.storageHumidity ? parseFloat(formData.storageHumidity) : null,
        notes: formData.notes
      };

      // Call quality verification edge function
      const { data, error } = await supabase.functions.invoke('verify-quality', {
        body: {
          batchId,
          checkType: formData.checkType,
          imageUrls: capturedImages,
          storageConditions
        }
      });

      if (error) throw error;

      if (data.analysis.contaminationDetected) {
        toast.warning('Quality check completed with contamination warnings');
      } else {
        toast.success('Quality verified successfully');
      }

      setIsAdding(false);
      setFormData({ checkType: '', storageTemp: '', storageHumidity: '', notes: '' });
      setCapturedImages([]);
      loadQualityChecks();
    } catch (error: any) {
      console.error('Error creating quality check:', error);
      toast.error('Failed to perform quality check');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-500',
      'B': 'bg-blue-500',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'F': 'bg-red-500'
    };
    return colors[grade] || 'bg-gray-500';
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading quality checks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Quality Check Form */}
      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Perform Quality Check
        </Button>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">New Quality Check</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAdding(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Check Type *</Label>
              <Select
                value={formData.checkType}
                onValueChange={(value) => setFormData({ ...formData, checkType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual Inspection</SelectItem>
                  <SelectItem value="freshness">Freshness Assessment</SelectItem>
                  <SelectItem value="contamination">Contamination Check</SelectItem>
                  <SelectItem value="storage">Storage Compliance</SelectItem>
                  <SelectItem value="handling">Handling Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Storage Temp (°C)</Label>
                <input
                  type="number"
                  step="0.1"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.storageTemp}
                  onChange={(e) => setFormData({ ...formData, storageTemp: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Humidity (%)</Label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.storageHumidity}
                  onChange={(e) => setFormData({ ...formData, storageHumidity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional observations..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Capture Images</Label>
              <CameraCapture onPhotoCapture={handleImageCapture} />
              {capturedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {capturedImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Capture ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdding(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Quality
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Quality Checks List */}
      <div className="space-y-4">
        {qualityChecks.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No quality checks performed yet</p>
          </Card>
        ) : (
          qualityChecks.map((check) => (
            <Card key={check.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold capitalize mb-1">
                    {check.check_type.replace('_', ' ')} Check
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(check.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={getGradeColor(check.quality_grade)}>
                    Grade {check.quality_grade}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Score: {check.quality_score}/100
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {check.freshness_score !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Freshness</p>
                    <p className="font-medium">{check.freshness_score}/100</p>
                  </div>
                )}
                {check.ai_confidence !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">AI Confidence</p>
                    <p className="font-medium">{(check.ai_confidence * 100).toFixed(0)}%</p>
                  </div>
                )}
              </div>

              {check.contamination_detected && (
                <div className="p-3 bg-destructive/10 rounded-md mb-4">
                  <p className="font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Contamination Detected: {check.contamination_type}
                  </p>
                </div>
              )}

              {check.recommendations && check.recommendations.length > 0 && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="font-medium text-sm mb-2">Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {check.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
