import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuickTip {
  id: string;
  title: string;
  content: string;
  category: string;
  relevance_score: number;
}

interface QuickTipsProps {
  farmerId: string;
}

export const QuickTips = ({ farmerId }: QuickTipsProps) => {
  const [tips, setTips] = useState<QuickTip[]>([
    {
      id: '1',
      title: 'Optimal Planting Time',
      content: 'For maize in your region, the best planting time is early April when soil moisture is ideal.',
      category: 'Planting',
      relevance_score: 95
    },
    {
      id: '2',
      title: 'Pest Prevention',
      content: 'Mix neem leaves with water and spray weekly to prevent common pests naturally.',
      category: 'Pest Control',
      relevance_score: 88
    },
    {
      id: '3',
      title: 'Water Conservation',
      content: 'Mulching around plants reduces water needs by 50% during dry season.',
      category: 'Water Management',
      relevance_score: 82
    }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % tips.length);
  };

  const currentTip = tips[currentIndex];

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Daily Farming Tip
          </CardTitle>
          <Badge variant="secondary">{currentTip.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-lg mb-2">{currentTip.title}</h4>
          <p className="text-muted-foreground">{currentTip.content}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {tips.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex 
                      ? 'w-6 bg-primary' 
                      : 'w-1.5 bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} of {tips.length}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={nextTip}
            className="gap-2"
          >
            Next Tip
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};