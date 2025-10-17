import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface KeystrokeData {
  key: string;
  timestamp: number;
  duration: number;
}

interface MouseData {
  x: number;
  y: number;
  timestamp: number;
  eventType: 'move' | 'click';
}

export const useBehavioralBiometrics = () => {
  const sessionId = useRef(uuidv4());
  const keystrokeData = useRef<KeystrokeData[]>([]);
  const mouseData = useRef<MouseData[]>([]);
  const keyDownTimes = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    let isTracking = true;

    // Track typing patterns
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTracking) return;
      keyDownTimes.current.set(e.key, Date.now());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isTracking) return;
      const downTime = keyDownTimes.current.get(e.key);
      if (downTime) {
        const duration = Date.now() - downTime;
        keystrokeData.current.push({
          key: e.key,
          timestamp: Date.now(),
          duration
        });
        keyDownTimes.current.delete(e.key);
      }
    };

    // Track mouse patterns
    const handleMouseMove = (e: MouseEvent) => {
      if (!isTracking) return;
      // Sample mouse movements (not every single movement)
      if (Math.random() < 0.1) {
        mouseData.current.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now(),
          eventType: 'move'
        });
      }
    };

    const handleMouseClick = (e: MouseEvent) => {
      if (!isTracking) return;
      mouseData.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
        eventType: 'click'
      });
    };

    // Collect device fingerprint
    const getDeviceFingerprint = () => {
      return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        touchSupport: 'ontouchstart' in window
      };
    };

    // Send biometric data periodically
    const sendBiometricData = async () => {
      if (keystrokeData.current.length === 0 && mouseData.current.length === 0) {
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate typing speed (WPM)
      const typingSpeed = keystrokeData.current.length > 0
        ? (keystrokeData.current.length / 5) / ((Date.now() - keystrokeData.current[0].timestamp) / 60000)
        : 0;

      // Calculate average key press duration
      const avgKeyDuration = keystrokeData.current.length > 0
        ? keystrokeData.current.reduce((sum, k) => sum + k.duration, 0) / keystrokeData.current.length
        : 0;

      // Calculate mouse movement patterns
      const mouseVelocity = mouseData.current.length > 1
        ? mouseData.current.slice(1).reduce((sum, curr, i) => {
            const prev = mouseData.current[i];
            const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
            const time = (curr.timestamp - prev.timestamp) / 1000;
            return sum + (time > 0 ? distance / time : 0);
          }, 0) / (mouseData.current.length - 1)
        : 0;

      const biometricData = {
        typing: {
          speed: typingSpeed,
          avgKeyDuration,
          keystrokeCount: keystrokeData.current.length
        },
        mouse: {
          avgVelocity: mouseVelocity,
          clickCount: mouseData.current.filter(m => m.eventType === 'click').length,
          totalMoves: mouseData.current.length
        },
        session: {
          duration: Date.now() - (keystrokeData.current[0]?.timestamp || Date.now()),
          activityLevel: (keystrokeData.current.length + mouseData.current.length) / 100
        }
      };

      // Simple anomaly detection
      const riskScore = calculateRiskScore(biometricData);

      try {
        await supabase.from('behavioral_biometrics').insert({
          user_id: user.id,
          session_id: sessionId.current,
          biometric_type: 'typing',
          biometric_data: biometricData,
          device_fingerprint: getDeviceFingerprint(),
          risk_score: riskScore,
          anomaly_detected: riskScore > 70
        });
      } catch (error) {
        console.error('Error sending biometric data:', error);
      }

      // Clear buffers
      keystrokeData.current = [];
      mouseData.current = [];
    };

    // Calculate risk score based on biometric patterns
    const calculateRiskScore = (data: any): number => {
      let score = 0;

      // Unusual typing speed (too fast or too slow)
      if (data.typing.speed > 100 || data.typing.speed < 20) score += 20;

      // Unusual key press duration
      if (data.typing.avgKeyDuration < 50 || data.typing.avgKeyDuration > 500) score += 15;

      // Unusual mouse velocity
      if (data.mouse.avgVelocity > 1000 || data.mouse.avgVelocity < 50) score += 15;

      // Low activity (possible bot)
      if (data.session.activityLevel < 0.1) score += 30;

      // Very high activity (possible automation)
      if (data.session.activityLevel > 5) score += 25;

      return Math.min(100, score);
    };

    // Send data every 30 seconds
    const interval = setInterval(sendBiometricData, 30000);

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleMouseClick);

    // Send final data before unload
    const handleBeforeUnload = () => {
      isTracking = false;
      sendBiometricData();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isTracking = false;
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendBiometricData();
    };
  }, []);

  return { sessionId: sessionId.current };
};