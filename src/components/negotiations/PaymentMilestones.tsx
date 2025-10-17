import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface PaymentMilestonesProps {
  roomId: string;
}

interface Milestone {
  id: string;
  milestone_number: number;
  description: string;
  amount: number;
  due_date?: string;
  status: string;
  paid_at?: string;
  blockchain_tx_hash?: string;
}

export default function PaymentMilestones({ roomId }: PaymentMilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMilestones();
  }, [roomId]);

  const loadMilestones = async () => {
    const { data, error } = await supabase
      .from('payment_milestones')
      .select('*')
      .eq('room_id', roomId)
      .order('milestone_number');

    if (!error && data) {
      setMilestones(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>;

  if (milestones.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No payment milestones set yet
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h4 className="font-semibold text-sm mb-3">Payment Schedule</h4>
      {milestones.map((milestone) => (
        <Card key={milestone.id} className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                #{milestone.milestone_number}
              </Badge>
              <span className="text-sm font-medium">{milestone.description}</span>
            </div>
            
            {milestone.status === 'paid' ? (
              <Badge className="bg-green-500 text-white text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Paid
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 font-bold text-primary">
              <DollarSign className="h-4 w-4" />
              {milestone.amount.toLocaleString()}
            </div>

            {milestone.due_date && (
              <span className="text-xs text-muted-foreground">
                Due: {format(new Date(milestone.due_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>

          {milestone.blockchain_tx_hash && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                TX: <span className="font-mono">{milestone.blockchain_tx_hash.slice(0, 16)}...</span>
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
