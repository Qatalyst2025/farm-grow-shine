import { useState, useCallback, useRef } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0 && startY.current > 0) {
      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);
      
      if (distance > 0) {
        setPullDistance(Math.min(distance, threshold * 1.5));
        setIsPulling(distance > threshold);
      }
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
    
    startY.current = 0;
    currentY.current = 0;
  }, [pullDistance, isRefreshing, onRefresh]);

  const rotation = (pullDistance / threshold) * 360;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-auto h-full"
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isRefreshing ? 'transform 0.3s' : 'none'
      }}
    >
      {/* Pull Indicator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance / threshold,
          transition: 'opacity 0.2s'
        }}
      >
        <div className={`flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 ${
          isRefreshing ? 'animate-spin' : ''
        }`}>
          <RefreshCw 
            className="h-5 w-5 text-primary"
            style={{
              transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
              transition: 'transform 0.1s'
            }}
          />
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};
