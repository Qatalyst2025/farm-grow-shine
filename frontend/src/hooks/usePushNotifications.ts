import { useState, useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const setupPushNotifications = async () => {
      try {
        // Request permission
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          throw new Error('Push notification permission denied');
        }

        // Register for push notifications
        await PushNotifications.register();

        // Listen for registration
        await PushNotifications.addListener('registration', (token) => {
          setToken(token.value);
          setIsRegistered(true);
          toast({
            title: "Push notifications enabled",
            description: "You'll receive important updates",
          });
        });

        // Listen for errors
        await PushNotifications.addListener('registrationError', (error) => {
          console.error('Push notification error:', error);
        });

        // Listen for notifications
        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          toast({
            title: notification.title || 'Notification',
            description: notification.body || '',
          });
        });

        // Handle notification taps
        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification);
        });

      } catch (error) {
        console.error('Push notification setup error:', error);
      }
    };

    setupPushNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);

  const sendLocalNotification = async (title: string, body: string) => {
    try {
      await PushNotifications.createChannel({
        id: 'farm-alerts',
        name: 'Farm Alerts',
        description: 'Important farm updates',
        importance: 5,
        visibility: 1,
      });

      // Note: Local notifications require additional setup
      toast({
        title,
        description: body,
      });
    } catch (error) {
      console.error('Local notification error:', error);
    }
  };

  return {
    isRegistered,
    token,
    sendLocalNotification,
  };
};
