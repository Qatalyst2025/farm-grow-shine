import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Image, FileText, Calendar, DollarSign, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface MessageInputProps {
  conversationId: string;
}

export const MessageInput = ({ conversationId }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("text");
  const [sending, setSending] = useState(false);
  const [dealAmount, setDealAmount] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [expiresIn, setExpiresIn] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!message.trim() && messageType === "text") {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const messageData: any = {
        conversation_id: conversationId,
        sender_id: user.id,
        message_type: messageType,
        content: message,
      };

      // Add expires_at if temporary message
      if (expiresIn) {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + parseInt(expiresIn));
        messageData.expires_at = expiryDate.toISOString();
      }

      // Add type-specific fields
      if (messageType === "deal_offer" && dealAmount) {
        messageData.deal_amount = parseFloat(dealAmount);
        messageData.deal_status = "pending";
      } else if (messageType === "meeting_request") {
        if (meetingDate) messageData.meeting_datetime = new Date(meetingDate).toISOString();
        if (meetingLocation) messageData.meeting_location = meetingLocation;
      }

      const { error } = await supabase
        .from("private_messages")
        .insert(messageData);

      if (error) throw error;

      // Clear inputs
      setMessage("");
      setDealAmount("");
      setMeetingDate("");
      setMeetingLocation("");
      setExpiresIn(null);
      setMessageType("text");

      toast.success("Message sent");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select value={messageType} onValueChange={setMessageType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="deal_offer">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Deal Offer
              </div>
            </SelectItem>
            <SelectItem value="meeting_request">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Meeting Request
              </div>
            </SelectItem>
            <SelectItem value="document">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Document
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Shield className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Security Options</DialogTitle>
              <DialogDescription>
                Configure message expiration and security settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Message Expiration</Label>
                <Select value={expiresIn || "none"} onValueChange={(v) => setExpiresIn(v === "none" ? null : v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No expiration</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="168">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {messageType === "deal_offer" && (
        <div className="space-y-2">
          <Label>Deal Amount ($)</Label>
          <Input
            type="number"
            value={dealAmount}
            onChange={(e) => setDealAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
      )}

      {messageType === "meeting_request" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={meetingLocation}
              onChange={(e) => setMeetingLocation(e.target.value)}
              placeholder="Meeting location"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="min-h-[60px] resize-none"
        />
        <Button
          onClick={sendMessage}
          disabled={sending}
          size="icon"
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};