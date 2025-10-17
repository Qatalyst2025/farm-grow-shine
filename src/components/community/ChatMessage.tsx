import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  ThumbsUp, Award, Reply, Volume2, Image as ImageIcon,
  AlertCircle, CheckCircle2, AlertTriangle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import ExpertBadge from "./ExpertBadge";
import MessageRating from "./MessageRating";
import AchievementBadges from "./AchievementBadges";

interface ChatMessageProps {
  message: any;
  roomId: string;
  expertProfile?: any;
}

export default function ChatMessage({ message, roomId, expertProfile }: ChatMessageProps) {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [playing, setPlaying] = useState(false);
  const { toast } = useToast();

  const giveWisdomPoint = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('wisdom_points_log')
      .insert({
        room_id: roomId,
        message_id: message.id,
        recipient_id: message.user_id,
        giver_id: user.id,
        points: 1,
        reason: 'Helpful message'
      });

    if (!error) {
      toast({
        title: "Wisdom point awarded! 🌟",
        description: "You've recognized valuable knowledge sharing",
      });
    }
  };

  const addReaction = async (reaction: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('chat_reactions')
      .insert({
        message_id: message.id,
        user_id: user.id,
        reaction
      });
  };

  const playVoiceMessage = () => {
    if (message.voice_url) {
      const audio = new Audio(message.voice_url);
      audio.play();
      setPlaying(true);
      audio.onended = () => setPlaying(false);
    }
  };

  const getAlertIcon = () => {
    if (!message.is_alert) return null;
    const severity = message.metadata?.severity || 'info';
    
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className={cn(
      "p-4 transition-all hover:shadow-md",
      message.is_alert && "border-l-4 border-l-destructive bg-destructive/5",
      message.is_pinned && "border-l-4 border-l-primary bg-primary/5"
    )}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            {message.user_id.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-sm">Farmer {message.user_id.slice(0, 6)}</span>
            
            {/* Expert Badge */}
            {expertProfile && expertProfile.verified && (
              <ExpertBadge
                verificationLevel={expertProfile.verification_level}
                expertiseAreas={expertProfile.expertise_areas}
                averageRating={expertProfile.average_rating}
                totalResponses={expertProfile.total_responses}
                yearsExperience={expertProfile.years_experience}
              />
            )}

            {/* Achievement Badges */}
            <AchievementBadges userId={message.user_id} compact />
            
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
            {getAlertIcon()}
            {message.is_pinned && (
              <Badge variant="secondary" className="text-xs">Pinned</Badge>
            )}
          </div>

          {/* Voice Message */}
          {message.message_type === 'voice' && message.voice_url && (
            <Button
              variant="outline"
              size="lg"
              className="mb-2 bg-gradient-to-r from-primary/10 to-secondary/10"
              onClick={playVoiceMessage}
            >
              <Volume2 className={cn("h-5 w-5 mr-2", playing && "animate-pulse")} />
              {playing ? 'Playing...' : 'Play Voice Message'}
            </Button>
          )}

          {/* Image with AI Analysis */}
          {message.message_type === 'image' && message.image_url && (
            <div className="mb-2 space-y-2">
              <img 
                src={message.image_url} 
                alt="Crop" 
                className="rounded-lg max-w-sm border-2 border-primary/20"
              />
              {message.ai_analysis && (
                <Card className="p-3 bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/30">
                  <div className="flex items-start gap-2">
                    <ImageIcon className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">AI Analysis</p>
                      <p className="text-xs text-muted-foreground">
                        {message.ai_analysis.diagnosis || 'Crop appears healthy'}
                      </p>
                      {message.ai_analysis.recommendations && (
                        <ul className="text-xs space-y-1 mt-2">
                          {message.ai_analysis.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="flex items-start gap-1">
                              <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="text-sm mb-3 whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => addReaction('👍')}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              Helpful
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-yellow-600 hover:text-yellow-700"
              onClick={giveWisdomPoint}
            >
              <Award className="h-3 w-3 mr-1" />
              Wisdom
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>

            {/* Message Rating for Expert Responses */}
            {expertProfile && (
              <MessageRating messageId={message.id} compact />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
