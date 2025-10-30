import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Camera, MapPin, Upload, Loader2, Shield, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FarmVerificationFormProps {
  farmerId: string;
  onVerificationComplete?: () => void;
}

export const FarmVerificationForm = ({ farmerId, onVerificationComplete }: FarmVerificationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const { position, getCurrentPosition } = useGeolocation();
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current location
      await getCurrentPosition();

      if (!position) {
        toast({
          title: "Location Required",
          description: "Please enable location services for verification",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Upload images to storage
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${farmerId}/${Date.now()}_${Math.random()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('crop-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('crop-images')
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // Call verification edge function
      const { data, error } = await supabase.functions.invoke('verify-farm-ownership', {
        body: {
          farmerId,
          imageUrls,
          geolocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString()
          },
          metadata: {
            notes,
            deviceInfo: navigator.userAgent,
            submissionTime: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      setVerificationResult(data.analysis);
      toast({
        title: "Verification Submitted",
        description: data.message || "Your farm has been verified successfully",
      });

      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit verification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Farm Ownership Verification</CardTitle>
          </div>
          <CardDescription>
            Upload geotagged photos of your farm to verify ownership and authenticity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!verificationResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Location Info */}
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  {position
                    ? `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)} (±${position.coords.accuracy.toFixed(0)}m)`
                    : 'Getting location...'}
                </AlertDescription>
              </Alert>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="images">Farm Photos (Required)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Camera className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload 2-5 recent photos showing your farm, crops, and identifying features
                </p>
                {images.length > 0 && (
                  <p className="text-sm text-green-600">
                    {images.length} image{images.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe your farm, any recent changes, or additional context..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={isSubmitting || images.length === 0} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit for Verification
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert className={verificationResult.verificationStatus === 'verified' ? 'border-green-500' : 'border-yellow-500'}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Verification Status:</strong> {verificationResult.verificationStatus}
                  <br />
                  <strong>Score:</strong> {verificationResult.verificationScore}/100
                </AlertDescription>
              </Alert>

              {verificationResult.fraudFlags && verificationResult.fraudFlags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Flags Detected:</h4>
                  {verificationResult.fraudFlags.map((flag: any, index: number) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>
                        <strong>{flag.type}:</strong> {flag.description}
                        <br />
                        <span className="text-xs">Confidence: {(flag.confidence * 100).toFixed(0)}%</span>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">AI Analysis:</h4>
                <ul className="space-y-1 text-sm">
                  <li>Authenticity: {verificationResult.aiAnalysis.authenticityScore}/100</li>
                  <li>Consistency: {verificationResult.aiAnalysis.consistencyScore}/100</li>
                  <li>Risk Level: {verificationResult.aiAnalysis.riskLevel}</li>
                </ul>
              </div>

              <Button onClick={() => setVerificationResult(null)} variant="outline" className="w-full">
                Submit Another Verification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};