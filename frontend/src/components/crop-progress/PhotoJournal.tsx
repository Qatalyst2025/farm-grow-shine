import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Share2, CheckCircle2, Calendar, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoJournalProps {
  cropId: string;
}

export const PhotoJournal = ({ cropId }: PhotoJournalProps) => {
  const { toast } = useToast();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  // Mock photo data - in real app, fetch from storage/database
  const photos = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
      date: "2025-10-15",
      milestone: "Flowering",
      verified: true,
      aiDetection: { stage: "Flowering", health: 95, confidence: 98 }
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400",
      date: "2025-10-01",
      milestone: "Vegetative Growth",
      verified: true,
      aiDetection: { stage: "Vegetative", health: 92, confidence: 96 }
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1623587484588-2d85a5ae2ee7?w=400",
      date: "2025-09-15",
      milestone: "Vegetative Growth",
      verified: true,
      aiDetection: { stage: "Vegetative", health: 88, confidence: 94 }
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400",
      date: "2025-08-22",
      milestone: "Germination",
      verified: true,
      aiDetection: { stage: "Germination", health: 90, confidence: 97 }
    }
  ];

  const handleUpload = () => {
    toast({
      title: "Photo Upload",
      description: "Photo uploaded successfully! AI analysis in progress...",
    });
  };

  const handleShare = (photoId: number) => {
    toast({
      title: "Shared to Marketplace",
      description: "Your crop progress has been shared with potential buyers.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-card-foreground">Photo Journal</h3>
            <p className="text-sm text-muted-foreground">
              Upload photos to track growth and verify milestones
            </p>
          </div>
          <Button onClick={handleUpload} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Photo
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{photos.length}</p>
            <p className="text-sm text-muted-foreground">Total Photos</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-success">{photos.filter(p => p.verified).length}</p>
            <p className="text-sm text-muted-foreground">Verified</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-secondary">95%</p>
            <p className="text-sm text-muted-foreground">Avg Health</p>
          </div>
        </div>
      </Card>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card 
            key={photo.id} 
            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setSelectedPhoto(photo.id)}
          >
            <div className="relative aspect-square">
              <img 
                src={photo.url} 
                alt={`Crop photo from ${photo.date}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {photo.verified && (
                  <Badge className="bg-success text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(photo.id);
                  }}
                >
                  <Share2 className="h-3 w-3 mr-2" />
                  Share to Marketplace
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-card-foreground">{photo.milestone}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(photo.date).toLocaleDateString()}
                </div>
              </div>

              {/* AI Detection Results */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">AI Detection:</span>
                  <Badge variant="outline" className="text-xs">{photo.aiDetection.confidence}% confidence</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Health Score:</span>
                  <span className="font-medium text-success">{photo.aiDetection.health}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stage:</span>
                  <span className="font-medium">{photo.aiDetection.stage}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Tips */}
      <Card className="p-6 bg-info/5 border-info/20">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
            <Camera className="h-6 w-6 text-info" />
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-card-foreground">Photo Tips for Best Results</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Take photos in natural daylight for accurate AI analysis</li>
              <li>• Capture close-ups of leaves and overall field views</li>
              <li>• Upload weekly photos to increase your financial score by 5 points</li>
              <li>• Verified milestone photos unlock better loan terms</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
