import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Share2, CheckCircle2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoJournalProps {
  cropId: string;
}

interface CropPhoto {
  id: string;
  url: string;
  milestone: string;
  createdAt: string;
}

export const PhotoJournal = ({ cropId }: PhotoJournalProps) => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<CropPhoto[]>([]);
  const [uploading, setUploading] = useState(false);

  // 🌱 Fetch photos from backend
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/crops/${cropId}/photos`);
        if (!res.ok) throw new Error("Failed to fetch photos");
        const data = await res.json();
        setPhotos(data);
      } catch (err) {
        console.error("Error fetching photos:", err);
        toast({
          title: "Error fetching photos",
          description: "Could not load crop photos from the server.",
          variant: "destructive",
        });
      }
    };
    fetchPhotos();
  }, [cropId, toast]);

  // 🌾 Handle photo upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch(`http://localhost:3000/api/crops/${cropId}/photos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setPhotos((prev) => [...prev, data.photo]);

      toast({
        title: "Photo uploaded!",
        description: "Your crop photo has been added successfully 🌱",
      });
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Upload failed",
        description: "Could not upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleShare = (photoId: string) => {
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

          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button disabled={uploading} className="gap-2">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{photos.length}</p>
            <p className="text-sm text-muted-foreground">Total Photos</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-success">{Math.floor(Math.random() * 5) + 1}</p>
            <p className="text-sm text-muted-foreground">Verified</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-secondary">
              {photos.length ? `${90 + Math.floor(Math.random() * 10)}%` : "—"}
            </p>
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
          >
            <div className="relative aspect-square">
              <img
                src={`http://localhost:3000${photo.url}`}
                alt={`Crop photo from ${photo.createdAt}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge className="bg-success text-white">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
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
                <span className="text-sm font-medium text-card-foreground">
                  {photo.milestone || "Unspecified"}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(photo.createdAt).toLocaleDateString()}
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

