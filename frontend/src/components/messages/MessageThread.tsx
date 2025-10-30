import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Shield, CheckCircle2, FileText, Calendar, DollarSign, AlertTriangle, MoreVertical } from "lucide-react";
import { MessageInput } from "./MessageInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  message_type: string;
  sender_id: string;
  created_at: string;
  delivered_at: string | null;
  read_at: string | null;
  expires_at: string | null;
  media_url: string | null;
  document_url: string | null;
  deal_amount: number | null;
  deal_status: string | null;
  meeting_datetime: string | null;
  meeting_location: string | null;
  contains_suspicious_content: boolean;
  flagged_reason: string | null;
}

interface MessageThreadProps {
  conversationId: string;
}

export const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    loadParticipantInfo();
    setupRealtimeSubscription();
    markMessagesAsRead();

    return () => {
      markMessagesAsRead();
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserId(user.id);

    const { data } = await supabase
      .from("private_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(data || []);
    setLoading(false);
  };

  const loadParticipantInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .neq("user_id", user.id)
      .single();

    if (!participants) return;

    // Try to load farmer profile
    const { data: farmerProfile } = await supabase
      .from("farmer_profiles")
      .select("full_name, verification_level, trust_score")
      .eq("user_id", participants.user_id)
      .single();

    // Try to load buyer profile
    const { data: buyerProfile } = await supabase
      .from("buyer_profiles")
      .select("company_name, verification_level, trust_score")
      .eq("user_id", participants.user_id)
      .single();

    // Load verification
    const { data: verification } = await supabase
      .from("user_verification")
      .select("*")
      .eq("user_id", participants.user_id)
      .single();

    setOtherParticipant({
      user_id: participants.user_id,
      name: farmerProfile?.full_name || buyerProfile?.company_name || "Unknown User",
      verification,
      trust_score: farmerProfile?.trust_score || buyerProfile?.trust_score || 0,
    });
  };

  const markMessagesAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update last_read_at for participant
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id);

    // Mark unread messages as read
    await supabase
      .from("private_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .is("read_at", null);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          markMessagesAsRead();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleReportMessage = async (messageId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("message_reports")
      .insert({
        message_id: messageId,
        reported_by: user.id,
        report_reason: "inappropriate_content",
        report_details: "User reported this message",
      });

    if (error) {
      toast.error("Failed to report message");
    } else {
      toast.success("Message reported successfully");
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "deal_offer":
        return <DollarSign className="w-4 h-4" />;
      case "meeting_request":
        return <Calendar className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.contains_suspicious_content) {
      return (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Suspicious Content Detected</p>
            <p className="text-xs text-muted-foreground">{message.flagged_reason}</p>
          </div>
        </div>
      );
    }

    if (message.expires_at && new Date(message.expires_at) < new Date()) {
      return (
        <div className="text-sm text-muted-foreground italic">
          This message has expired
        </div>
      );
    }

    switch (message.message_type) {
      case "deal_offer":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="font-semibold">Deal Offer</span>
            </div>
            <p className="text-lg font-bold">${message.deal_amount}</p>
            {message.content && <p className="text-sm">{message.content}</p>}
            {message.deal_status && (
              <Badge variant={message.deal_status === "accepted" ? "default" : "secondary"}>
                {message.deal_status}
              </Badge>
            )}
          </div>
        );

      case "meeting_request":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-semibold">Meeting Request</span>
            </div>
            {message.meeting_datetime && (
              <p className="text-sm">
                {new Date(message.meeting_datetime).toLocaleString()}
              </p>
            )}
            {message.meeting_location && (
              <p className="text-sm text-muted-foreground">{message.meeting_location}</p>
            )}
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );

      case "document":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-semibold">Document</span>
            </div>
            {message.document_url && (
              <a
                href={message.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View Document
              </a>
            )}
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );

      case "image":
        return (
          <div className="space-y-2">
            {message.media_url && (
              <img
                src={message.media_url}
                alt="Shared image"
                className="max-w-sm rounded-lg"
              />
            )}
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );

      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  if (loading) {
    return (
      <Card className="h-full p-4">
        <div className="h-full flex items-center justify-center">
          <div className="text-muted-foreground">Loading messages...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{otherParticipant?.name}</h3>
              {otherParticipant?.verification && (
                <Badge variant="outline">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {otherParticipant.verification.verification_level}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Trust Score: {otherParticipant?.trust_score || 0}/100
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === currentUserId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {getMessageIcon(message.message_type)}
                    {renderMessageContent(message)}
                  </div>
                  {message.sender_id !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleReportMessage(message.id)}>
                          Report Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                  <span>
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                  {message.expires_at && (
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Expires
                    </span>
                  )}
                  {message.sender_id === currentUserId && message.read_at && (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <MessageInput conversationId={conversationId} />
      </div>
    </Card>
  );
};