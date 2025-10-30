import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CloudRain, TrendingUp, Bell, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeatherAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  valid_until: string;
}

interface MarketAlert {
  id: string;
  crop_type: string;
  alert_type: string;
  current_price: number;
  predicted_price: number;
  opportunity_details: any;
  action_recommended: string;
}

export const AlertsDashboard = () => {
  const { toast } = useToast();
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    
    // Subscribe to real-time updates
    const weatherChannel = supabase
      .channel('weather-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'weather_alerts'
      }, (payload) => {
        setWeatherAlerts(prev => [payload.new as WeatherAlert, ...prev]);
        toast({
          title: '⚠️ New Weather Alert',
          description: (payload.new as WeatherAlert).title,
        });
      })
      .subscribe();

    const marketChannel = supabase
      .channel('market-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'market_alerts'
      }, (payload) => {
        setMarketAlerts(prev => [payload.new as MarketAlert, ...prev]);
        toast({
          title: '💰 New Market Opportunity',
          description: `${(payload.new as MarketAlert).crop_type} price surge detected`,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(weatherChannel);
      supabase.removeChannel(marketChannel);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const [weatherResponse, marketResponse] = await Promise.all([
        supabase
          .from('weather_alerts')
          .select('*')
          .gte('valid_until', new Date().toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('market_alerts')
          .select('*')
          .gte('valid_until', new Date().toISOString())
          .order('created_at', { ascending: false })
      ]);

      if (weatherResponse.error) throw weatherResponse.error;
      if (marketResponse.error) throw marketResponse.error;

      setWeatherAlerts(weatherResponse.data || []);
      setMarketAlerts(marketResponse.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load alerts',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Proactive Alerts
            </CardTitle>
            <CardDescription>
              Stay informed about weather, market opportunities, and threats
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {weatherAlerts.length + marketAlerts.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weather" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weather">
              <CloudRain className="h-4 w-4 mr-2" />
              Weather ({weatherAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="market">
              <TrendingUp className="h-4 w-4 mr-2" />
              Market ({marketAlerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weather" className="space-y-4 mt-4">
            {weatherAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CloudRain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active weather alerts</p>
              </div>
            ) : (
              weatherAlerts.map(alert => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          <CardTitle className="text-base">{alert.title}</CardTitle>
                        </div>
                        <CardDescription className="mt-1">
                          Valid until {new Date(alert.valid_until).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{alert.message}</p>
                    <Button variant="outline" size="sm">
                      View Recommendations
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-4 mt-4">
            {marketAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No market opportunities at the moment</p>
              </div>
            ) : (
              marketAlerts.map(alert => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{alert.crop_type}</CardTitle>
                        <CardDescription className="mt-1">
                          {alert.alert_type.replace('_', ' ').toUpperCase()}
                        </CardDescription>
                      </div>
                      <Badge variant="default">Opportunity</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="text-lg font-semibold">${alert.current_price}/kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Predicted Price</p>
                        <p className="text-lg font-semibold text-green-600">
                          ${alert.predicted_price}/kg
                        </p>
                      </div>
                    </div>
                    
                    {alert.action_recommended && (
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium mb-1">Recommended Action:</p>
                        <p className="text-sm text-muted-foreground">{alert.action_recommended}</p>
                      </div>
                    )}
                    
                    <Button variant="default" size="sm">
                      Connect with Buyers
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};