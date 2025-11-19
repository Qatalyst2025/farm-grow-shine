import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageInput } from "./MessageInput";
import { Shield, CheckCircle2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: string;
  created_at: string;
}

interface MessageThreadProps {
  conversationId: string;
  dummyMessages?: Message[];
}

export const MessageThread = ({ conversationId, dummyMessages }: MessageThreadProps) => {
  const [messages, setMessages] = useState<Message[]>(dummyMessages || []);
  const currentUserId = "me"; // for dummy messages
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Dummy participant info based on conversationId
  const getParticipantInfo = () => {
    switch (conversationId) {
      case "1":
        return { name: "Devon Robinson", verification: "trusted" };
      case "2":
        return { name: "Zane Barber", verification: "basic" };
      case "3":
        return { name: "Andre James", verification: "premium" };
      default:
        return { name: "Unknown User", verification: "basic" };
    }
  };

  const participant = getParticipantInfo();

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12 bg-primary">
            <AvatarFallback className="bg-primary text-secondary">
              {participant.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2
                          text-[10px] font-semibold px-2 py-0.5 rounded-full
                          bg-secondary text-primary">
            {participant.verification}
          </div>
        </div>
        <h3 className="font-semibold">{participant.name}</h3>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === currentUserId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString("en-KE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
