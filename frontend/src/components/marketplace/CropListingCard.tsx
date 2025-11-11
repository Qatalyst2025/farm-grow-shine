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

export const CropListingCard = ({
  listing,
  onMakeOffer,
}: CropListingCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const priceComparison = (
    ((listing.currentPrice - listing.marketAverage) / listing.marketAverage) *
    100
  ).toFixed(1);
  const isGoodDeal = parseFloat(priceComparison) < 0;

  return (
    <Card className="overflow-hidden w-full max-w-sm bg-foreground-muted rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300">
     
      <div className="relative">
        <img
          src={listing.images[0]}
          alt={listing.cropName}
          className="w-full h-56 object-cover"
        />
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 bg-foreground-muted  rounded-full p-2 shadow-sm hover:scale-105 transition"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
        </button>

       
        <div className="absolute bottom-3 left-3 flex gap-2">
          {listing.certifications.map((cert) => (
            <Badge
              key={cert}
              className="bg-muted text-primary hover:text-secondary text-sm flex items-center gap-1"
            >
              <Shield className="h-3 w-3 text-green-600 hover:text-secondary" /> {cert}
            </Badge>
          ))}
        </div>
      </div>

      
      <div className="p-4 space-y-4">
       
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-800">
            {listing.cropName}
          </h2>
          <div className="text-right">
            <p className="text-primary text-xl font-bold">
              ${listing.currentPrice}
            </p>
            <p className="text-xs text-gray-400">per ton</p>
          </div>
        </div>

       
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {listing.farmerInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{listing.farmerName}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{listing.farmerRating}</span>
              <span>(24 reviews)</span>
            </div>
          </div>
        </div>

        
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>Harvest: {listing.harvestDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-600" />
            <span>{listing.progress.stage}</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mt-2 mb-1">
              <span>Growth Progress</span>
              <span>{listing.progress.percentage}%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${listing.progress.percentage}%` }}
              />
            </div>
          </div>
        </div>

     
        <div className="flex items-center justify-between p-3 bg-foreground-muted rounded-lg">
          <span className="text-sm font-medium text-gray-700">
            Quality Rating
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < listing.quality
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

     
        <div className="flex justify-between items-center">
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isGoodDeal ? "text-primary" : "text-secondary"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            {isGoodDeal ? "" : "+"}
            {priceComparison}%
          </div>
          <span className="text-xs text-gray-400">vs market avg</span>
        </div>

       
        {listing.bidEndTime && (
          <div className="flex items-center gap-2 text-sm text-secondary">
            <Clock className="h-4 w-4" />
            <span>Bid ends in {listing.bidEndTime}</span>
          </div>
        )}

       
        <div className="grid grid-cols-2 gap-3 pt-3">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" /> Message
          </Button>
          <Button
            className="w-full "
            variant="secondary"
            onClick={() => onMakeOffer(listing.id)}
          >
            Make Offer
          </Button>
        </div>
      </div>
    </Card>
  );
};
