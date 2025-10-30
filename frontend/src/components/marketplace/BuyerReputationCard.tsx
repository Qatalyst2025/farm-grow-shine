import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Clock, MessageCircle, ShieldCheck } from "lucide-react";

interface BuyerReputationProps {
  buyer: {
    company_name: string;
    buyer_type: string;
  };
  ratings?: {
    overall_rating: number;
    total_reviews: number;
    payment_speed: number;
    communication: number;
    reliability: number;
    recent_reviews: Array<{
      rating: number;
      review_text: string;
      created_at: string;
    }>;
  };
  onAccept?: (buyerId: string) => void;
}

export function BuyerReputationCard({ buyer, ratings, onAccept }: BuyerReputationProps) {
  const getReputationLevel = (rating: number) => {
    if (rating >= 4.5) return { label: 'Excellent', color: 'text-green-500' };
    if (rating >= 4.0) return { label: 'Very Good', color: 'text-blue-500' };
    if (rating >= 3.5) return { label: 'Good', color: 'text-yellow-500' };
    return { label: 'Fair', color: 'text-orange-500' };
  };

  const reputation = ratings ? getReputationLevel(ratings.overall_rating) : { label: 'New', color: 'text-gray-500' };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{buyer.company_name}</CardTitle>
            <CardDescription className="capitalize">{buyer.buyer_type}</CardDescription>
          </div>
          {ratings && (
            <div className="flex items-center gap-2">
              <Star className={`h-5 w-5 fill-current ${reputation.color}`} />
              <span className={`text-2xl font-bold ${reputation.color}`}>
                {ratings.overall_rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className={reputation.color}>
            {reputation.label} Reputation
          </Badge>
          {ratings && (
            <span className="text-sm text-muted-foreground">
              {ratings.total_reviews} reviews
            </span>
          )}
        </div>

        {ratings ? (
          <>
            {/* Rating Breakdown */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Payment Speed</span>
                  </div>
                  <span className="text-sm font-medium">
                    {ratings.payment_speed.toFixed(1)}
                  </span>
                </div>
                <Progress value={(ratings.payment_speed / 5) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    <span>Communication</span>
                  </div>
                  <span className="text-sm font-medium">
                    {ratings.communication.toFixed(1)}
                  </span>
                </div>
                <Progress value={(ratings.communication / 5) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Reliability</span>
                  </div>
                  <span className="text-sm font-medium">
                    {ratings.reliability.toFixed(1)}
                  </span>
                </div>
                <Progress value={(ratings.reliability / 5) * 100} className="h-2" />
              </div>
            </div>

            {/* Recent Reviews */}
            {ratings.recent_reviews && ratings.recent_reviews.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-medium">Recent Feedback</p>
                {ratings.recent_reviews.slice(0, 2).map((review, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {review.review_text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">New Buyer</p>
              <p className="text-xs text-muted-foreground">
                No reviews yet - be the first to work with them!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
