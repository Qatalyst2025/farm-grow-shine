import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  Calendar,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock
} from "lucide-react";

interface SmartOffersPanelProps {
  farmerId: string;
}

export function SmartOffersPanel({ farmerId }: SmartOffersPanelProps) {
  const { toast } = useToast();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('match-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmer_buyer_matches',
          filter: `farmer_id=eq.${farmerId}`
        },
        () => loadMatches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmerId]);

  const loadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('farmer_buyer_matches')
        .select(`
          *,
          buyer:buyer_profiles(*)
        `)
        .eq('farmer_id', farmerId)
        .eq('status', 'pending')
        .order('match_score', { ascending: false })
        .limit(5);

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('farmer_buyer_matches')
        .update({ status: 'accepted' })
        .eq('id', matchId);

      if (error) throw error;

      toast({
        title: "Match Accepted",
        description: "The buyer will be notified of your interest"
      });

      loadMatches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Smart Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Smart Offers
          </CardTitle>
          <CardDescription>AI-matched buyer opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No active matches at the moment. Check back soon!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Smart Offers
        </CardTitle>
        <CardDescription>
          AI-matched opportunities based on your crops and market conditions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="p-4 border rounded-lg space-y-3">
              {/* Match Score */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{match.buyer?.company_name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {match.buyer?.buyer_type}
                  </p>
                </div>
                <Badge className={`border ${getScoreColor(match.match_score)}`}>
                  {match.match_score}% Match
                </Badge>
              </div>

              {/* Offer Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Offer Price</p>
                    <p className="font-medium">${match.recommended_price?.toFixed(2)}/kg</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-medium">${match.potential_revenue?.toFixed(0)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="font-medium">{match.distance_km?.toFixed(0)} km</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery</p>
                    <p className="font-medium">
                      {match.delivery_date ? new Date(match.delivery_date).toLocaleDateString() : 'Flexible'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Match Reasons */}
              {match.match_reasons && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Why this match?</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(match.match_reasons).slice(0, 3).map(([key, value]: [string, any]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {key.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAcceptMatch(match.id)}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Accept Offer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Negotiate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
