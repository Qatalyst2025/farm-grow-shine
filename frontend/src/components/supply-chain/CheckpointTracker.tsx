import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Plus, Loader2, CheckCircle, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGeolocation } from "@/hooks/useGeolocation";

interface CheckpointTrackerProps {
  batchId: string;
}

export const CheckpointTracker = ({ batchId }: CheckpointTrackerProps) => {
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { position, getCurrentPosition } = useGeolocation();
  const [formData, setFormData] = useState({
    checkpointType: '',
    notes: ''
  });

  useEffect(() => {
    loadCheckpoints();

    const channel = supabase
      .channel(`checkpoints-${batchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supply_chain_checkpoints',
          filter: `batch_id=eq.${batchId}`
        },
        () => loadCheckpoints()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [batchId]);

  const loadCheckpoints = async () => {
    try {
      const { data, error } = await supabase
        .from('supply_chain_checkpoints')
        .select('*')
        .eq('batch_id', batchId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setCheckpoints(data || []);
    } catch (error: any) {
      console.error('Error loading checkpoints:', error);
      toast.error('Failed to load checkpoints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current location
      await getCurrentPosition();

      if (!position) {
        toast.error('Unable to get current location');
        return;
      }

      // Call verification edge function
      const { data, error } = await supabase.functions.invoke('verify-geolocation', {
        body: {
          batchId,
          checkpointType: formData.checkpointType,
          locationLat: position.coords.latitude,
          locationLng: position.coords.longitude,
          locationAccuracy: position.coords.accuracy,
          metadata: {
            notes: formData.notes,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      if (data.analysis.tamperingDetected) {
        toast.warning('Checkpoint recorded with tampering warnings');
      } else {
        toast.success('Checkpoint verified successfully');
      }

      setIsAdding(false);
      setFormData({ checkpointType: '', notes: '' });
      loadCheckpoints();
    } catch (error: any) {
      console.error('Error creating checkpoint:', error);
      toast.error('Failed to create checkpoint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string, tamperingDetected: boolean) => {
    if (tamperingDetected) {
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    }
    if (status === 'verified') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading checkpoints...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Checkpoint Form */}
      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Checkpoint
        </Button>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">New Checkpoint</h3>
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
              <Label>Checkpoint Type *</Label>
              <Select
                value={formData.checkpointType}
                onValueChange={(value) => setFormData({ ...formData, checkpointType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collection">Collection Point</SelectItem>
                  <SelectItem value="storage">Storage Facility</SelectItem>
                  <SelectItem value="inspection">Inspection Station</SelectItem>
                  <SelectItem value="transit">Transit Point</SelectItem>
                  <SelectItem value="delivery">Delivery Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information..."
              />
            </div>

            {position && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="font-medium mb-1">Current Location:</p>
                <p>Lat: {position.coords.latitude.toFixed(6)}</p>
                <p>Lng: {position.coords.longitude.toFixed(6)}</p>
                <p>Accuracy: ±{position.coords.accuracy.toFixed(0)}m</p>
              </div>
            )}

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
                Verify & Record
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Checkpoints List */}
      <div className="space-y-4">
        {checkpoints.length === 0 ? (
          <Card className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No checkpoints recorded yet</p>
          </Card>
        ) : (
          checkpoints.map((checkpoint, index) => (
            <Card key={checkpoint.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(checkpoint.verification_status, checkpoint.tampering_detected)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold capitalize">
                        {checkpoint.checkpoint_type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(checkpoint.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={checkpoint.tampering_detected ? 'destructive' : 'default'}
                      >
                        {checkpoint.verification_status}
                      </Badge>
                      {checkpoint.verification_score && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Score: {checkpoint.verification_score}/100
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-mono">
                        {checkpoint.location_lat.toFixed(6)}, {checkpoint.location_lng.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Accuracy</p>
                      <p>±{checkpoint.location_accuracy?.toFixed(0) || 'N/A'}m</p>
                    </div>
                  </div>

                  {checkpoint.tampering_detected && checkpoint.tampering_indicators && (
                    <div className="mt-3 p-3 bg-destructive/10 rounded-md text-sm">
                      <p className="font-medium text-destructive mb-1">
                        ⚠️ Tampering Detected
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {checkpoint.tampering_indicators.map((indicator: any, i: number) => (
                          <li key={i}>{indicator.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {checkpoint.notes && (
                    <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                      <p className="font-medium mb-1">Notes:</p>
                      <p>{checkpoint.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {index < checkpoints.length - 1 && (
                <div className="ml-2 mt-4 border-l-2 border-dashed border-muted-foreground/30 h-6" />
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
