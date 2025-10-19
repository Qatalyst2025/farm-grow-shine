import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ScoreRadarChartProps {
  scores: {
    satellite: number;
    weather: number;
    financial: number;
    social: number;
    historical: number;
  };
  peerAverage?: {
    satellite: number;
    weather: number;
    financial: number;
    social: number;
    historical: number;
  };
}

export const ScoreRadarChart = ({ scores, peerAverage }: ScoreRadarChartProps) => {
  const data = [
    {
      dimension: 'Satellite\nData',
      you: scores.satellite,
      peers: peerAverage?.satellite || scores.satellite * 0.9,
    },
    {
      dimension: 'Weather\nRisk',
      you: scores.weather,
      peers: peerAverage?.weather || scores.weather * 0.95,
    },
    {
      dimension: 'Financial\nBehavior',
      you: scores.financial,
      peers: peerAverage?.financial || scores.financial * 0.85,
    },
    {
      dimension: 'Social\nTrust',
      you: scores.social,
      peers: peerAverage?.social || scores.social * 0.9,
    },
    {
      dimension: 'Historical\nPerformance',
      you: scores.historical,
      peers: peerAverage?.historical || scores.historical * 0.88,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Dimensional Analysis</CardTitle>
        <CardDescription>
          Your performance across all assessment criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="dimension" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Radar 
              name="You" 
              dataKey="you" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))" 
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Radar 
              name="Peer Average" 
              dataKey="peers" 
              stroke="hsl(var(--secondary))" 
              fill="hsl(var(--secondary))" 
              fillOpacity={0.3}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {Object.entries(scores).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold">{value.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground capitalize">{key}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};