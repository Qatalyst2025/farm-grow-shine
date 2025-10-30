import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertTriangle, Sprout, Calendar, TrendingUp } from "lucide-react";

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
  progress: number;
  health: string;
  expectedHarvest: string;
}

interface ProgressIndicatorsProps {
  crop: Crop;
  milestones: Milestone[];
}

export const ProgressIndicators = ({ crop, milestones }: ProgressIndicatorsProps) => {
  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const daysToHarvest = Math.ceil((new Date(crop.expectedHarvest).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getHealthColor = (health: string) => {
    switch(health) {
      case "healthy": return "text-success";
      case "attention": return "text-warning";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getHealthIcon = (health: string) => {
    switch(health) {
      case "healthy": return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "attention": return <Clock className="h-5 w-5 text-warning" />;
      case "critical": return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default: return <Sprout className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Overall Progress */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
            <h3 className="text-2xl font-bold text-card-foreground">{crop.progress}%</h3>
          </div>
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </div>
        <Progress value={crop.progress} className="mb-3" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current Stage:</span>
          <span className="font-medium text-primary">{crop.stage}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-muted-foreground">Milestones:</span>
          <span className="font-medium">{completedMilestones}/{totalMilestones}</span>
        </div>
      </Card>

      {/* Health Status */}
      <Card className={`p-6 border-l-4 ${
        crop.health === 'healthy' ? 'border-l-success' :
        crop.health === 'attention' ? 'border-l-warning' :
        'border-l-destructive'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Crop Health</p>
            <h3 className={`text-2xl font-bold capitalize ${getHealthColor(crop.health)}`}>
              {crop.health}
            </h3>
          </div>
          <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
            crop.health === 'healthy' ? 'bg-success/10' :
            crop.health === 'attention' ? 'bg-warning/10' :
            'bg-destructive/10'
          }`}>
            {getHealthIcon(crop.health)}
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-muted-foreground">No active threats detected</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-success"></div>
            <span className="text-muted-foreground">Optimal growth conditions</span>
          </div>
        </div>
      </Card>

      {/* Harvest Timeline */}
      <Card className="p-6 border-l-4 border-l-secondary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Expected Harvest</p>
            <h3 className="text-2xl font-bold text-card-foreground">{daysToHarvest} Days</h3>
          </div>
          <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Target Date:</span>
            <span className="font-medium">{new Date(crop.expectedHarvest).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium text-success">On Track</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
