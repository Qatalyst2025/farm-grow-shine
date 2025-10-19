import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PartyPopper, Trophy, TrendingUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Milestone {
  id: string;
  type: 'achievement' | 'learning' | 'harvest' | 'revenue';
  title: string;
  description: string;
  points?: number;
}

interface MilestoneCelebrationProps {
  milestone: Milestone | null;
  onClose: () => void;
}

export const MilestoneCelebration = ({ milestone, onClose }: MilestoneCelebrationProps) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (milestone) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5
      }));
      setConfetti(pieces);
    }
  }, [milestone]);

  const getIcon = () => {
    switch (milestone?.type) {
      case 'achievement': return Trophy;
      case 'learning': return Award;
      case 'harvest': return TrendingUp;
      case 'revenue': return PartyPopper;
      default: return Trophy;
    }
  };

  const Icon = getIcon();

  if (!milestone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="max-w-md relative overflow-hidden">
            {/* Confetti animation */}
            <div className="absolute inset-0 pointer-events-none">
              {confetti.map((piece) => (
                <motion.div
                  key={piece.id}
                  className="absolute w-2 h-2 bg-primary rounded-full"
                  initial={{ 
                    x: `${piece.x}%`, 
                    y: -20,
                    rotate: 0,
                    opacity: 1
                  }}
                  animate={{ 
                    y: '100vh',
                    rotate: 360,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 2,
                    delay: piece.delay,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>

            <CardContent className="p-8 text-center relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring',
                  delay: 0.2,
                  duration: 0.6
                }}
                className="mb-6"
              >
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center">
                  <Icon className="h-10 w-10 text-primary-foreground" />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold mb-2">
                  🎉 Congratulations!
                </h2>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {milestone.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {milestone.description}
                </p>

                {milestone.points && (
                  <div className="bg-primary/10 rounded-lg p-4 mb-6">
                    <p className="text-sm text-muted-foreground">Points Earned</p>
                    <p className="text-3xl font-bold text-primary">
                      +{milestone.points}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Button onClick={onClose} className="w-full">
                    Continue Growing! 🌱
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Keep up the great work! Your dedication is making a difference.
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};