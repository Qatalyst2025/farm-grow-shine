import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Cloud, Sun, CloudRain } from "lucide-react";

interface Milestone {
  id: number;
  name: string;
  date: string;
  completed: boolean;
  verified: boolean;
}

interface Crop {
  name: string;
  stage: string;
}

interface CropTimelineProps {
  crop: Crop;
  milestones: Milestone[];
}

export const CropTimeline = ({ crop, milestones }: CropTimelineProps) => {
  // Mock weather data - in real app, integrate with weather API
  const weatherData = [
    { week: "Week 1-2", condition: "sunny", rainfall: "Light", temp: "28°C" },
    { week: "Week 3-4", condition: "rainy", rainfall: "Moderate", temp: "26°C" },
    { week: "Week 5-6", condition: "cloudy", rainfall: "Heavy", temp: "24°C" },
    { week: "Week 7-8", condition: "sunny", rainfall: "Light", temp: "29°C" }
  ];

  const getWeatherIcon = (condition: string) => {
    switch(condition) {
      case "sunny": return <Sun className="h-4 w-4 text-warning" />;
      case "rainy": return <CloudRain className="h-4 w-4 text-info" />;
      default: return <Cloud className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Timeline */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6 text-card-foreground">Crop Lifecycle Timeline</h3>
          
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center h-8 w-8 rounded-full ${
                    milestone.completed 
                      ? 'bg-success text-white' 
                      : milestone.id === milestones.filter(m => m.completed).length + 1
                      ? 'bg-primary text-white animate-pulse'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {milestone.completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : milestone.id === milestones.filter(m => m.completed).length + 1 ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-card-foreground">{milestone.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(milestone.date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {milestone.completed && (
                          <Badge variant="outline" className="border-success text-success">
                            Completed
                          </Badge>
                        )}
                        {milestone.verified && (
                          <Badge variant="outline" className="border-primary text-primary">
                            Verified
                          </Badge>
                        )}
                        {milestone.id === milestones.filter(m => m.completed).length + 1 && !milestone.completed && (
                          <Badge variant="outline" className="border-warning text-warning">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>

                    {milestone.completed && (
                      <div className="mt-3 bg-muted/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-2">Last Update:</p>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span>Photos uploaded • Progress verified • Health check completed</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Weather & Comparison */}
      <div className="space-y-6">
        {/* Weather History */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-card-foreground">Weather History</h3>
          <div className="space-y-4">
            {weatherData.map((weather, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(weather.condition)}
                  <div>
                    <p className="text-sm font-medium">{weather.week}</p>
                    <p className="text-xs text-muted-foreground">{weather.rainfall} rainfall</p>
                  </div>
                </div>
                <span className="text-sm font-medium">{weather.temp}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Regional Comparison */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-card-foreground">Regional Comparison</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Your Progress</span>
                <span className="text-sm font-bold text-primary">65%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Regional Average</span>
                <span className="text-sm font-medium">58%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-muted-foreground rounded-full" style={{ width: '58%' }}></div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
              <p className="text-sm text-success font-medium">
                🎉 You're 7% ahead of farmers in your region!
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Success Factors:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Regular photo updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Timely milestone completion
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Active health monitoring
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
