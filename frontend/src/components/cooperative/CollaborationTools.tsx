import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  Send, 
  Bell, 
  FileText, 
  Vote,
  Calendar,
  Users,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const CollaborationTools = () => {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");

  const recentMessages = [
    {
      id: 1,
      sender: "Kwame M.",
      message: "Great harvest this season! Let's discuss bulk selling our maize together.",
      timestamp: "2025-10-15 09:30",
      avatar: "👨‍🌾"
    },
    {
      id: 2,
      sender: "Ama B.",
      message: "Meeting reminder: Financial review tomorrow at 2pm. Please bring your contribution records.",
      timestamp: "2025-10-15 14:20",
      avatar: "👩‍🌾"
    },
    {
      id: 3,
      sender: "Joseph O.",
      message: "The harvester is back from maintenance. Ready for bookings!",
      timestamp: "2025-10-16 08:15",
      avatar: "👨‍🌾"
    }
  ];

  const announcements = [
    {
      id: 1,
      title: "New Training Program Available",
      content: "Free advanced farming techniques workshop on Oct 25th. Register now!",
      date: "2025-10-14",
      priority: "high"
    },
    {
      id: 2,
      title: "Cooperative Meeting - Oct 20",
      content: "Monthly cooperative meeting to discuss Q4 targets and new member applications.",
      date: "2025-10-13",
      priority: "medium"
    }
  ];

  const activeVotes = [
    {
      id: 1,
      title: "Purchase New Irrigation System",
      description: "Vote on investing $5,000 in a shared drip irrigation system",
      votesFor: 18,
      votesAgainst: 3,
      totalMembers: 24,
      deadline: "2025-10-18",
      status: "active"
    },
    {
      id: 2,
      title: "Extend Storage Facility",
      description: "Should we expand the storage facility by 30%?",
      votesFor: 15,
      votesAgainst: 8,
      totalMembers: 24,
      deadline: "2025-10-20",
      status: "active"
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Monthly Cooperative Meeting",
      date: "2025-10-20",
      time: "14:00",
      location: "Community Center",
      attendees: 18
    },
    {
      id: 2,
      title: "Advanced Farming Workshop",
      date: "2025-10-25",
      time: "09:00",
      location: "Agricultural Training Center",
      attendees: 22
    },
    {
      id: 3,
      title: "Group Harvest Day",
      date: "2025-11-05",
      time: "06:00",
      location: "Kwame's Farm",
      attendees: 24
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      toast({
        title: "Message sent",
        description: "Your message has been shared with all cooperative members",
      });
      setNewMessage("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Group Chat */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-card-foreground flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Group Chat
          </h3>
          
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div className="text-2xl">{msg.avatar}</div>
                <div className="flex-1 bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-card-foreground">{msg.sender}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message to all cooperative members..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="resize-none"
              rows={2}
            />
            <Button onClick={handleSendMessage} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Active Votes */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-card-foreground flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Active Votes
          </h3>
          <div className="space-y-4">
            {activeVotes.map((vote) => (
              <div key={vote.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-card-foreground mb-1">{vote.title}</h4>
                    <p className="text-sm text-muted-foreground">{vote.description}</p>
                  </div>
                  <Badge variant="outline" className="border-warning text-warning">
                    {Math.ceil((new Date(vote.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">In Favor</span>
                    <span className="font-medium text-success">{vote.votesFor} votes</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full transition-all" 
                      style={{ width: `${(vote.votesFor / vote.totalMembers) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Against</span>
                    <span className="font-medium text-destructive">{vote.votesAgainst} votes</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-destructive rounded-full transition-all" 
                      style={{ width: `${(vote.votesAgainst / vote.totalMembers) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-success text-success hover:bg-success/10">
                    Vote Yes
                  </Button>
                  <Button variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10">
                    Vote No
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Documents Repository */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-card-foreground flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Shared Documents
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-card-foreground">Cooperative Constitution</p>
                  <p className="text-xs text-muted-foreground">Updated 3 months ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-card-foreground">Financial Report Q3 2025</p>
                  <p className="text-xs text-muted-foreground">Added 1 week ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-card-foreground">Best Practices Guide</p>
                  <p className="text-xs text-muted-foreground">Added 2 weeks ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            Upload Document
          </Button>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Announcements */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-card-foreground flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Announcements
          </h3>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-start gap-2 mb-2">
                  <Badge 
                    variant={announcement.priority === "high" ? "default" : "outline"}
                    className="text-xs"
                  >
                    {announcement.priority}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {new Date(announcement.date).toLocaleDateString()}
                  </p>
                </div>
                <h4 className="font-semibold text-sm mb-1 text-card-foreground">
                  {announcement.title}
                </h4>
                <p className="text-sm text-muted-foreground">{announcement.content}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Create Announcement
          </Button>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-card-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </h3>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                <h4 className="font-semibold text-sm mb-2 text-card-foreground">{event.title}</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-2">
                  RSVP
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
