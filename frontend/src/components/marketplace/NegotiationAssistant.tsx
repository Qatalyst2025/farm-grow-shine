import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Handshake, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Target,
  Lightbulb
} from "lucide-react";

interface NegotiationAssistantProps {
  cropType: string;
  marketPrice: number;
  recommendedPrice: number;
  buyerOffer?: number;
}

export function NegotiationAssistant({ 
  cropType, 
  marketPrice, 
  recommendedPrice,
  buyerOffer 
}: NegotiationAssistantProps) {
  const [counterOffer, setCounterOffer] = useState<string>('');

  const priceGap = buyerOffer ? ((recommendedPrice - buyerOffer) / buyerOffer) * 100 : 0;
  const isGoodDeal = buyerOffer ? buyerOffer >= recommendedPrice * 0.95 : false;

  const getNegotiationTips = () => {
    if (!buyerOffer) {
      return [
        {
          type: 'strategy',
          title: 'Start Strong',
          tip: `Begin negotiations at $${(recommendedPrice * 1.1).toFixed(2)}/kg to leave room for compromise`,
          icon: Target
        },
        {
          type: 'leverage',
          title: 'Highlight Quality',
          tip: 'Emphasize your crop quality, certifications, and delivery reliability',
          icon: CheckCircle2
        },
        {
          type: 'timing',
          title: 'Market Conditions',
          tip: `Current market average is $${marketPrice.toFixed(2)}/kg - use this as your baseline`,
          icon: TrendingUp
        }
      ];
    }

    if (isGoodDeal) {
      return [
        {
          type: 'accept',
          title: 'Strong Offer',
          tip: `This offer is at ${((buyerOffer / recommendedPrice) * 100).toFixed(0)}% of market value - consider accepting`,
          icon: CheckCircle2
        },
        {
          type: 'leverage',
          title: 'Quick Close',
          tip: 'You can request faster payment terms or confirm delivery details before accepting',
          icon: Handshake
        }
      ];
    }

    return [
      {
        type: 'counter',
        title: 'Counter Offer Suggested',
        tip: `Counter at $${((buyerOffer + recommendedPrice) / 2).toFixed(2)}/kg - midpoint between offer and market`,
        icon: Target
      },
      {
        type: 'justify',
        title: 'Justification Points',
        tip: `Buyer's offer is ${Math.abs(priceGap).toFixed(0)}% below market - cite quality, delivery reliability, or volume flexibility`,
        icon: AlertCircle
      },
      {
        type: 'alternative',
        title: 'Alternative Terms',
        tip: 'If price is fixed, negotiate for advance payment, longer contract, or bulk discounts on future orders',
        icon: Lightbulb
      }
    ];
  };

  const tips = getNegotiationTips();

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="h-5 w-5" />
          Negotiation Assistant
        </CardTitle>
        <CardDescription>
          AI-powered negotiation guidance and deal optimization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Market Average</span>
            <span className="text-lg font-bold">${marketPrice.toFixed(2)}/kg</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium">Recommended Price</span>
            <span className="text-lg font-bold text-primary">${recommendedPrice.toFixed(2)}/kg</span>
          </div>

          {buyerOffer && (
            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              isGoodDeal 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-yellow-500/10 border-yellow-500/20'
            }`}>
              <span className="text-sm font-medium">Buyer's Offer</span>
              <div className="text-right">
                <span className="text-lg font-bold">${buyerOffer.toFixed(2)}/kg</span>
                <Badge 
                  variant="outline" 
                  className={`ml-2 ${isGoodDeal ? 'text-green-500' : 'text-yellow-500'}`}
                >
                  {priceGap > 0 ? '-' : '+'}{Math.abs(priceGap).toFixed(0)}%
                </Badge>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Negotiation Tips */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Smart Negotiation Tips:</p>
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">{tip.title}</p>
                  <p className="text-xs text-muted-foreground">{tip.tip}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Counter Offer Input */}
        {buyerOffer && !isGoodDeal && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label htmlFor="counter">Your Counter Offer</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="counter"
                    type="number"
                    placeholder="Enter price per kg"
                    value={counterOffer}
                    onChange={(e) => setCounterOffer(e.target.value)}
                    className="pl-9"
                    step="0.01"
                  />
                </div>
                <Button disabled={!counterOffer}>
                  Send Counter
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                AI suggests: ${((buyerOffer + recommendedPrice) / 2).toFixed(2)}/kg as a fair middle ground
              </p>
            </div>
          </>
        )}

        {isGoodDeal && buyerOffer && (
          <div className="flex items-center gap-2 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Excellent Offer
              </p>
              <p className="text-xs text-muted-foreground">
                This is a fair deal - consider accepting to close quickly
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
