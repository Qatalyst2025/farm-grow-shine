import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WisdomPointsCardProps {
  roomId: string;
}

export default function WisdomPointsCard({ roomId }: WisdomPointsCardProps) {
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState<string>('Seedling');

  useEffect(() => {
    loadWisdomPoints();
  }, [roomId]);

  const loadWisdomPoints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('chat_members')
      .select('wisdom_points')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setPoints(data.wisdom_points || 0);
      setRank(getRank(data.wisdom_points || 0));
    }
  };

  const getRank = (points: number): string => {
    if (points >= 100) return 'Wisdom Elder';
    if (points >= 50) return 'Master Farmer';
    if (points >= 25) return 'Experienced Grower';
    if (points >= 10) return 'Growing Farmer';
    return 'Seedling';
  };

  const getRankColor = (rank: string): string => {
    switch (rank) {
      case 'Wisdom Elder': return 'from-yellow-500 to-orange-500';
      case 'Master Farmer': return 'from-purple-500 to-pink-500';
      case 'Experienced Grower': return 'from-blue-500 to-cyan-500';
      case 'Growing Farmer': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <Card className={`p-3 bg-gradient-to-br ${getRankColor(rank)} text-white border-0 shadow-lg`}>
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5" />
        <div>
          <p className="text-xs font-medium">{rank}</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <p className="text-lg font-bold">{points}</p>
            <span className="text-xs opacity-90">pts</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
