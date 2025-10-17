import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ScoreHistory {
  id: string;
  overall_score: number;
  risk_category: string;
  change_reason: string;
  triggered_by: string;
  created_at: string;
}

interface ScoreTimelineProps {
  farmerId: string;
}

export const ScoreTimeline = ({ farmerId }: ScoreTimelineProps) => {
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [farmerId]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_score_history')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: true })
        .limit(30);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching score history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || history.length === 0) {
    return null;
  }

  const chartData = history.map(h => ({
    date: new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: h.overall_score,
    fullDate: new Date(h.created_at).toLocaleDateString()
  }));

  const scoreChange = history.length >= 2 
    ? history[history.length - 1].overall_score - history[0].overall_score 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Score History
            </CardTitle>
            <CardDescription>
              Track your credit score changes over time
            </CardDescription>
          </div>
          {scoreChange !== 0 && (
            <Badge variant={scoreChange > 0 ? 'default' : 'destructive'}>
              {scoreChange > 0 ? '+' : ''}{scoreChange} points
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Recent Events */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Recent Changes</h4>
          <div className="space-y-2">
            {history.slice(-5).reverse().map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{event.overall_score}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.triggered_by.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.change_reason}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};