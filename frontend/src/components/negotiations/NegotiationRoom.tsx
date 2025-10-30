import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Shield, DollarSign, FileSignature } from "lucide-react";
import NegotiationMessage from "./NegotiationMessage";
import NegotiationInput from "./NegotiationInput";
import PaymentMilestones from "./PaymentMilestones";
import DocumentsList from "./DocumentsList";
import ContractGenerator from "./ContractGenerator";
import { useToast } from "@/hooks/use-toast";

interface NegotiationRoomProps {
  roomId: string;
}

interface Message {
  id: string;
  sender_id: string;
  message_type: string;
  content?: string;
  offer_amount?: number;
  offer_terms?: any;
  document_url?: string;
  quality_photo_url?: string;
  created_at: string;
}

interface RoomInfo {
  id: string;
  room_type: string;
  status: string;
  subject: string;
  current_offer_amount?: number;
  accepted_amount?: number;
  blockchain_hash?: string;
}

export default function NegotiationRoom({ roomId }: NegotiationRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Calculate negotiation progress
  const negotiationProgress = () => {
    if (!messages.length) return 0;
    const hasOffer = messages.some(m => m.message_type === 'offer');
    const hasCounter = messages.some(m => m.message_type === 'counter_offer');
    const hasAccept = messages.some(m => m.message_type === 'accept');
    
    if (hasAccept) return 100;
    if (hasCounter) return 66;
    if (hasOffer) return 33;
    return 10;
  };

  useEffect(() => {
    loadRoom();
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`negotiation:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'negotiation_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const loadRoom = async () => {
    const { data, error } = await supabase
      .from('negotiation_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (!error && data) {
      setRoomInfo(data);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('negotiation_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    }
    setLoading(false);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      active: { color: 'bg-blue-500', label: 'Negotiating' },
      accepted: { color: 'bg-green-500', label: 'Accepted' },
      rejected: { color: 'bg-red-500', label: 'Rejected' },
      completed: { color: 'bg-green-600', label: 'Completed' },
      pending_verification: { color: 'bg-yellow-500', label: 'Pending Verification' }
    };

    const variant = variants[status] || variants.active;
    return (
      <Badge className={`${variant.color} text-white`}>
        {variant.label}
      </Badge>
    );
  };

  if (!roomInfo) return null;

  return (
    <Card className="h-[600px] flex flex-col overflow-hidden bg-gradient-to-br from-card to-card/90 border-primary/10">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{roomInfo.subject}</h3>
              {getStatusBadge(roomInfo.status)}
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {roomInfo.room_type.replace('_', ' ')} negotiation
            </p>
          </div>
        </div>

        {/* Deal Summary */}
        {roomInfo.current_offer_amount && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Current Offer</p>
                <p className="font-bold">${roomInfo.current_offer_amount.toLocaleString()}</p>
              </div>
            </div>
            
            {roomInfo.blockchain_hash && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Blockchain Secured</p>
                  <p className="text-xs font-mono">{roomInfo.blockchain_hash.slice(0, 8)}...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Negotiation Progress */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Negotiation Progress</span>
            <span className="text-xs font-bold">{negotiationProgress()}%</span>
          </div>
          <Progress value={negotiationProgress()} className="h-2" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDocuments(!showDocuments)}
          >
            <FileText className="h-4 w-4 mr-1" />
            Documents
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMilestones(!showMilestones)}
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Payments
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowContract(!showContract)}
            className={showContract ? "bg-primary/10" : ""}
          >
            <FileSignature className="h-4 w-4 mr-1" />
            Contract
          </Button>
        </div>
      </div>

      {/* Documents Panel */}
      {showDocuments && (
        <div className="border-b bg-muted/30">
          <DocumentsList roomId={roomId} />
        </div>
      )}

      {/* Payment Milestones */}
      {showMilestones && (
        <div className="border-b bg-muted/30">
          <PaymentMilestones roomId={roomId} />
        </div>
      )}

      {/* Contract Generator */}
      {showContract && (
        <div className="border-b bg-muted/30">
          <ContractGenerator 
            roomId={roomId} 
            messages={messages}
            roomInfo={roomInfo}
          />
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading negotiation history...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Start the negotiation with your first offer</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <NegotiationMessage key={message.id} message={message} />
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/30">
        {roomInfo.status === 'active' ? (
          <NegotiationInput roomId={roomId} roomType={roomInfo.room_type} />
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">This negotiation is {roomInfo.status}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
