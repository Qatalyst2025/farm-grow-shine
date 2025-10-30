import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface PollCardProps {
  poll: any;
}

export default function PollCard({ poll }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkIfVoted();
    loadResults();
  }, [poll.id]);

  const checkIfVoted = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("poll_responses")
      .select("selected_option")
      .eq("poll_id", poll.id)
      .eq("user_id", user.id)
      .single();

    if (data) {
      setHasVoted(true);
      setSelectedOption(data.selected_option);
    }
  };

  const loadResults = async () => {
    const { data } = await supabase
      .from("poll_responses")
      .select("selected_option")
      .eq("poll_id", poll.id);

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((response) => {
        counts[response.selected_option] =
          (counts[response.selected_option] || 0) + 1;
      });
      setResults(counts);
    }
  };

  const submitVote = async (option: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSubmitting(true);
    try {
      const isCorrect =
        poll.correct_answer ? option === poll.correct_answer : null;

      const { error } = await supabase.from("poll_responses").insert({
        poll_id: poll.id,
        user_id: user.id,
        selected_option: option,
        is_correct: isCorrect,
      });

      if (error) throw error;

      setHasVoted(true);
      setSelectedOption(option);
      loadResults();

      if (poll.correct_answer) {
        toast({
          title: isCorrect ? "Correct!" : "Incorrect",
          description: isCorrect
            ? "Great job! You got it right."
            : `The correct answer was: ${poll.correct_answer}`,
          variant: isCorrect ? "default" : "destructive",
        });
      } else {
        toast({
          title: "Vote submitted!",
          description: "Your response has been recorded",
        });
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Failed to submit vote",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

  const getOptionPercentage = (option: string) => {
    if (totalVotes === 0) return 0;
    return ((results[option] || 0) / totalVotes) * 100;
  };

  const isExpired = poll.ends_at && new Date(poll.ends_at) < new Date();

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-primary/5 border-primary/20">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {poll.poll_type === "quiz" ? "Quiz" : "Poll"}
            </Badge>
            {isExpired && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Ended
              </Badge>
            )}
          </div>
          <p className="font-semibold text-sm">{poll.question}</p>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(poll.options as Record<string, string>).map(
          ([key, value]) => {
            const percentage = getOptionPercentage(key);
            const isSelected = selectedOption === key;
            const isCorrectAnswer = poll.correct_answer === key;
            const showResults = hasVoted || isExpired;

            return (
              <div key={key}>
                {!showResults ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => submitVote(key)}
                    disabled={submitting || !poll.is_active}
                  >
                    {value}
                  </Button>
                ) : (
                  <div
                    className={`p-3 rounded-lg border ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{value}</span>
                        {poll.correct_answer && isCorrectAnswer && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                        {poll.correct_answer &&
                          isSelected &&
                          !isCorrectAnswer && (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                      </div>
                      <span className="text-xs font-medium">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      {(hasVoted || isExpired) && (
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          {poll.ends_at && (
            <span className="ml-2">
              • Ended{" "}
              {formatDistanceToNow(new Date(poll.ends_at), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
