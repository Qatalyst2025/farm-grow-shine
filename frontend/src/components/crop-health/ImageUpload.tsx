import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Camera, Upload, Loader2, Satellite, Plane } from "lucide-react";

interface ImageUploadProps {
  cropId: string;
  farmerId: string;
  onUploadComplete: () => void;
}

const ImageUpload = ({ cropId, farmerId, onUploadComplete }: ImageUploadProps) => {
  const [imageType, setImageType] = useState<string>("ground_photo");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageTypes = [
    { value: 'ground_photo', label: 'Ground Photo', icon: Camera },
    { value: 'satellite', label: 'Satellite Image', icon: Satellite },
    { value: 'drone', label: 'Drone Image', icon: Plane },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${cropId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('crop-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName);

      // Save image record to database
      const { data: imageRecord, error: dbError } = await supabase
        .from('crop_images')
        .insert({
          crop_id: cropId,
          farmer_id: farmerId,
          image_url: publicUrl,
          image_type: imageType,
          analysis_status: 'pending',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('Image uploaded successfully');

      // Trigger AI analysis
      const { error: analysisError } = await supabase.functions.invoke('analyze-crop-image', {
        body: {
          imageId: imageRecord.id,
          imageUrl: publicUrl,
          cropId: cropId,
        }
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        toast.warning('Image uploaded but analysis failed. Please try again later.');
      } else {
        toast.success('AI analysis started - results coming soon!');
      }

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadComplete();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const selectedType = imageTypes.find(t => t.value === imageType);
  const TypeIcon = selectedType?.icon || Camera;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Crop Image
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload photos for AI-powered health analysis
          </p>
        </div>

        <div>
          <Label htmlFor="imageType">Image Type</Label>
          <Select value={imageType} onValueChange={setImageType}>
            <SelectTrigger>
              <SelectValue placeholder="Select image type" />
            </SelectTrigger>
            <SelectContent>
              {imageTypes.map((type) => {
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg object-contain"
                  />
                  <p className="text-sm text-muted-foreground">
                    {selectedFile?.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <TypeIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Click to select image</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading & Analyzing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload & Analyze
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          AI will automatically analyze your image for pests, diseases, and growth stage
        </p>
      </div>
    </Card>
  );
};

export default ImageUpload;