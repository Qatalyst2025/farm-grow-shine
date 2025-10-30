import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Send, TrendingUp, TrendingDown, Check, X,
  FileUp, MapPin, Image as ImageIcon, Loader2, Sparkles
} from "lucide-react";
import MessageTemplates from "./MessageTemplates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface NegotiationInputProps {
  roomId: string;
  roomType: string;
}

export default function NegotiationInput({ roomId, roomType }: NegotiationInputProps) {
  const [messageType, setMessageType] = useState<string>("question");
  const [message, setMessage] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (messageType === 'offer' || messageType === 'counter_offer') {
      if (!offerAmount || parseFloat(offerAmount) <= 0) {
        toast({
          title: "Amount required",
          description: "Please enter a valid offer amount",
          variant: "destructive"
        });
        return;
      }
    }

    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const messageData: any = {
        room_id: roomId,
        sender_id: user.id,
        message_type: messageType,
        content: message || null
      };

      if (messageType === 'offer' || messageType === 'counter_offer') {
        messageData.offer_amount = parseFloat(offerAmount);
        // Set expiration to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        messageData.offer_expires_at = expiresAt.toISOString();
      }

      const { error: messageError } = await supabase
        .from('negotiation_messages')
        .insert(messageData);

      if (messageError) throw messageError;

      // Update room's current offer if this is an offer
      if (messageType === 'offer' || messageType === 'counter_offer') {
        await supabase
          .from('negotiation_rooms')
          .update({ current_offer_amount: parseFloat(offerAmount) })
          .eq('id', roomId);
      }

      // If accepting, update room status
      if (messageType === 'accept') {
        await supabase
          .from('negotiation_rooms')
          .update({ status: 'accepted' })
          .eq('id', roomId);
      }

      // If rejecting, update room status
      if (messageType === 'reject') {
        await supabase
          .from('negotiation_rooms')
          .update({ status: 'rejected' })
          .eq('id', roomId);
      }

      setMessage("");
      setOfferAmount("");
      toast({
        title: "Message sent!",
        description: "Your message has been added to the negotiation",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Message Type</Label>
          <Select value={messageType} onValueChange={setMessageType}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="offer">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  Make Offer
                </div>
              </SelectItem>
              <SelectItem value="counter_offer">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3 text-orange-600" />
                  Counter Offer
                </div>
              </SelectItem>
              <SelectItem value="accept">
                <div className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-600" />
                  Accept Deal
                </div>
              </SelectItem>
              <SelectItem value="reject">
                <div className="flex items-center gap-2">
                  <X className="h-3 w-3 text-red-600" />
                  Reject
                </div>
              </SelectItem>
              <SelectItem value="question">Question</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(messageType === 'offer' || messageType === 'counter_offer') && (
          <div className="space-y-1">
            <Label className="text-xs">Amount ($)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="h-9"
            />
          </div>
        )}
      </div>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          messageType === 'accept' 
            ? "Add any final notes (optional)..."
            : messageType === 'reject'
            ? "Explain why (optional)..."
            : "Add details or terms..."
        }
        className="resize-none"
        rows={2}
      />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTemplates(true)}
          className="border-primary/20"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Templates
        </Button>

        <Button
          onClick={sendMessage}
          disabled={sending}
          className="ml-auto bg-gradient-to-r from-primary to-secondary"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              Send
            </>
          )}
        </Button>
      </div>

      <MessageTemplates
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onSelectTemplate={(template) => setMessage(template)}
      />
    </div>
  );
}
