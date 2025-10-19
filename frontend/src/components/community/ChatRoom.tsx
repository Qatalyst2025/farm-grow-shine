import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Pin, Award, BarChart3, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import WisdomPointsCard from "./WisdomPointsCard";
import MembersList from "./MembersList";
import PollCard from "./PollCard";
import ScheduledSessionCard from "./ScheduledSessionCard";
import CreatePollDialog from "./CreatePollDialog";
import { useToast } from "@/hooks/use-toast";

interface ChatRoomProps {
  roomId: string;
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  message_type: string;
  voice_url?: string;
  image_url?: string;
  ai_analysis?: any;
  is_pinned: boolean;
  is_alert: boolean;
  created_at: string;
  reply_to?: string;
}

interface RoomInfo {
  name: string;
  description: string;
  room_type: string;
  member_count: number;
  region?: string;
  crop_type?: string;
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [polls, setPolls] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [expertProfiles, setExpertProfiles] = useState<Record<string, any>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRoom();
    checkMembership();
    loadMessages();
    loadPolls();
    loadSessions();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    // Subscribe to polls
    const pollsChannel = supabase
      .channel(`polls:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_polls',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setPolls(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(pollsChannel);
    };
  }, [roomId]);

  const loadRoom = async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (!error && data) {
      setRoomInfo(data);
    }
  };

  const checkMembership = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('chat_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .maybeSingle();

    setIsMember(!!data);
  };

  const loadMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && data) {
      setMessages(data);
      // Load expert profiles for message senders
      const userIds = [...new Set(data.map(m => m.user_id))];
      loadExpertProfiles(userIds);
      setTimeout(scrollToBottom, 100);
    }
    setLoading(false);
  };

  const loadExpertProfiles = async (userIds: string[]) => {
    if (userIds.length === 0) return;
    
    const { data } = await supabase
      .from('expert_profiles')
      .select('*')
      .in('user_id', userIds)
      .eq('verified', true);

    if (data) {
      const profilesMap: Record<string, any> = {};
      data.forEach(profile => {
        profilesMap[profile.user_id] = profile;
      });
      setExpertProfiles(profilesMap);
    }
  };

  const loadPolls = async () => {
    const { data } = await supabase
      .from('chat_polls')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) {
      setPolls(data);
    }
  };

  const loadSessions = async () => {
    const { data } = await supabase
      .from('scheduled_sessions')
      .select('*')
      .eq('room_id', roomId)
      .gte('scheduled_end', new Date().toISOString())
      .order('scheduled_start', { ascending: true })
      .limit(5);

    if (data) {
      setSessions(data);
    }
  };

  const joinRoom = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join rooms",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('chat_members')
      .insert({ room_id: roomId, user_id: user.id });

    if (!error) {
      setIsMember(true);
      toast({
        title: "Welcome to the community!",
        description: "You can now participate in discussions",
      });
    }
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!roomInfo) return null;

  const pinnedMessages = messages.filter(m => m.is_pinned);

  return (
    <Card className="h-[600px] flex flex-col overflow-hidden bg-gradient-to-br from-card to-card/90 border-primary/10">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{roomInfo.name}</h3>
              {roomInfo.room_type === 'emergency' && (
                <Badge variant="destructive" className="animate-pulse">
                  ALERT
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {roomInfo.description || `${roomInfo.region || roomInfo.crop_type} community`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {roomInfo.member_count} members
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <WisdomPointsCard roomId={roomId} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowPolls(!showPolls);
                setShowMembers(false);
                setShowSessions(false);
              }}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowSessions(!showSessions);
                setShowMembers(false);
                setShowPolls(false);
              }}
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowMembers(!showMembers);
                setShowPolls(false);
                setShowSessions(false);
              }}
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar Content */}
      {(showMembers || showPolls || showSessions) && (
        <div className="border-b bg-muted/30 p-4 max-h-80 overflow-y-auto">
          {showMembers && <MembersList roomId={roomId} onClose={() => setShowMembers(false)} />}
          
          {showPolls && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Active Polls & Quizzes</h4>
                <Button
                  size="sm"
                  onClick={() => setShowCreatePoll(true)}
                  variant="outline"
                >
                  Create Poll
                </Button>
              </div>
              {polls.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active polls
                </p>
              ) : (
                polls.map(poll => (
                  <PollCard key={poll.id} poll={poll} />
                ))
              )}
            </div>
          )}

          {showSessions && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm mb-3">Upcoming Sessions</h4>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming sessions
                </p>
              ) : (
                sessions.map(session => (
                  <ScheduledSessionCard key={session.id} session={session} />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="p-3 border-b bg-primary/5 space-y-2">
          {pinnedMessages.map(msg => (
            <div key={msg.id} className="flex items-start gap-2 text-sm">
              <Pin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs">{msg.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                roomId={roomId}
                expertProfile={expertProfiles[message.user_id]}
              />
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/30">
        {isMember ? (
          <MessageInput roomId={roomId} />
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Join this community to participate in discussions
            </p>
            <Button onClick={joinRoom} className="bg-gradient-to-r from-primary to-secondary">
              <Users className="h-4 w-4 mr-2" />
              Join Community
            </Button>
          </div>
        )}
      </div>

      {/* Members Sidebar (overlay) */}
      {showMembers && (
        <div className="absolute inset-y-0 right-0 w-64 bg-card border-l shadow-lg z-10">
          <MembersList roomId={roomId} onClose={() => setShowMembers(false)} />
        </div>
      )}

      <CreatePollDialog
        open={showCreatePoll}
        onOpenChange={setShowCreatePoll}
        roomId={roomId}
      />
    </Card>
  );
}
