import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera as CameraIcon, Upload, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onPhotoCapture?: (photo: string) => void;
  cropId?: string;
}

export const CameraCapture = ({ onPhotoCapture, cropId }: CameraCaptureProps) => {
  const { toast } = useToast();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const takePicture = async () => {
    try {
      setIsCapturing(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        saveToGallery: true,
        promptLabelHeader: 'Crop Photo',
        promptLabelPhoto: 'Choose from Gallery',
        promptLabelPicture: 'Take Photo'
      });

      const photoUrl = image.dataUrl;
      if (photoUrl) {
        setCapturedPhoto(photoUrl);
        onPhotoCapture?.(photoUrl);
        
        toast({
          title: "Photo captured!",
          description: "Your crop photo has been saved. This will increase your financial score by 5 points.",
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "Camera error",
        description: "Unable to access camera. Please check app permissions.",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const selectFromGallery = async () => {
    try {
      setIsCapturing(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      const photoUrl = image.dataUrl;
      if (photoUrl) {
        setCapturedPhoto(photoUrl);
        onPhotoCapture?.(photoUrl);
        
        toast({
          title: "Photo selected!",
          description: "Photo uploaded successfully.",
        });
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const clearPhoto = () => {
    setCapturedPhoto(null);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4 text-card-foreground">
        Update Crop Progress
      </h3>
      
      {capturedPhoto ? (
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <img 
              src={capturedPhoto} 
              alt="Captured crop" 
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearPhoto}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="bg-success/10 rounded-lg p-4 border border-success/20">
            <p className="text-sm text-success font-medium">
              ✓ Photo ready to upload! This will add 5 points to your financial score.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Button 
            onClick={takePicture}
            disabled={isCapturing}
            className="w-full h-14 text-base touch-manipulation"
          >
            <CameraIcon className="h-5 w-5 mr-2" />
            Take Photo
          </Button>
          <Button 
            onClick={selectFromGallery}
            disabled={isCapturing}
            variant="outline"
            className="w-full h-14 text-base touch-manipulation"
          >
            <Upload className="h-5 w-5 mr-2" />
            Choose from Gallery
          </Button>
        </div>
      )}

      <div className="mt-4 p-3 bg-info/5 rounded-lg border border-info/20">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Take photos in good lighting for best AI analysis results
        </p>
      </div>
    </Card>
  );
};
