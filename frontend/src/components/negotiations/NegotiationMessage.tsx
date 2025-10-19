import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, TrendingDown, Check, X, HelpCircle,
  FileText, MapPin, Image as ImageIcon, DollarSign,
  Shield, CheckCircle2, Clock, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface NegotiationMessageProps {
  message: any;
  userType?: "farmer" | "buyer" | "system";
  verified?: boolean;
  trustScore?: number;
  responseTime?: number;
}

export default function NegotiationMessage({ 
  message, 
  userType = "farmer",
  verified = false,
  trustScore = 0,
  responseTime 
}: NegotiationMessageProps) {
  const getMessageIcon = () => {
    switch (message.message_type) {
      case 'offer': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'counter_offer': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'accept': return <Check className="h-4 w-4 text-green-600" />;
      case 'reject': return <X className="h-4 w-4 text-red-600" />;
      case 'question': return <HelpCircle className="h-4 w-4 text-blue-600" />;
      case 'document': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'location_update': return <MapPin className="h-4 w-4 text-primary" />;
      case 'quality_check': return <ImageIcon className="h-4 w-4 text-secondary" />;
      default: return null;
    }
  };

  const getMessageColor = () => {
    // User type color coding
    const baseColor = 
      userType === "buyer" ? "border-l-blue-500" :
      userType === "farmer" ? "border-l-green-500" :
      "border-l-amber-500";

    // Message type overlay
    switch (message.message_type) {
      case 'offer': return `${baseColor} bg-green-50/50 dark:bg-green-950/20`;
      case 'counter_offer': return `${baseColor} bg-orange-50/50 dark:bg-orange-950/20`;
      case 'accept': return `${baseColor} bg-green-100/50 dark:bg-green-900/20`;
      case 'reject': return `${baseColor} bg-red-50/50 dark:bg-red-950/20`;
      default: return `${baseColor} bg-card`;
    }
  };

  return (
    <Card className={cn(
      "p-4 border-l-4 transition-all",
      getMessageColor()
    )}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs">
            {message.sender_id.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm capitalize">
                {userType}
              </span>
              {verified && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </div>

            <Badge variant="outline" className="text-xs">
              {getMessageIcon()}
              <span className="ml-1 capitalize">{message.message_type.replace('_', ' ')}</span>
            </Badge>

            {trustScore > 0 && (
              <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/20">
                <Zap className="h-3 w-3 mr-1 text-amber-600" />
                {trustScore.toFixed(1)} Trust
              </Badge>
            )}

            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>

            {responseTime && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {responseTime}s response
              </Badge>
            )}

            {message.blockchain_hash && (
              <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/20">
                <Shield className="h-3 w-3 mr-1 text-green-600" />
                Blockchain
              </Badge>
            )}
          </div>

          {/* Offer/Counter-Offer Display */}
          {(message.message_type === 'offer' || message.message_type === 'counter_offer') && message.offer_amount && (
            <Card className="p-3 mb-3 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Proposed Amount</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <p className="text-2xl font-bold">${message.offer_amount.toLocaleString()}</p>
                  </div>
                </div>

                {message.offer_expires_at && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Expires</p>
                    <p className="text-xs font-medium">
                      {formatDistanceToNow(new Date(message.offer_expires_at), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </div>

              {message.offer_terms && (
                <div className="mt-3 pt-3 border-t space-y-1">
                  {Object.entries(message.offer_terms).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Document Display */}
          {message.message_type === 'document' && message.document_url && (
            <Card className="p-3 mb-3 border-purple-500/30">
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{message.document_type || 'Document'}</p>
                  <a 
                    href={message.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View Document
                  </a>
                </div>
                {message.document_verified && (
                  <Badge className="bg-green-500 text-white">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </Card>
          )}

          {/* Quality Check Photo */}
          {message.quality_photo_url && (
            <div className="mb-3">
              <img 
                src={message.quality_photo_url} 
                alt="Quality check" 
                className="rounded-lg max-w-sm border-2 border-secondary/20"
              />
              {message.quality_score && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">
                    Quality Score: {message.quality_score}/10
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Location Update */}
          {message.location_description && (
            <Card className="p-3 mb-3 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold mb-1">Location Update</p>
                  <p className="text-xs text-muted-foreground">{message.location_description}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
