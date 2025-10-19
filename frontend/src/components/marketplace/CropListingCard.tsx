import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Star, 
  Shield, 
  Leaf, 
  Clock, 
  TrendingUp,
  MessageSquare,
  Heart,
  Eye
} from "lucide-react";
import { useState } from "react";

interface CropListing {
  id: string;
  cropName: string;
  farmerName: string;
  farmerRating: number;
  farmerInitials: string;
  images: string[];
  currentPrice: number;
  marketAverage: number;
  harvestDate: string;
  quality: number;
  certifications: string[];
  progress: {
    stage: string;
    percentage: number;
  };
  bidEndTime?: string;
}

interface CropListingCardProps {
  listing: CropListing;
  onMakeOffer: (id: string) => void;
}

export const CropListingCard = ({ listing, onMakeOffer }: CropListingCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const priceComparison = ((listing.currentPrice - listing.marketAverage) / listing.marketAverage * 100).toFixed(1);
  const isGoodDeal = parseFloat(priceComparison) < 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] group">
      {/* Image Gallery */}
      <div className="relative h-48 bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-success/20" />
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 flex gap-2">
          {listing.certifications.map((cert) => (
            <Badge key={cert} variant="secondary" className="bg-white/90">
              <Shield className="h-3 w-3 mr-1 text-success" />
              {cert}
            </Badge>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Farmer Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {listing.farmerInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-card-foreground">{listing.farmerName}</h3>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span className="text-sm font-medium">{listing.farmerRating}</span>
                <span className="text-xs text-muted-foreground">(24 reviews)</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Crop Details */}
        <div>
          <h4 className="text-xl font-bold text-card-foreground mb-1">{listing.cropName}</h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Harvest: {listing.harvestDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Leaf className="h-4 w-4" />
              <span>{listing.progress.stage}</span>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Growth Progress</span>
            <span className="font-medium">{listing.progress.percentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-success h-2 rounded-full transition-all"
              style={{ width: `${listing.progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Quality Rating */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Quality Rating</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < listing.quality ? "fill-warning text-warning" : "text-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold text-primary">${listing.currentPrice}</span>
              <span className="text-sm text-muted-foreground ml-2">per ton</span>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 text-sm font-medium ${isGoodDeal ? "text-success" : "text-destructive"}`}>
                <TrendingUp className="h-4 w-4" />
                {isGoodDeal ? "" : "+"}{priceComparison}%
              </div>
              <span className="text-xs text-muted-foreground">vs market avg</span>
            </div>
          </div>
          
          {listing.bidEndTime && (
            <div className="flex items-center gap-2 text-sm text-warning">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Bid ends in {listing.bidEndTime}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button className="flex-1" onClick={() => onMakeOffer(listing.id)}>
            Make Offer
          </Button>
        </div>
      </div>
    </Card>
  );
};
