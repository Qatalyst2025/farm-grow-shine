import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield } from "lucide-react";

interface Conversation {
  id: string;
  last_message_at: string;
  encryption_enabled: boolean;
  participants: {
    user_id: string;
    farmer_profile?: { full_name: string };
    buyer_profile?: { company_name: string };
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

export const ConversationList = ({
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDummyConversations();
  }, []);

  const loadDummyConversations = () => {
    const dummy = [
      {
        id: "1",
        last_message_at: new Date().toISOString(),
        encryption_enabled: true,
        participants: [
          { user_id: "u1", farmer_profile: { full_name: "Devon Robinson" } },
        ],
        last_message: { content: "Let's catch up tomorrow.", message_type: "text" },
        verification: { verification_level: "trusted" },
        unread_count: 2,
      },
      {
        id: "2",
        last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        encryption_enabled: false,
        participants: [
          { user_id: "u2", farmer_profile: { full_name: "Zane Barber" } },
        ],
        last_message: { content: "Can you send the files?", message_type: "text" },
        verification: { verification_level: "basic" },
        unread_count: 0,
      },
      {
        id: "3",
        last_message_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        encryption_enabled: true,
        participants: [
          { user_id: "u3", farmer_profile: { full_name: "Andre James" } },
        ],
        last_message: { content: "Meeting moved to 11AM.", message_type: "text" },
        verification: { verification_level: "premium" },
        unread_count: 1,
      },
    ];

    setConversations(dummy);
    setLoading(false);
  };

  const getParticipantName = (conv: Conversation) => {
    const p = conv.participants[0];
    return (
      p.farmer_profile?.full_name ||
      p.buyer_profile?.company_name ||
      "Unknown User"
    );
  };

  const formatExactTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card className="h-full p-4">
        <p>Loading...</p>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-center">Chats</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`relative w-full text-left p-4 rounded-lg mb-2 flex items-start gap-3 ${
                selectedConversationId === conv.id
                  ? "bg-primary/10"
                  : "hover:bg-muted"
              }`}
            >
             
              <div className="relative">
              <Avatar className="w-12 h-12 bg-primary">
              <AvatarFallback className="bg-primary text-secondary">
              {getParticipantName(conv).charAt(0)}
              </AvatarFallback>
              </Avatar>

              {conv.verification && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2
                    text-[10px] font-semibold px-2 py-0.5 rounded-full
                    bg-secondary text-primary">
              {conv.verification.verification_level}
              </div>
              )}
              </div>


              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold truncate">
                      {getParticipantName(conv)}
                    </span>

                    {conv.encryption_enabled && (
                      <div className="w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                        <Shield className="w-3 h-3 text-primary" />
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {formatExactTime(conv.last_message_at)}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.last_message?.content}
                  </p>

                  {conv.unread_count! > 0 && (
                    <Badge variant="secondary">{conv.unread_count}</Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
