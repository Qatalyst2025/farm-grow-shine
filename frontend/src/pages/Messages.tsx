import { useState } from "react";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Messages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
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
              <MessageThread conversationId={selectedConversationId} />
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