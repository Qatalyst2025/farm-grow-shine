import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Trophy,
  Star,
  Zap,
  Target,
  BookOpen,
  Users,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format } from "date-fns";

interface AchievementBadgesProps {
  userId: string;
  compact?: boolean;
}

export default function AchievementBadges({
  userId,
  compact = false,
}: AchievementBadgesProps) {
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    const { data } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })
      .limit(compact ? 3 : 10);

    if (data) {
      setAchievements(data);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "first_question":
        return <Star className="h-3 w-3" />;
      case "helpful_response":
        return <Award className="h-3 w-3" />;
      case "expert_contributor":
        return <Trophy className="h-3 w-3" />;
      case "active_learner":
        return <BookOpen className="h-3 w-3" />;
      case "community_builder":
        return <Users className="h-3 w-3" />;
      default:
        return <Zap className="h-3 w-3" />;
    }
  };

  if (achievements.length === 0) return null;

  if (compact) {
    return (
      <div className="flex gap-1">
        {achievements.slice(0, 3).map((achievement) => (
          <HoverCard key={achievement.id}>
            <HoverCardTrigger asChild>
              <Badge
                variant="outline"
                className="cursor-pointer h-6 w-6 p-0 flex items-center justify-center"
              >
                {getIcon(achievement.achievement_type)}
              </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                    {getIcon(achievement.achievement_type)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {achievement.achievement_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(achievement.earned_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                {achievement.achievement_description && (
                  <p className="text-xs text-muted-foreground">
                    {achievement.achievement_description}
                  </p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className="p-3 rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              {getIcon(achievement.achievement_type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {achievement.achievement_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(achievement.earned_at), "MMM d")}
              </p>
            </div>
          </div>
          {achievement.achievement_description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {achievement.achievement_description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
