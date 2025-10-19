import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Network, TrendingUp, Shield, Users, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const TrustNetworkDashboard = () => {
  const [trustNode, setTrustNode] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrustData();
  }, []);

  const fetchTrustData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch trust node
      const { data: node } = await supabase
        .from('trust_network_nodes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!node) {
        // Create trust node if doesn't exist
        const { data: newNode, error } = await supabase
          .from('trust_network_nodes')
          .insert({
            user_id: user.id,
            user_type: 'farmer'
          })
          .select()
          .single();

        if (!error) {
          setTrustNode(newNode);
        }
      } else {
        setTrustNode(node);

        // Fetch connections
        const { data: edges } = await supabase
          .from('trust_network_edges')
          .select('*, trust_network_nodes!to_node_id(*)')
          .eq('from_node_id', node.id);

        setConnections(edges || []);
      }
    } catch (error) {
      console.error('Error fetching trust data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'verified': return 'bg-green-500';
      case 'established': return 'bg-blue-500';
      case 'building': return 'bg-yellow-500';
      case 'suspicious': return 'bg-red-500';
      case 'blocked': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return <div>Loading trust network...</div>;
  }

  if (!trustNode) {
    return <div>No trust data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Trust Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Your Trust Score</CardTitle>
            </div>
            <Badge className={getTrustLevelColor(trustNode.trust_level)}>
              {trustNode.trust_level}
            </Badge>
          </div>
          <CardDescription>
            Your reputation score that grows with verified activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Score */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${getTrustScoreColor(trustNode.current_trust_score)}`}>
              {trustNode.current_trust_score}
            </div>
            <p className="text-muted-foreground mt-2">out of 100</p>
            <Progress value={trustNode.current_trust_score} className="mt-4" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{trustNode.verification_count}</div>
              <div className="text-xs text-muted-foreground">Verifications</div>
            </div>

            <div className="bg-muted p-4 rounded-lg text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{trustNode.successful_transactions}</div>
              <div className="text-xs text-muted-foreground">Successful</div>
            </div>

            <div className="bg-muted p-4 rounded-lg text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{trustNode.network_connections}</div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>

            <div className="bg-muted p-4 rounded-lg text-center">
              <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{trustNode.fraud_reports}</div>
              <div className="text-xs text-muted-foreground">Flags</div>
            </div>
          </div>

          {/* How to Improve */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              How to Improve Your Score
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Complete farm ownership verification (+5 points)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Upload regular crop progress photos (+2 points weekly)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Complete transactions successfully (+3 points each)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Build connections in your network (+1 point per connection)</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Network Connections */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>Your Network</CardTitle>
          </div>
          <CardDescription>
            Trusted connections that strengthen your reputation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length > 0 ? (
            <div className="space-y-3">
              {connections.map((conn) => (
                <div key={conn.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium capitalize">
                      {conn.relationship_type} Connection
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Trust Weight: {(conn.trust_weight * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {conn.successful_interactions}/{conn.interaction_count}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Success Rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Network className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No network connections yet</p>
              <p className="text-sm mt-2">
                Complete transactions and verifications to build your network
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};