import { useState, useEffect } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { useToast } from '@/hooks/use-toast';

export const useGeolocation = () => {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getCurrentPosition = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check and request permissions
      const permission = await Geolocation.checkPermissions();
      
      if (permission.location === 'denied') {
        const newPermission = await Geolocation.requestPermissions();
        if (newPermission.location === 'denied') {
          throw new Error('Location permission denied');
        }
      }

      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      setPosition(coordinates);
      return coordinates;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to get location';
      setError(errorMessage);
      toast({
        title: "Location error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const watchPosition = (callback: (position: Position) => void) => {
    const watchId = Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      },
      (position, err) => {
        if (err) {
          console.error('Watch position error:', err);
          return;
        }
        if (position) {
          setPosition(position);
          callback(position);
        }
      }
    );

    return watchId;
  };

  const clearWatch = async (watchId: string) => {
    await Geolocation.clearWatch({ id: watchId });
  };

  return {
    position,
    loading,
    error,
    getCurrentPosition,
    watchPosition,
    clearWatch
  };
};
