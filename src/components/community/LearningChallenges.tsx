import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap, CheckCircle, Clock, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  category: string;
  participants: number;
  completed?: boolean;
  progress?: number;
}

export default function LearningChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: '🌱 First Harvest Challenge',
      description: 'Learn soil preparation and plant your first crop',
      difficulty: 'beginner',
      points: 50,
      category: 'Basics',
      participants: 234,
      progress: 60,
    },
    {
      id: '2',
      title: '💧 Smart Irrigation Master',
      description: 'Master modern drip irrigation techniques',
      difficulty: 'intermediate',
      points: 100,
      category: 'Technology',
      participants: 156,
      progress: 30,
    },
    {
      id: '3',
      title: '🤖 AI Farming Pioneer',
      description: 'Use AI tools to optimize your farm operations',
      difficulty: 'advanced',
      points: 200,
      category: 'Innovation',
      participants: 89,
      progress: 0,
    },
    {
      id: '4',
      title: '📱 Market Digital Pro',
      description: 'Sell your first crop through online marketplace',
      difficulty: 'intermediate',
      points: 150,
      category: 'Business',
      participants: 178,
      progress: 45,
    },
  ]);

  const [activeStreak, setActiveStreak] = useState(7);
  const { toast } = useToast();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'advanced': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-muted';
    }
  };

  const handleJoinChallenge = (challenge: Challenge) => {
    toast({
      title: "🎉 Challenge Accepted!",
      description: `You've joined "${challenge.title}". Let's grow together!`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Streak Card */}
      <Card className="bg-gradient-to-br from-orange-500/10 via-rose-500/10 to-pink-500/10 border-orange-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center animate-pulse">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                  {activeStreak} Day Streak!
                </p>
                <p className="text-xs text-muted-foreground">Keep learning to maintain your streak</p>
              </div>
            </div>
            <Badge variant="outline" className="border-orange-500/50 text-orange-500">
              <Zap className="h-3 w-3 mr-1" />
              On Fire!
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Learning Challenges
              </CardTitle>
              <CardDescription>Earn points and level up your farming skills</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {challenges.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                        {challenge.title}
                        {challenge.completed && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {challenge.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          {challenge.points} pts
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {challenge.participants} joined
                        </span>
                      </div>
                    </div>
                  </div>

                  {challenge.progress !== undefined && challenge.progress > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    className="w-full"
                    variant={challenge.progress ? "outline" : "default"}
                    onClick={() => handleJoinChallenge(challenge)}
                  >
                    {challenge.completed ? "View Certificate" : challenge.progress ? "Continue" : "Join Challenge"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
