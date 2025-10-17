import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Target, TrendingUp, MapPin, DollarSign, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BuyerMatch {
  id: string;
  farmer_id: string;
  buyer_id: string;
  crop_id: string;
  match_score: number;
  match_reasons: any;
  recommended_price: number;
  potential_revenue: number;
  distance_km: number;
  delivery_date: string;
  status: string;
  created_at: string;
}

interface BuyerMatchesProps {
  cropId: string;
  farmerId: string;
}

export const BuyerMatches = ({ cropId, farmerId }: BuyerMatchesProps) => {
  const [matches, setMatches] = useState<BuyerMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [buyerNames, setBuyerNames] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('farmer_buyer_matches')
        .select('*')
        .eq('crop_id', cropId)
        .order('match_score', { ascending: false });

      if (error) throw error;

      // Fetch buyer names
      if (data && data.length > 0) {
        const buyerIds = [...new Set(data.map(m => m.buyer_id))];
        const { data: buyers } = await supabase
          .from('buyer_profiles')
          .select('id, company_name, buyer_type')
          .in('id', buyerIds);

        const namesMap: Record<string, string> = {};
        buyers?.forEach(b => {
          namesMap[b.id] = `${b.company_name} (${b.buyer_type})`;
        });
        setBuyerNames(namesMap);
      }

      setMatches(data || []);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load buyer matches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMatches = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-buyer-matches', {
        body: { cropId, farmerId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message || "Buyer matches generated successfully",
      });

      fetchMatches();
    } catch (error: any) {
      console.error('Error generating matches:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate buyer matches",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateMatchStatus = async (matchId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('farmer_buyer_matches')
        .update({ status })
        .eq('id', matchId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Match ${status} successfully`,
      });

      fetchMatches();
    } catch (error: any) {
      console.error('Error updating match status:', error);
      toast({
        title: "Error",
        description: "Failed to update match status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500';
      case 'contacted': return 'bg-blue-500';
      case 'negotiating': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    fetchMatches();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('buyer_matches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmer_buyer_matches',
          filter: `crop_id=eq.${cropId}`
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cropId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Smart Buyer Matches
          </h2>
          <p className="text-muted-foreground">AI-powered buyer recommendations for your crops</p>
        </div>
        <Button 
          onClick={generateMatches} 
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding Matches...
            </>
          ) : (
            <>
              <Target className="h-4 w-4" />
              Find Buyers
            </>
          )}
        </Button>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Buyer Matches Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate AI-powered buyer matches based on quality, location, and timing
            </p>
            <Button onClick={generateMatches} disabled={isGenerating}>
              <Target className="h-4 w-4 mr-2" />
              Find Buyers Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{buyerNames[match.buyer_id] as string || 'Loading...'}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">Match Score:</span>
                        <Progress value={match.match_score} className="w-32 h-2" />
                        <span className="text-xs font-medium">{match.match_score}%</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(match.status)}>
                    {match.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {match.match_reasons && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Match Breakdown</h4>
                      {Object.entries(match.match_reasons).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-medium">{value as number}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Financial Details</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Recommended:</span>
                      <span className="font-medium">${match.recommended_price?.toFixed(2)}/kg</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Potential Revenue:</span>
                      <span className="font-bold text-green-600">
                        ${match.potential_revenue?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Distance:</span>
                      <span className="font-medium">{match.distance_km?.toFixed(0)} km</span>
                    </div>
                  </div>
                </div>

                {match.status === 'pending' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      onClick={() => updateMatchStatus(match.id, 'contacted')}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Contact Buyer
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateMatchStatus(match.id, 'rejected')}
                    >
                      Not Interested
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};