import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, Star, Target, Zap, Crown, Medal, TrendingUp } from "lucide-react";

interface UserProgress {
  totalPoints: number;
  coursesCompleted: number;
  videosWatched: number;
  quizzesPassed: number;
  rank: string;
}

interface AchievementSystemProps {
  userProgress: UserProgress;
}

export const AchievementSystem = ({ userProgress }: AchievementSystemProps) => {
  const achievements = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first course",
      icon: Star,
      points: 100,
      unlocked: true,
      unlockedDate: "2025-09-15",
      color: "success"
    },
    {
      id: 2,
      name: "Knowledge Seeker",
      description: "Watch 10 educational videos",
      icon: Award,
      points: 150,
      unlocked: true,
      unlockedDate: "2025-09-28",
      color: "primary"
    },
    {
      id: 3,
      name: "Quiz Master",
      description: "Pass 5 quizzes with 100% score",
      icon: Target,
      points: 200,
      unlocked: true,
      unlockedDate: "2025-10-05",
      color: "secondary"
    },
    {
      id: 4,
      name: "Dedicated Learner",
      description: "Complete 3 full courses",
      icon: Trophy,
      points: 300,
      unlocked: true,
      unlockedDate: "2025-10-12",
      color: "warning"
    },
    {
      id: 5,
      name: "Speed Learner",
      description: "Complete a course in under 2 hours",
      icon: Zap,
      points: 250,
      unlocked: false,
      progress: 85,
      color: "info"
    },
    {
      id: 6,
      name: "Master Farmer",
      description: "Complete all advanced courses",
      icon: Crown,
      points: 500,
      unlocked: false,
      progress: 40,
      color: "warning"
    }
  ];

  const leaderboard = [
    { rank: 1, name: "Amina K.", region: "Northern", points: 1450, avatar: "🏆" },
    { rank: 2, name: "Kwame M.", region: "Ashanti", points: 1280, avatar: "🥈" },
    { rank: 3, name: "Ama B.", region: "Greater Accra", points: 1120, avatar: "🥉" },
    { rank: 4, name: "Joseph A.", region: "Central", points: 950, avatar: "👤" },
    { rank: 5, name: "You", region: "Your Region", points: userProgress.totalPoints, avatar: "👨‍🌾", isCurrentUser: true }
  ];

  const ranks = [
    { name: "Beginner", minPoints: 0, maxPoints: 299, color: "bg-muted" },
    { name: "Learner", minPoints: 300, maxPoints: 599, color: "bg-success" },
    { name: "Advanced Learner", minPoints: 600, maxPoints: 999, color: "bg-primary" },
    { name: "Expert", minPoints: 1000, maxPoints: 1499, color: "bg-secondary" },
    { name: "Master", minPoints: 1500, maxPoints: 9999, color: "bg-warning" }
  ];

  const currentRank = ranks.find(r => userProgress.totalPoints >= r.minPoints && userProgress.totalPoints <= r.maxPoints);
  const nextRank = ranks.find(r => r.minPoints > userProgress.totalPoints);
  const progressToNextRank = nextRank 
    ? ((userProgress.totalPoints - (currentRank?.minPoints || 0)) / ((nextRank.minPoints - (currentRank?.minPoints || 0)))) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Rank Progress */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-card-foreground">Your Rank</h3>
            <p className="text-3xl font-bold text-primary mt-2">{currentRank?.name}</p>
          </div>
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
        </div>

        {nextRank && (
          <>
            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress to {nextRank.name}</span>
                <span className="font-medium">{userProgress.totalPoints} / {nextRank.minPoints} points</span>
              </div>
              <Progress value={progressToNextRank} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              {nextRank.minPoints - userProgress.totalPoints} points until next rank!
            </p>
          </>
        )}
      </Card>

      {/* Achievements Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-foreground">Your Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => {
            const IconComponent = achievement.icon;
            return (
              <Card 
                key={achievement.id} 
                className={`p-6 ${achievement.unlocked ? 'border-l-4 border-l-success' : 'opacity-60'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? 'bg-success/10' : 'bg-muted'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      achievement.unlocked ? 'text-success' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-card-foreground">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant={achievement.unlocked ? "default" : "outline"}>
                        {achievement.points} pts
                      </Badge>
                    </div>

                    {achievement.unlocked ? (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <Medal className="h-4 w-4" />
                        <span>Unlocked {new Date(achievement.unlockedDate!).toLocaleDateString()}</span>
                      </div>
                    ) : achievement.progress !== undefined ? (
                      <>
                        <Progress value={achievement.progress} className="h-2 mb-1" />
                        <p className="text-xs text-muted-foreground">{achievement.progress}% complete</p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not yet unlocked</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-foreground">Regional Leaderboard</h3>
        <Card className="p-6">
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div 
                key={entry.rank}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  entry.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-muted-foreground w-8">
                    #{entry.rank}
                  </div>
                  <div className="text-2xl">{entry.avatar}</div>
                  <div>
                    <p className={`font-semibold ${entry.isCurrentUser ? 'text-primary' : 'text-card-foreground'}`}>
                      {entry.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{entry.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-card-foreground">{entry.points}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>

          {userProgress.totalPoints < 850 && (
            <div className="mt-4 p-4 bg-info/10 rounded-lg border border-info/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-info mt-0.5" />
                <div>
                  <p className="font-medium text-card-foreground mb-1">Climb the Leaderboard!</p>
                  <p className="text-sm text-muted-foreground">
                    Complete one more course to move up 2 positions and unlock exclusive benefits
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
