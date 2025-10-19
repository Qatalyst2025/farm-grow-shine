import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

interface MessageRatingProps {
  messageId: string;
  compact?: boolean;
}

export default function MessageRating({
  messageId,
  compact = false,
}: MessageRatingProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadRating();
    loadStats();
  }, [messageId]);

  const loadRating = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("message_ratings")
      .select("rating")
      .eq("message_id", messageId)
      .eq("user_id", user.id)
      .single();

    if (data) {
      setUserRating(data.rating);
    }
  };

  const loadStats = async () => {
    const { data } = await supabase
      .from("message_ratings")
      .select("is_helpful")
      .eq("message_id", messageId)
      .eq("is_helpful", true);

    if (data) {
      setHelpfulCount(data.length);
    }
  };

  const submitRating = async (rating: number, isHelpful: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase.from("message_ratings").upsert({
        message_id: messageId,
        user_id: user.id,
        rating,
        is_helpful: isHelpful,
        feedback: feedback || null,
      });

      if (error) throw error;

      setUserRating(rating);
      loadStats();
      setShowFeedback(false);
      setFeedback("");

      toast({
        title: "Thanks for your feedback!",
        description: "Your rating helps improve content quality",
      });
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 px-2 ${
            userRating && userRating >= 4 ? "text-primary" : ""
          }`}
          onClick={() => submitRating(5, true)}
        >
          <ThumbsUp className="h-3 w-3" />
          {helpfulCount > 0 && (
            <span className="ml-1 text-xs">{helpfulCount}</span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 px-2 ${
            userRating && userRating <= 2 ? "text-destructive" : ""
          }`}
          onClick={() => setShowFeedback(true)}
        >
          <ThumbsDown className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={showFeedback} onOpenChange={setShowFeedback}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-1" />
            Rate Response
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-sm mb-2">
                How helpful was this response?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={userRating === rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => submitRating(rating, rating >= 4)}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Optional feedback:
              </p>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more..."
                rows={2}
                className="text-sm"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {helpfulCount > 0 && (
        <span className="text-xs text-muted-foreground">
          {helpfulCount} found helpful
        </span>
      )}
    </div>
  );
}
