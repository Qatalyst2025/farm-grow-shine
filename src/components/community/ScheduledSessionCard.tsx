import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users, Video, CheckCircle2 } from "lucide-react";
import { format, formatDistanceToNow, isBefore, isAfter } from "date-fns";

interface ScheduledSessionCardProps {
  session: any;
  onJoin?: () => void;
}

export default function ScheduledSessionCard({
  session,
  onJoin,
}: ScheduledSessionCardProps) {
  const now = new Date();
  const start = new Date(session.scheduled_start);
  const end = new Date(session.scheduled_end);

  const isUpcoming = isAfter(start, now);
  const isLive = !isBefore(end, now) && !isAfter(start, now);
  const isCompleted = isBefore(end, now);

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <Badge className="bg-red-600 text-white">
          <span className="animate-pulse mr-1">●</span>
          LIVE NOW
        </Badge>
      );
    }
    if (isCompleted) {
      return (
        <Badge variant="outline">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        Upcoming
      </Badge>
    );
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-primary/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1">{session.title}</h3>
          {session.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {session.description}
            </p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>{format(start, "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>
            {format(start, "h:mm a")} - {format(end, "h:mm a")}
          </span>
        </div>
        {session.max_participants && (
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3" />
            <span>
              {session.current_participants}/{session.max_participants}{" "}
              participants
            </span>
          </div>
        )}
      </div>

      {isUpcoming && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            Starts {formatDistanceToNow(start, { addSuffix: true })}
          </p>
          <Button size="sm" className="w-full" disabled>
            <Calendar className="h-3 w-3 mr-2" />
            Add to Calendar
          </Button>
        </div>
      )}

      {isLive && (
        <div className="mt-3 pt-3 border-t">
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-red-600 to-pink-600"
            onClick={onJoin}
          >
            <Video className="h-3 w-3 mr-2" />
            Join Session Now
          </Button>
        </div>
      )}

      {isCompleted && session.recording_url && (
        <div className="mt-3 pt-3 border-t">
          <Button size="sm" variant="outline" className="w-full">
            <Video className="h-3 w-3 mr-2" />
            Watch Recording
          </Button>
        </div>
      )}
    </Card>
  );
}
