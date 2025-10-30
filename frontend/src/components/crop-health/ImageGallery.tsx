import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Satellite, 
  Plane,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  X
} from "lucide-react";

interface ImageData {
  id: string;
  image_url: string;
  image_type: string;
  analysis_status: string;
  captured_at: string;
}

interface ImageGalleryProps {
  images: ImageData[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'satellite': return Satellite;
      case 'drone': return Plane;
      default: return Camera;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'processing': return Loader2;
      case 'failed': return X;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'processing': return 'bg-warning/10 text-warning border-warning/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (images.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Images Yet</h3>
        <p className="text-muted-foreground">
          Upload crop images to start monitoring
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => {
        const TypeIcon = getTypeIcon(image.image_type);
        const StatusIcon = getStatusIcon(image.analysis_status);

        return (
          <Card key={image.id} className="overflow-hidden group">
            <div className="relative aspect-video">
              <img 
                src={image.image_url}
                alt="Crop"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm">
                    {new Date(image.captured_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium capitalize">
                    {image.image_type.replace('_', ' ')}
                  </span>
                </div>
                <Badge className={`${getStatusColor(image.analysis_status)} border`}>
                  <StatusIcon className={`h-3 w-3 mr-1 ${image.analysis_status === 'processing' ? 'animate-spin' : ''}`} />
                  {image.analysis_status}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ImageGallery;