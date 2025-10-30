import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Shield, CheckCircle2 } from "lucide-react";

interface Conversation {
  id: string;
  last_message_at: string;
  encryption_enabled: boolean;
  participants: {
    user_id: string;
    farmer_profile?: {
      full_name: string;
    };
    buyer_profile?: {
      company_name: string;
    };
  }[];
  last_message?: {
    content: string;
    message_type: string;
  };
  verification?: {
    verification_level: string;
  };
  unread_count?: number;
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export const ConversationList = ({ onSelectConversation, selectedConversationId }: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
    setupRealtimeSubscription();
  }, []);

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserId(user.id);

    // Get conversations where user is a participant
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        private_conversations (
          id,
          last_message_at,
          encryption_enabled
        )
      `)
      .eq("user_id", user.id)
      .order("last_read_at", { ascending: false });

    if (!participants) return;

    // Load full conversation details
    const conversationIds = participants.map(p => p.conversation_id);
    const { data: fullConversations } = await supabase
      .from("private_conversations")
      .select(`
        *,
        conversation_participants (
          user_id,
          is_blocked
        )
      `)
      .in("id", conversationIds);

    // Load participant details and last messages
    const enrichedConversations = await Promise.all(
      (fullConversations || []).map(async (conv) => {
        // Get other participant
        const otherParticipant = conv.conversation_participants?.find(
          (p: any) => p.user_id !== user.id
        );

        if (!otherParticipant) return null;

        // Get participant profile
        const { data: farmerProfile } = await supabase
          .from("farmer_profiles")
          .select("full_name")
          .eq("user_id", otherParticipant.user_id)
          .single();

        const { data: buyerProfile } = await supabase
          .from("buyer_profiles")
          .select("company_name")
          .eq("user_id", otherParticipant.user_id)
          .single();

        // Get verification
        const { data: verification } = await supabase
          .from("user_verification")
          .select("verification_level")
          .eq("user_id", otherParticipant.user_id)
          .single();

        // Get last message
        const { data: lastMessage } = await supabase
          .from("private_messages")
          .select("content, message_type")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { data: participant } = await supabase
          .from("conversation_participants")
          .select("last_read_at")
          .eq("conversation_id", conv.id)
          .eq("user_id", user.id)
          .single();

        const { count: unreadCount } = await supabase
          .from("private_messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
          .gt("created_at", participant?.last_read_at || "1970-01-01");

        return {
          id: conv.id,
          last_message_at: conv.last_message_at,
          encryption_enabled: conv.encryption_enabled,
          participants: [
            {
              user_id: otherParticipant.user_id,
              farmer_profile: farmerProfile,
              buyer_profile: buyerProfile,
            },
          ],
          verification,
          last_message: lastMessage,
          unread_count: unreadCount || 0,
        };
      })
    );

    setConversations(enrichedConversations.filter(Boolean) as Conversation[]);
    setLoading(false);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("conversations-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "private_messages",
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getParticipantName = (conv: Conversation) => {
    const participant = conv.participants[0];
    return participant.farmer_profile?.full_name || 
           participant.buyer_profile?.company_name || 
           "Unknown User";
  };

  const getVerificationBadge = (verification?: { verification_level: string }) => {
    if (!verification) return null;

    const colors = {
      basic: "bg-muted",
      trusted: "bg-primary/20",
      premium: "bg-secondary/20",
      expert: "bg-accent",
    };

    return (
      <Badge variant="outline" className={colors[verification.verification_level as keyof typeof colors]}>
        <CheckCircle2 className="w-3 h-3 mr-1" />
        {verification.verification_level}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="h-full p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start a conversation to connect with farmers and buyers</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full text-left p-4 rounded-lg mb-2 transition-colors ${
                  selectedConversationId === conv.id
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {getParticipantName(conv).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">
                          {getParticipantName(conv)}
                        </span>
                        {conv.encryption_enabled && (
                          <Shield className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      {conv.last_message_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message_at), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message?.message_type === "text"
                          ? conv.last_message.content
                          : `${conv.last_message?.message_type || "Message"}`}
                      </p>
                      {conv.unread_count! > 0 && (
                        <Badge variant="default" className="ml-2">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      {getVerificationBadge(conv.verification)}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};