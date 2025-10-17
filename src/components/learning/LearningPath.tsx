import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Lock, BookOpen, Video, FileText, PlayCircle } from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'article' | 'interactive';
  status: 'completed' | 'current' | 'locked';
  progress?: number;
}

interface LearningPathProps {
  level: 'beginner' | 'intermediate' | 'advanced';
}

const learningPaths = {
  beginner: [
    {
      id: '1',
      title: 'Understanding Your Soil',
      description: 'Learn how to test and improve soil quality',
      duration: '15 min',
      type: 'video' as const,
      status: 'completed' as const,
      progress: 100
    },
    {
      id: '2',
      title: 'Choosing the Right Crops',
      description: 'Match crops to your climate and market',
      duration: '20 min',
      type: 'interactive' as const,
      status: 'current' as const,
      progress: 65
    },
    {
      id: '3',
      title: 'Basic Pest Management',
      description: 'Natural methods to protect your crops',
      duration: '25 min',
      type: 'video' as const,
      status: 'locked' as const
    },
    {
      id: '4',
      title: 'Water Conservation Techniques',
      description: 'Maximize water efficiency on your farm',
      duration: '18 min',
      type: 'article' as const,
      status: 'locked' as const
    }
  ],
  intermediate: [
    {
      id: '5',
      title: 'Advanced Crop Rotation',
      description: 'Optimize soil health and yields',
      duration: '30 min',
      type: 'video' as const,
      status: 'current' as const,
      progress: 40
    },
    {
      id: '6',
      title: 'Integrated Pest Management',
      description: 'Comprehensive pest control strategies',
      duration: '35 min',
      type: 'interactive' as const,
      status: 'locked' as const
    }
  ],
  advanced: [
    {
      id: '7',
      title: 'Precision Agriculture',
      description: 'Using technology to optimize farming',
      duration: '45 min',
      type: 'video' as const,
      status: 'locked' as const
    }
  ]
};

export const LearningPath = ({ level }: LearningPathProps) => {
  const modules = learningPaths[level];
  const totalModules = modules.length;
  const completedModules = modules.filter(m => m.status === 'completed').length;
  const overallProgress = (completedModules / totalModules) * 100;

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'interactive': return PlayCircle;
      default: return BookOpen;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'current': return Circle;
      case 'locked': return Lock;
      default: return Circle;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Learning Path</CardTitle>
            <CardDescription>
              {level.charAt(0).toUpperCase() + level.slice(1)} Level
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {completedModules}/{totalModules} Complete
          </Badge>
        </div>
        <div className="mt-4">
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(overallProgress)}% of this level completed
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {modules.map((module, index) => {
            const StatusIcon = getStatusIcon(module.status);
            const TypeIcon = getIcon(module.type);
            const isLocked = module.status === 'locked';
            const isCurrent = module.status === 'current';

            return (
              <Card 
                key={module.id}
                className={`relative ${
                  isCurrent ? 'border-primary border-2' : ''
                } ${isLocked ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      module.status === 'completed' 
                        ? 'bg-success/10 text-success'
                        : module.status === 'current'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {index + 1}. {module.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {module.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {module.duration}
                        </Badge>
                      </div>

                      {module.progress !== undefined && module.progress > 0 && module.progress < 100 && (
                        <div className="mb-3">
                          <Progress value={module.progress} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {module.progress}% complete
                          </p>
                        </div>
                      )}

                      <Button 
                        variant={isCurrent ? 'default' : isLocked ? 'ghost' : 'outline'}
                        size="sm"
                        disabled={isLocked}
                      >
                        {module.status === 'completed' 
                          ? 'Review' 
                          : module.status === 'current'
                          ? 'Continue Learning'
                          : 'Start Module'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};