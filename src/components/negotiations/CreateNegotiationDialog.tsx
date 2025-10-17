import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateNegotiationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (roomId: string) => void;
}

export default function CreateNegotiationDialog({
  open,
  onOpenChange,
  onCreated
}: CreateNegotiationDialogProps) {
  const [roomType, setRoomType] = useState<string>("farmer_buyer");
  const [subject, setSubject] = useState("");
  const [initialOffer, setInitialOffer] = useState("");
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter a subject for this negotiation",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('negotiation_rooms')
        .insert({
          room_type: roomType as any,
          subject,
          farmer_id: user.id,
          current_offer_amount: initialOffer ? parseFloat(initialOffer) : null,
          status: 'active' as any
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Negotiation created!",
        description: "You can now start discussing terms",
      });

      onCreated(data.id);
      setSubject("");
      setInitialOffer("");
    } catch (error) {
      console.error('Error creating negotiation:', error);
      toast({
        title: "Failed to create negotiation",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Negotiation</DialogTitle>
          <DialogDescription>
            Create a structured, transparent deal with blockchain security
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Negotiation Type</Label>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer_buyer">Crop Sale</SelectItem>
                <SelectItem value="loan_application">Loan Application</SelectItem>
                <SelectItem value="supply_chain">Supply Chain Coordination</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g., Sale of 500kg Maize Harvest"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer">Initial Offer Amount (optional)</Label>
            <Input
              id="offer"
              type="number"
              placeholder="0.00"
              value={initialOffer}
              onChange={(e) => setInitialOffer(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating || !subject.trim()}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Negotiation"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
