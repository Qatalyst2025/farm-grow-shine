import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Handshake, Clock, CheckCircle2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface NegotiationRoom {
  id: string;
  room_type: string;
  status: string;
  subject: string;
  current_offer_amount?: number;
  created_at: string;
  updated_at: string;
}

interface NegotiationRoomListProps {
  roomType: string;
  selectedRoom: string | null;
  onSelectRoom: (roomId: string) => void;
}

export default function NegotiationRoomList({ roomType, selectedRoom, onSelectRoom }: NegotiationRoomListProps) {
  const [rooms, setRooms] = useState<NegotiationRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, [roomType]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('negotiation_rooms')
        .select('*')
        .eq('room_type', roomType as any)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'accepted': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'completed': return 'bg-green-600/10 text-green-800 border-green-600/20';
      case 'rejected': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'pending_verification': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>No negotiations yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="p-2 space-y-2">
        {rooms.map((room) => {
          const isSelected = selectedRoom === room.id;
          
          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={cn(
                "w-full p-4 rounded-lg text-left transition-all hover-scale border",
                "bg-gradient-to-br from-card to-card/50",
                isSelected && "ring-2 ring-primary shadow-lg scale-105 border-primary"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate mb-1">{room.subject}</p>
                    <Badge variant="outline" className={cn("text-xs", getStatusColor(room.status))}>
                      {room.status === 'active' && <Clock className="h-3 w-3 mr-1" />}
                      {room.status === 'accepted' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {room.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <Handshake className={cn(
                    "h-5 w-5 shrink-0",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>

                {room.current_offer_amount && (
                  <div className="flex items-center gap-1 text-sm font-medium text-primary">
                    <DollarSign className="h-4 w-4" />
                    ${room.current_offer_amount.toLocaleString()}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(room.updated_at), { addSuffix: true })}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
