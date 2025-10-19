import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
}

export default function CreatePollDialog({
  open,
  onOpenChange,
  roomId,
}: CreatePollDialogProps) {
  const [question, setQuestion] = useState("");
  const [pollType, setPollType] = useState("single_choice");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createPoll = async () => {
    if (!question.trim() || options.filter((o) => o.trim()).length < 2) {
      toast({
        title: "Invalid poll",
        description: "Please add a question and at least 2 options",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const optionsObj = options.reduce((acc, opt, idx) => {
        if (opt.trim()) {
          acc[`option_${idx + 1}`] = opt.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      const { error } = await supabase.from("chat_polls").insert({
        room_id: roomId,
        created_by: user.id,
        question: question.trim(),
        options: optionsObj,
        poll_type: pollType,
        correct_answer:
          pollType === "quiz" && correctAnswer ? correctAnswer : null,
      });

      if (error) throw error;

      toast({
        title: "Poll created!",
        description: "Your poll is now live in the room",
      });

      onOpenChange(false);
      setQuestion("");
      setOptions(["", ""]);
      setCorrectAnswer("");
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Failed to create poll",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Poll or Quiz</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={pollType} onValueChange={setPollType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_choice">Poll</SelectItem>
                <SelectItem value="quiz">Quiz (with correct answer)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Question</Label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>

          {pollType === "quiz" && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt, idx) =>
                    opt.trim() ? (
                      <SelectItem key={idx} value={`option_${idx + 1}`}>
                        {opt}
                      </SelectItem>
                    ) : null
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={createPoll}
            disabled={creating}
            className="w-full bg-gradient-to-r from-primary to-secondary"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Poll"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
