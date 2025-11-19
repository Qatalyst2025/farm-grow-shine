import { useState } from "react";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { MobileHeader } from "@/components/mobile/MobileHeader";

// Dummy message data
const dummyMessages: Record<string, any[]> = {
  "1": [
    { id: "m1", sender: "u1", content: "Hey! How are you?", created_at: new Date().toISOString() },
    { id: "m2", sender: "me", content: "I'm good, thanks! How about you?", created_at: new Date().toISOString() },
    { id: "m3", sender: "u1", content: "All fine. Are you free tomorrow?", created_at: new Date().toISOString() },
  ],
  "2": [
    { id: "m4", sender: "u2", content: "Can you send the files?", created_at: new Date().toISOString() },
    { id: "m5", sender: "me", content: "Sure, sending now.", created_at: new Date().toISOString() },
  ],
  "3": [
    { id: "m6", sender: "u3", content: "Meeting moved to 11AM.", created_at: new Date().toISOString() },
    { id: "m7", sender: "me", content: "Got it, thanks!", created_at: new Date().toISOString() },
  ],
};

export default function Messages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <MobileHeader />
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Private Messages</h1>
          <p className="text-muted-foreground">
            Secure, verified conversations with trusted partners
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          <div className="lg:col-span-1">
            <ConversationList
              onSelectConversation={setSelectedConversationId}
              selectedConversationId={selectedConversationId || undefined}
            />
          </div>

          <div className="lg:col-span-2">
            {selectedConversationId ? (
              <MessageThread
                conversationId={selectedConversationId}
                dummyMessages={dummyMessages[selectedConversationId]}
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">No conversation selected</p>
                  <p className="text-sm">
                    Select a conversation from the list to start messaging
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
