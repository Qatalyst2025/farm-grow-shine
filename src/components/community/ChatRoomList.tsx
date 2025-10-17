import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, MapPin, Sprout, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  room_type: string;
  region?: string;
  crop_type?: string;
  member_count: number;
  metadata?: any;
}

interface ChatRoomListProps {
  roomType: string;
  selectedRoom: string | null;
  onSelectRoom: (roomId: string) => void;
}

export default function ChatRoomList({ roomType, selectedRoom, onSelectRoom }: ChatRoomListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, [roomType]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('room_type', roomType as any)
        .eq('is_active', true)
        .order('member_count', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'regional': return MapPin;
      case 'crop_specific': return Sprout;
      case 'emergency': return AlertTriangle;
      default: return Users;
    }
  };

  const getRoomColor = (type: string) => {
    switch (type) {
      case 'regional': return 'from-primary/20 to-primary/5 border-primary/30';
      case 'crop_specific': return 'from-secondary/20 to-secondary/5 border-secondary/30';
      case 'emergency': return 'from-destructive/20 to-destructive/5 border-destructive/30';
      default: return 'from-muted/20 to-muted/5';
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>No rooms available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="p-2 space-y-2">
        {rooms.map((room) => {
          const Icon = getIcon(room.room_type);
          const isSelected = selectedRoom === room.id;
          
          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-all hover-scale",
                "border bg-gradient-to-br",
                getRoomColor(room.room_type),
                isSelected && "ring-2 ring-primary shadow-lg scale-105"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  room.room_type === 'regional' && "bg-primary/10",
                  room.room_type === 'crop_specific' && "bg-secondary/10",
                  room.room_type === 'emergency' && "bg-destructive/10 animate-pulse"
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    room.room_type === 'regional' && "text-primary",
                    room.room_type === 'crop_specific' && "text-secondary",
                    room.room_type === 'emergency' && "text-destructive"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">{room.name}</p>
                    {room.metadata?.trending && (
                      <Badge variant="secondary" className="h-5 text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground truncate mb-2">
                    {room.description || `${room.region || room.crop_type || 'Community'} discussion`}
                  </p>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {room.member_count}
                    </Badge>
                    {room.region && (
                      <Badge variant="secondary" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {room.region}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
